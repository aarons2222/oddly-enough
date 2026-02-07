import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTENT_CACHE_PREFIX = 'oddly_content_';
const CONTENT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedContent {
  content: string;
  timestamp: number;
}

// In-memory cache for faster access (capped to prevent unbounded growth)
const MAX_MEMORY_CACHE = 20;
const memoryContentCache: Map<string, string> = new Map();

export async function getCachedContent(articleUrl: string): Promise<string | null> {
  // Check memory first
  if (memoryContentCache.has(articleUrl)) {
    return memoryContentCache.get(articleUrl) || null;
  }
  
  try {
    const key = CONTENT_CACHE_PREFIX + encodeURIComponent(articleUrl);
    const cached = await AsyncStorage.getItem(key);
    
    if (!cached) return null;
    
    const data: CachedContent = JSON.parse(cached);
    
    // Check TTL
    if (Date.now() - data.timestamp > CONTENT_TTL) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    // Store in memory for faster subsequent access
    memoryContentCache.set(articleUrl, data.content);
    
    return data.content;
  } catch (error) {
    console.error('Error reading content cache:', error);
    return null;
  }
}

export async function setCachedContent(articleUrl: string, content: string): Promise<void> {
  try {
    const key = CONTENT_CACHE_PREFIX + encodeURIComponent(articleUrl);
    const data: CachedContent = {
      content,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(data));
    
    // Evict oldest entry if memory cache is full
    if (memoryContentCache.size >= MAX_MEMORY_CACHE) {
      const firstKey = memoryContentCache.keys().next().value;
      if (firstKey) memoryContentCache.delete(firstKey);
    }
    memoryContentCache.set(articleUrl, content);
  } catch (error) {
    console.error('Error writing content cache:', error);
  }
}

// Clear all cached content
export async function clearContentCache(): Promise<number> {
  let cleared = 0;
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const contentKeys = allKeys.filter(key => key.startsWith(CONTENT_CACHE_PREFIX));
    
    if (contentKeys.length > 0) {
      await AsyncStorage.multiRemove(contentKeys);
      cleared = contentKeys.length;
    }
    
    // Also clear memory cache
    memoryContentCache.clear();
    
    console.log(`Cleared ${cleared} cached articles`);
  } catch (error) {
    console.error('Error clearing content cache:', error);
  }
  return cleared;
}

// Preload content for multiple articles (limited to top 10 for performance)
export async function preloadArticleContent(
  articleUrls: string[],
  apiUrl: string
): Promise<void> {
  // Only preload top 10 articles
  const urlsToCheck = articleUrls.slice(0, 10);
  const uncachedUrls = [];
  
  // Check which ones need fetching
  for (const url of urlsToCheck) {
    const cached = await getCachedContent(url);
    if (!cached) {
      uncachedUrls.push(url);
    }
  }
  
  if (uncachedUrls.length === 0) {
    return;
  }
  
  // Fetch in parallel (limit to 5 at a time) with per-fetch timeout
  const batchSize = 5;
  for (let i = 0; i < uncachedUrls.length; i += batchSize) {
    const batch = uncachedUrls.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (articleUrl) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(
          `${apiUrl}/api/content?url=${encodeURIComponent(articleUrl)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            await setCachedContent(articleUrl, data.content);
          }
        }
      } catch (error) {
        clearTimeout(timeout);
        // Failed to preload silently
      }
    }));
  }
}
