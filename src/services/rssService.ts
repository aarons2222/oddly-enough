import { Article, Category } from '../types/Article';

// RSS Feed URLs - focused on quirky/odd content
const RSS_FEEDS: { url: string; category: Category; source: string; alwaysOdd?: boolean }[] = [
  // === DEDICATED WEIRD NEWS (always odd) ===
  { url: 'https://rss.upi.com/news/odd_news.rss', category: 'viral', source: 'UPI Odd', alwaysOdd: true },
  { url: 'https://metro.co.uk/tag/weird/feed/', category: 'viral', source: 'Metro', alwaysOdd: true },
  { url: 'https://www.mirror.co.uk/news/weird-news/rss.xml', category: 'viral', source: 'Mirror', alwaysOdd: true },
  { url: 'https://www.dailystar.co.uk/news/weird-news/rss.xml', category: 'viral', source: 'Daily Star', alwaysOdd: true },
  { url: 'https://www.ladbible.com/feeds/weird', category: 'viral', source: 'LADbible', alwaysOdd: true },
  { url: 'https://www.odditycentral.com/feed', category: 'viral', source: 'Oddity Central', alwaysOdd: true },
  { url: 'https://www.atlasobscura.com/feeds/latest', category: 'world', source: 'Atlas Obscura', alwaysOdd: true },
  
  // === TECH (quirky takes) ===
  { url: 'https://www.theregister.com/offbeat/headlines.atom', category: 'tech', source: 'The Register', alwaysOdd: true },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech', source: 'Ars Technica' },
  
  // === BBC (filter for odd stories) ===
  { url: 'https://feeds.bbci.co.uk/news/england/rss.xml', category: 'viral', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'animals', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sport', source: 'BBC Sport' },
  
  // === ANIMALS ===
  { url: 'https://www.thedodo.com/rss', category: 'animals', source: 'The Dodo', alwaysOdd: true },
  
  // === FOOD ===
  { url: 'https://www.foodbeast.com/feed/', category: 'food', source: 'Foodbeast', alwaysOdd: true },
  
  // === WORLD ===
  { url: 'https://www.theguardian.com/world/rss', category: 'world', source: 'Guardian' },
  { url: 'https://boingboing.net/feed', category: 'viral', source: 'Boing Boing', alwaysOdd: true },
];

// CORS proxy for web
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  thumbnail?: string;
}

async function fetchRSS(feedUrl: string): Promise<RSSItem[]> {
  try {
    const url = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
    const response = await fetch(url);
    const text = await response.text();
    
    const items: RSSItem[] = [];
    const itemMatches = text.match(/<item>[\s\S]*?<\/item>/g) || 
                        text.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    
    for (const itemXml of itemMatches.slice(0, 20)) {
      const title = extractTag(itemXml, 'title');
      const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'summary');
      const link = extractTag(itemXml, 'link') || extractAttr(itemXml, 'link', 'href');
      const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published');
      const thumbnail = extractAttr(itemXml, 'media:thumbnail', 'url') ||
                       extractAttr(itemXml, 'enclosure', 'url');
      
      if (title && link) {
        items.push({
          title: cleanText(title),
          description: cleanText(description || ''),
          link: cleanLink(link),
          pubDate: pubDate || new Date(Date.now() - 86400000).toISOString(), // Default to 24h ago if no date
          thumbnail,
        });
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error fetching RSS from ${feedUrl}:`, error);
    return [];
  }
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : null;
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanLink(link: string): string {
  return link.split('?at_medium=')[0].trim();
}

// STRICT filter - must match these patterns to be "odd" news
const ODD_PATTERNS = [
  // Animals doing weird things
  /\b(seal|raccoon|snake|donkey|capybara|kangaroo|dog|cat|goat|pig|chicken|parrot|squirrel|fox|deer|bear|monkey|elephant|octopus|penguin|otter|hedgehog|hamster|llama|alpaca|sloth|crocodile|alligator|shark|whale|dolphin|owl|crow|raven|frog|turtle|tortoise)\b/i,
  /\b(animal|pet|wildlife|creature)\b.*\b(unusual|bizarre|strange|surprise|rescue|escape|viral|hero)/i,
  
  // World records / achievements
  /\b(world record|guinness|youngest|oldest|largest|smallest|longest|shortest|fastest|first ever|most|tallest)\b/i,
  
  // Viral / internet culture
  /\b(viral|goes viral|internet|meme|tiktok|reddit|twitter|trending|broke the internet)\b/i,
  /\b(hilarious|bizarre|weird|strange|unusual|oddly|quirky|wacky|bonkers|mad|crazy|insane|unbelievable|incredible)\b/i,
  
  // Lucky/unlucky events
  /\b(lottery|jackpot|win|winner|found|discover|stumble|luck|fortune)\b.*\b(million|fortune|treasure|rare|hidden|incredible)/i,
  /\b(miracle|coincidence|one in a million|against all odds)\b/i,
  
  // Fails and mishaps  
  /\b(fail|glitch|mistake|error|blunder|oops|wrong|accident|backfire|disaster)\b/i,
  /\b(ai|chatbot|robot|drone|tesla|self.driving)\b.*\b(fail|wrong|bizarre|weird|funny|chaos)/i,
  
  // Food oddities
  /\b(food|meal|dish|recipe|restaurant|cafe|pizza|burger|chips|sandwich)\b.*\b(bizarre|weird|unusual|strange|viral|giant|tiny|expensive|disgusting)/i,
  
  // Property oddities
  /\b(house|home|flat|property|mansion|castle|shed)\b.*\b(bizarre|weird|unusual|hidden|secret|discover|found|tiny|underground)/i,
  /\b(pirate ship|treehouse|cave|bunker|unusual home|shipping container|bus|van life)\b/i,
  
  // Crime but funny/odd
  /\b(thief|robber|criminal|caught|arrested|police)\b.*\b(bizarre|funny|unusual|stupid|fail|hilarious|dumb)/i,
  /\b(florida man|florida woman)\b/i,
  
  // Sport oddities
  /\b(sport|football|cricket|tennis|golf|darts|snooker)\b.*\b(bizarre|weird|unusual|record|youngest|oldest|freak|accident)/i,
  /\btoddler\b.*\b(sport|pool|snooker|golf|prodigy)/i,
  
  // General oddity triggers
  /you won't believe/i,
  /can't stop laughing/i,
  /broke the internet/i,
  /left speechless/i,
  /jaw.drop/i,
  /mind.blown/i,
  /what happens next/i,
  /plot twist/i,
  /turns out/i,
  /mystery|mysterious/i,
  /unexplained|inexplicable/i,
  /haunted|ghost|paranormal|ufo|alien/i,
  /prank|prankster/i,
  /revenge|petty/i,
  /karen|entitled/i,
  /wholesome|heartwarming|adorable|cute|sweet/i,
];

// Exclude boring news
const BORING_PATTERNS = [
  /\b(killed|murdered|dead|death|died|fatal|war|conflict|attack|terror|crisis)\b/i,
  /\b(government|minister|parliament|election|vote|policy|budget)\b/i,
  /\b(stock|market|economy|inflation|recession|bank|finance)\b/i,
  /\b(weather|forecast|rain|snow|temperature|flood)\b(?!.*bizarre|weird|unusual)/i,
  /\b(match|score|defeat|victory|league|championship|premier league|champions league)\b(?!.*record|bizarre|youngest|oldest)/i,
];

function isOddNews(title: string, description: string): boolean {
  const text = `${title} ${description}`;
  
  // Reject boring news first
  if (BORING_PATTERNS.some(pattern => pattern.test(text))) {
    return false;
  }
  
  // Must match at least one odd pattern
  return ODD_PATTERNS.some(pattern => pattern.test(text));
}

function scoreOddness(title: string, description: string): number {
  const text = `${title} ${description}`;
  let score = 0;
  
  if (BORING_PATTERNS.some(pattern => pattern.test(text))) {
    return -100;
  }
  
  ODD_PATTERNS.forEach(pattern => {
    if (pattern.test(text)) score += 10;
  });
  
  return score;
}

export async function fetchArticlesFromRSS(category: Category = 'all'): Promise<Article[]> {
  const allArticles: Article[] = [];
  const feedsToFetch = category === 'all' 
    ? RSS_FEEDS 
    : RSS_FEEDS.filter(f => f.category === category);
  
  const fetchPromises = feedsToFetch.map(async (feed) => {
    const items = await fetchRSS(feed.url);
    
    // Filter for odd news (unless feed is marked as always odd)
    const filteredItems = feed.alwaysOdd 
      ? items.slice(0, 12) // Take top 12 from "always odd" feeds
      : items.filter(item => isOddNews(item.title, item.description)).slice(0, 10);
    
    const articles: Article[] = filteredItems.map((item, index) => {
      let imageUrl = item.thumbnail 
        ? item.thumbnail.replace('/240/', '/800/').replace('/standard/', '/1200/').replace('/ace/standard/', '/ace/branded_news/1200/')
        : null;
      
      return {
        id: `${feed.source.replace(/\s/g, '-')}-${Date.now()}-${index}`,
        title: item.title,
        summary: item.description.slice(0, 200) + (item.description.length > 200 ? '...' : ''),
        url: item.link,
        imageUrl,
        source: feed.source,
        category: feed.category,
        publishedAt: new Date(item.pubDate),
        _oddScore: scoreOddness(item.title, item.description),
      };
    });
    
    return articles;
  });
  
  const results = await Promise.all(fetchPromises);
  results.forEach(articles => allArticles.push(...articles));
  
  // Sort by date (newest first), oddness is just for filtering
  allArticles.sort((a: any, b: any) => {
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
  
  // Fetch og:image for articles without thumbnails
  const articlesNeedingImages = allArticles.filter(a => !a.imageUrl);
  
  await Promise.all(articlesNeedingImages.slice(0, 10).map(async (article) => {
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(article.url)}`;
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
      const html = await response.text();
      
      // Look for og:image
      const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) ||
                     html.match(/content="([^"]+)"\s+property="og:image"/i) ||
                     html.match(/name="twitter:image"\s+content="([^"]+)"/i);
      
      if (ogMatch && ogMatch[1]) {
        article.imageUrl = ogMatch[1];
      }
    } catch {
      // Ignore fetch errors
    }
  }));
  
  return allArticles.slice(0, 50);
}
