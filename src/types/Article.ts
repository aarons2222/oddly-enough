export interface Article {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  imageUrl?: string | null;
  additionalImages?: string[];
  source: string;
  category: Category;
  publishedAt: Date;
  isBookmarked?: boolean;
}

export type Category = 
  | 'all'
  | 'animals'
  | 'crime'
  | 'culture'
  | 'florida-man'
  | 'food'
  | 'mystery'
  | 'nature'
  | 'science'
  | 'sports'
  | 'tech'
  | 'viral'
  | 'world';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: Category;
  country: 'uk' | 'world';
}

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'The Lot', emoji: '✨' },
  { id: 'animals', label: 'Beasts', emoji: '🦔' },
  { id: 'viral', label: 'Bangers', emoji: '🔥' },
  { id: 'florida-man', label: 'Florida Man', emoji: '🐊' },
  { id: 'science', label: 'Mad Science', emoji: '🧪' },
  { id: 'mystery', label: 'Huh?', emoji: '👽' },
  { id: 'sports', label: 'Mad Lads', emoji: '🏆' },
  { id: 'tech', label: 'Bots & Bytes', emoji: '🤖' },
  { id: 'crime', label: 'Busted', emoji: '🚨' },
  { id: 'food', label: 'Grub', emoji: '🍕' },
  { id: 'nature', label: 'Wild', emoji: '🌿' },
  { id: 'culture', label: 'People', emoji: '🎭' },
  { id: 'world', label: 'Far Out', emoji: '🌍' },
];
