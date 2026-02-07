import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types/Article';

const CACHE_KEY = 'oddly_articles_v2'; // Single atomic key (v2 = new format)
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export interface CachedData {
  articles: Article[];
  timestamp: number;
}

export async function getCachedArticles(): Promise<Article[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    
    const { articles, timestamp } = JSON.parse(raw);
    
    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_TTL) {
      return null; // Cache expired
    }
    
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
    // Single atomic write — articles + timestamp together
    const data = JSON.stringify({ articles, timestamp: Date.now() });
    await AsyncStorage.setItem(CACHE_KEY, data);
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export async function getCacheInfo(): Promise<{ cached: boolean; age: number | null }> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return { cached: false, age: null };
    
    const { timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;
    return { cached: true, age };
  } catch {
    return { cached: false, age: null };
  }
}
