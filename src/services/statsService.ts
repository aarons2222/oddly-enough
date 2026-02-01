// Stats service - track views and reactions, fetch social proof data

const API_URL = 'https://oddly-enough-api.vercel.app';

export interface ArticleStats {
  views: number;
  reactions: {
    '🤯': number;
    '😂': number;
    '🤮': number;
  };
}

// Track a view or reaction
export async function trackEvent(
  articleId: string, 
  event: 'view' | 'reaction', 
  reaction?: '🤯' | '😂' | '🤮'
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, event, reaction }),
    });
  } catch (error) {
    // Silent fail - don't break UX for tracking
    console.warn('Track failed:', error);
  }
}

// Fetch stats for multiple articles
export async function fetchStats(articleIds: string[]): Promise<Record<string, ArticleStats>> {
  if (articleIds.length === 0) return {};
  
  try {
    const response = await fetch(`${API_URL}/api/stats?ids=${articleIds.join(',')}`);
    const data = await response.json();
    return data.stats || {};
  } catch (error) {
    console.warn('Stats fetch failed:', error);
    return {};
  }
}

// Format view count for display
export function formatViews(views: number): string {
  if (views < 1000) return `${views}`;
  if (views < 10000) return `${(views / 1000).toFixed(1)}k`;
  return `${Math.floor(views / 1000)}k`;
}

// Get dominant reaction
export function getDominantReaction(reactions: ArticleStats['reactions']): { emoji: string; percent: number } | null {
  const total = reactions['🤯'] + reactions['😂'] + reactions['🤮'];
  if (total === 0) return null;
  
  const entries = Object.entries(reactions) as [string, number][];
  const [emoji, count] = entries.reduce((a, b) => b[1] > a[1] ? b : a);
  
  return {
    emoji,
    percent: Math.round((count / total) * 100),
  };
}
