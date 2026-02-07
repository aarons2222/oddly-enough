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
  | 'bangers'
  | 'beasts'
  | 'bots'
  | 'busted'
  | 'far-out'
  | 'grub'
  | 'huh'
  | 'legends'
  | 'mad-science'
  | 'oops';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: Category;
  country: 'uk' | 'world';
}

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'The Lot', emoji: '✨' },
  { id: 'bangers', label: 'Bangers', emoji: '🔥' },
  { id: 'beasts', label: 'Beasts', emoji: '🦔' },
  { id: 'oops', label: 'Oops', emoji: '🤦' },
  { id: 'legends', label: 'Legends', emoji: '🏆' },
  { id: 'huh', label: 'Huh?', emoji: '👽' },
  { id: 'mad-science', label: 'Mad Science', emoji: '🧪' },
  { id: 'busted', label: 'Busted', emoji: '🚨' },
  { id: 'grub', label: 'Grub', emoji: '🍕' },
  { id: 'bots', label: 'Bots', emoji: '🤖' },
  { id: 'far-out', label: 'Far Out', emoji: '🌍' },
];
