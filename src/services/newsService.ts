import { Article, Category } from '../types/Article';
import { fetchArticlesFromAPI, refreshArticles as apiRefresh } from './apiService';
import { getCachedArticles, setCachedArticles } from './cacheService';

// Fallback articles if API and cache both fail
const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'fallback-1',
    title: "Seal Pup Found in Cornwall Garden After Storm",
    summary: "A seal pup escaped rough seas, crossed the coastal path, and ended up beside a chicken coop.",
    url: 'https://www.bbc.co.uk/news/articles/c99k2m78dl2o',
    imageUrl: 'https://ichef.bbci.co.uk/ace/branded_news/1200/cpsprodpb/86c1/live/33837de0-fd28-11f0-890b-55ca0a00c59d.jpg',
    source: 'BBC',
    category: 'animals',
    publishedAt: new Date('2026-01-31'),
  },
  {
    id: 'fallback-2',
    title: "Raccoon Stows Away to Belarus in Shipped Car",
    summary: "Customs found a raccoon napping on the dashboard. He's now named Senya and loves eggs.",
    url: 'https://www.upi.com/Odd_News/2026/01/30/belarus-raccoon-stowaway-shipped/7831769792654/',
    imageUrl: 'https://cdnph.upi.com/ph/st/th/7831769792654/2026/i/17697927912453/v1.5/Raccoon-stows-away-to-Belarus-in-shipped-car.jpg?lg=5',
    source: 'UPI',
    category: 'animals',
    publishedAt: new Date('2026-01-30'),
  },
  {
    id: 'fallback-3',
    title: "Dad Buys Pirate Ship on eBay for £500, Lives in It",
    summary: "Sam Griffiss, 35, converted an eBay pirate ship into an off-grid home by the River Severn.",
    url: 'https://www.mirror.co.uk/news/weird-news/dad-buys-pirate-ship-ebay-36634191',
    imageUrl: 'https://i2-prod.mirror.co.uk/article36635314.ece/ALTERNATES/s1200/622779517_10162341983697843_2559324211036302931_n.jpg',
    source: 'Mirror',
    category: 'culture',
    publishedAt: new Date('2026-01-29'),
  },
];

let memoryCache: Article[] | null = null;

// Helper to add timeout to any promise
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

export async function fetchArticles(category: Category = 'all'): Promise<Article[]> {
  console.log('[newsService] fetchArticles called, category:', category);
  
  // 1. Try memory cache first (fastest)
  if (memoryCache && memoryCache.length > 0) {
    console.log('[newsService] Using memory cache:', memoryCache.length, 'articles');
    return filterByCategory(memoryCache, category);
  }
  
  // 2. Try local storage cache (with timeout - AsyncStorage can hang on native)
  console.log('[newsService] Checking local storage cache...');
  try {
    const cachedArticles = await withTimeout(getCachedArticles(), 2000, null);
    if (cachedArticles && cachedArticles.length > 0) {
      console.log('[newsService] Using local cache:', cachedArticles.length, 'articles');
      memoryCache = cachedArticles;
      
      // Refresh in background
      fetchFromAPIInBackground();
      
      return filterByCategory(cachedArticles, category);
    }
  } catch (e) {
    console.log('[newsService] Cache check failed, continuing to API');
  }
  
  // 3. Try API (apiService has its own 8s timeout via AbortController)
  console.log('[newsService] No cache, fetching from API...');
  try {
    const articles = await fetchArticlesFromAPI(category === 'all' ? 'all' : category);
    console.log('[newsService] API returned:', articles?.length, 'articles');
    
    if (articles && articles.length > 0) {
      memoryCache = articles;
      // Don't await cache write - do it in background
      setCachedArticles(articles).catch(() => {});
      return filterByCategory(articles, category);
    }
  } catch (error) {
    console.error('[newsService] API fetch failed:', error);
  }
  
  // 4. Last resort: fallback articles
  console.log('[newsService] Using fallback articles');
  return filterByCategory(FALLBACK_ARTICLES, category);
}

async function fetchFromAPIInBackground(): Promise<void> {
  try {
    const articles = await fetchArticlesFromAPI('all');
    if (articles.length > 0) {
      memoryCache = articles;
      await setCachedArticles(articles);
    }
  } catch (error) {
    // Background refresh failed silently
  }
}

function filterByCategory(articles: Article[], category: Category): Article[] {
  let filtered = category === 'all' 
    ? articles 
    : articles.filter(a => a.category === category);
  
  // Ensure all dates are valid Date objects and sort by date (newest first)
  return filtered
    .map(a => ({
      ...a,
      publishedAt: a.publishedAt instanceof Date && !isNaN(a.publishedAt.getTime()) 
        ? a.publishedAt 
        : new Date(a.publishedAt)
    }))
    .filter(a => !isNaN(a.publishedAt.getTime())) // Remove invalid dates
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  const articles = memoryCache || FALLBACK_ARTICLES;
  return articles.find(a => a.id === id) || null;
}

export async function refreshArticles(): Promise<Article[]> {
  try {
    const articles = await apiRefresh();
    memoryCache = articles;
    await setCachedArticles(articles);
    return articles;
  } catch (error) {
    console.error('Refresh failed:', error);
    return memoryCache || FALLBACK_ARTICLES;
  }
}

// Check if we have offline data available
export async function hasOfflineData(): Promise<boolean> {
  const cached = await getCachedArticles();
  return cached !== null && cached.length > 0;
}
