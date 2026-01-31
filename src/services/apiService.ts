import { Article, Category } from '../types/Article';

// API URL - Vercel production
const API_URL = 'https://oddly-enough-api.vercel.app';

export async function fetchArticlesFromAPI(category: Category = 'all'): Promise<Article[]> {
  try {
    const url = `${API_URL}/api/articles${category !== 'all' ? `?category=${category}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert date strings to Date objects
    return data.articles.map((article: any) => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    }));
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

export async function fetchCategories(): Promise<{ id: Category; label: string; emoji: string }[]> {
  try {
    const response = await fetch(`${API_URL}/api/categories`);
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Categories fetch error:', error);
    throw error;
  }
}

export async function refreshArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${API_URL}/api/articles?refresh=true`);
    const data = await response.json();
    
    return data.articles.map((article: any) => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    }));
  } catch (error) {
    console.error('Refresh error:', error);
    throw error;
  }
}
