import { Article, Category } from '../types/Article';

// API URL - Vercel production
const API_URL = 'https://oddly-enough-api.vercel.app';

export async function fetchArticlesFromAPI(category: Category = 'all'): Promise<Article[]> {
  const url = `${API_URL}/api/articles${category !== 'all' ? `?category=${category}` : ''}`;
  console.log('[apiService] Fetching:', url);
  
  // 8 second timeout - Vercel can be slow on cache miss
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    console.log('[apiService] Response status:', response.status);
    console.log('[apiService] Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[apiService] Error response body:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const text = await response.text();
    console.log('[apiService] Raw response length:', text.length);
    console.log('[apiService] Raw response preview:', text.slice(0, 200));
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[apiService] JSON parse failed:', parseError);
      throw new Error('Failed to parse API response as JSON');
    }
    
    console.log('[apiService] Parsed data keys:', Object.keys(data));
    console.log('[apiService] Articles count:', data.articles?.length);
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('[apiService] No articles array in response:', data);
      throw new Error('API response missing articles array');
    }
    
    // Convert date strings to Date objects
    const articles = data.articles.map((article: any) => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    }));
    
    console.log('[apiService] Returning', articles.length, 'articles');
    return articles;
  } catch (error) {
    clearTimeout(timeout);
    console.error('[apiService] Fetch error:', error);
    console.error('[apiService] Error name:', (error as Error).name);
    console.error('[apiService] Error message:', (error as Error).message);
    throw error;
  }
}

export async function fetchCategories(): Promise<{ id: Category; label: string; emoji: string }[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(`${API_URL}/api/categories`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!response.ok) throw new Error(`Categories error: ${response.status}`);
    
    const data = await response.json();
    return data.categories;
  } catch (error) {
    clearTimeout(timeout);
    console.error('Categories fetch error:', error);
    throw error;
  }
}

export async function refreshArticles(): Promise<Article[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(`${API_URL}/api/articles?refresh=true`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);
    
    const data = await response.json();
    return data.articles.map((article: any) => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    }));
  } catch (error) {
    clearTimeout(timeout);
    console.error('Refresh error:', error);
    throw error;
  }
}
