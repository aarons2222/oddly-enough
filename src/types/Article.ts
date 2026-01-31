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
  | 'british'
  | 'crime'
  | 'fails'
  | 'food'
  | 'mystery'
  | 'property'
  | 'viral'
  | 'world'
  | 'sport'
  | 'tech';

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
  { id: 'fails', label: 'Oops', emoji: '🤦' },
  { id: 'british', label: 'Blighty', emoji: '🇬🇧' },
  { id: 'mystery', label: 'Huh?', emoji: '👽' },
  { id: 'sport', label: 'Mad Lads', emoji: '🏆' },
  { id: 'tech', label: 'Bots & Bytes', emoji: '🤖' },
  { id: 'property', label: 'Cribs', emoji: '🏠' },
  { id: 'food', label: 'Grub', emoji: '🍕' },
  { id: 'crime', label: 'Busted', emoji: '🚨' },
  { id: 'world', label: 'Far Out', emoji: '🌍' },
];
