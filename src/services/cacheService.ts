import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types/Article';

const CACHE_KEY = 'oddly_articles_cache';
const CACHE_TIMESTAMP_KEY = 'oddly_cache_timestamp';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedData {
  articles: Article[];
  timestamp: number;
}

export async function getCachedArticles(): Promise<Article[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const cacheTime = parseInt(timestamp, 10);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - cacheTime > CACHE_TTL) {
      // Cache expired
      return null;
    }
    
    const articles = JSON.parse(cached);
    
    // Convert date strings back to Date objects
    return articles.map((a: any) => ({
      ...a,
      publishedAt: new Date(a.publishedAt),
    }));
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export async function setCachedArticles(articles: Article[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    // Articles cached
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
    // Cache cleared
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export async function getCacheInfo(): Promise<{ cached: boolean; age: number | null }> {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return { cached: false, age: null };
    
    const age = Date.now() - parseInt(timestamp, 10);
    return { cached: true, age };
  } catch {
    return { cached: false, age: null };
  }
}
