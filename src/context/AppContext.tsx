import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types/Article';

type FontSize = 'small' | 'medium' | 'large';
type DarkModePreference = 'light' | 'dark' | 'auto';

interface AppContextType {
  isDarkMode: boolean;
  darkModePreference: DarkModePreference;
  setDarkModePreference: (pref: DarkModePreference) => void;
  toggleDarkMode: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontScale: number;
  chaosMode: boolean;
  setChaosMode: (enabled: boolean) => void;
  bugsEnabled: boolean;
  setBugsEnabled: (enabled: boolean) => void;
  bookmarks: Article[];
  addBookmark: (article: Article) => void;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
  reactions: { [articleId: string]: string };
  setReaction: (articleId: string, emoji: string) => void;
  getReaction: (articleId: string) => string | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Check if it's "night time" (between 7pm and 7am)
function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 7;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [darkModePreference, setDarkModePrefState] = useState<DarkModePreference>('light');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [chaosMode, setChaosMode] = useState(false);
  const [bugsEnabled, setBugsEnabled] = useState(true);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [reactions, setReactions] = useState<{ [articleId: string]: string }>({});

  // Calculate actual dark mode based on preference
  const isDarkMode = 
    darkModePreference === 'dark' ||
    (darkModePreference === 'auto' && isNightTime());

  // Font scale multiplier
  const fontScale = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1;

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  // Check time periodically for auto mode
  useEffect(() => {
    if (darkModePreference !== 'auto') return;
    
    const interval = setInterval(() => {
      // Force re-render to update dark mode based on time
      setDarkModePrefState(prev => prev);
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [darkModePreference]);

  const loadPreferences = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkModePreference');
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      const savedBookmarks = await AsyncStorage.getItem('bookmarks');
      
      if (savedDarkMode !== null) {
        setDarkModePrefState(savedDarkMode as DarkModePreference);
      }
      if (savedFontSize !== null) {
        setFontSizeState(savedFontSize as FontSize);
      }
      if (savedBookmarks) {
        const parsed = JSON.parse(savedBookmarks);
        const restored = parsed.map((a: any) => ({
          ...a,
          publishedAt: new Date(a.publishedAt)
        }));
        setBookmarks(restored);
      }
      const savedReactions = await AsyncStorage.getItem('reactions');
      if (savedReactions) {
        setReactions(JSON.parse(savedReactions));
      }
    } catch (error) {
      // Failed to load preferences
    }
  };

  const setDarkModePreference = async (pref: DarkModePreference) => {
    setDarkModePrefState(pref);
    try {
      await AsyncStorage.setItem('darkModePreference', pref);
    } catch (error) {
      // Failed to save
    }
  };

  const toggleDarkMode = () => {
    // Simple toggle: light <-> dark
    const next: DarkModePreference = darkModePreference === 'light' ? 'dark' : 'light';
    setDarkModePreference(next);
  };

  const setFontSize = async (size: FontSize) => {
    setFontSizeState(size);
    try {
      await AsyncStorage.setItem('fontSize', size);
    } catch (error) {
      // Failed to save
    }
  };

  const addBookmark = async (article: Article) => {
    const newBookmarks = [...bookmarks, article];
    setBookmarks(newBookmarks);
    try {
      await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    } catch (error) {
      // Failed to save
    }
  };

  const removeBookmark = async (articleId: string) => {
    const newBookmarks = bookmarks.filter(a => a.id !== articleId);
    setBookmarks(newBookmarks);
    try {
      await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    } catch (error) {
      // Failed to save
    }
  };

  const isBookmarked = useCallback((articleId: string) => {
    return bookmarks.some(a => a.id === articleId);
  }, [bookmarks]);

  const setReaction = async (articleId: string, emoji: string) => {
    const newReactions = { ...reactions };
    if (reactions[articleId] === emoji) {
      // Toggle off if same reaction
      delete newReactions[articleId];
    } else {
      newReactions[articleId] = emoji;
    }
    setReactions(newReactions);
    try {
      await AsyncStorage.setItem('reactions', JSON.stringify(newReactions));
    } catch (error) {
      // Failed to save
    }
  };

  const getReaction = useCallback((articleId: string) => {
    return reactions[articleId];
  }, [reactions]);

  // Memoize context value to prevent cascading re-renders
  const value = useMemo(() => ({
    isDarkMode,
    darkModePreference,
    setDarkModePreference,
    toggleDarkMode,
    fontSize,
    setFontSize,
    fontScale,
    chaosMode,
    setChaosMode,
    bugsEnabled,
    setBugsEnabled,
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    reactions,
    setReaction,
    getReaction,
  }), [isDarkMode, darkModePreference, fontSize, fontScale, chaosMode, 
       bugsEnabled, bookmarks, reactions, isBookmarked, getReaction]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Theme colors
export const lightTheme = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#F0F0F0',
  accent: '#FF6B6B',
  categoryBg: '#F5F5F5',
};

export const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#BBBBBB',
  textMuted: '#888888',
  border: '#333333',
  accent: '#FF6B6B',
  categoryBg: '#2A2A2A',
};

export type Theme = typeof lightTheme;
