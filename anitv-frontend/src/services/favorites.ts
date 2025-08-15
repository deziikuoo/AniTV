import type { FavoriteItem, WatchlistItem, UserPreferences, ContentItem } from '../types';

// Local Storage Keys
const FAVORITES_KEY = 'anitv_favorites';
const WATCHLIST_KEY = 'anitv_watchlist';
const PREFERENCES_KEY = 'anitv_preferences';

// Default User Preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'en',
  defaultQuality: 'auto',
  autoplay: false,
  subtitles: true,
  defaultProvider: {
    movies: 'flixhq',
    anime: 'gogoanime'
  }
};

// Favorites Service
export const favoritesService = {
  // Get all favorites
  getFavorites: (): FavoriteItem[] => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },

  // Add to favorites
  addToFavorites: (item: ContentItem): boolean => {
    try {
      const favorites = favoritesService.getFavorites();
      const exists = favorites.find(fav => fav.id === item.id);
      
      if (exists) {
        return false; // Already in favorites
      }

      const favoriteItem: FavoriteItem = {
        id: item.id,
        title: item.title,
        image: item.image,
        type: item.type,
        year: item.year,
        rating: item.rating,
        addedAt: new Date().toISOString()
      };

      favorites.push(favoriteItem);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  },

  // Remove from favorites
  removeFromFavorites: (id: string): boolean => {
    try {
      const favorites = favoritesService.getFavorites();
      const filtered = favorites.filter(fav => fav.id !== id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  },

  // Check if item is in favorites
  isFavorite: (id: string): boolean => {
    const favorites = favoritesService.getFavorites();
    return favorites.some(fav => fav.id === id);
  },

  // Update last watched
  updateLastWatched: (id: string): void => {
    try {
      const favorites = favoritesService.getFavorites();
      const updated = favorites.map(fav => 
        fav.id === id 
          ? { ...fav, lastWatched: new Date().toISOString() }
          : fav
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating last watched:', error);
    }
  }
};

// Watchlist Service
export const watchlistService = {
  // Get all watchlist items
  getWatchlist: (): WatchlistItem[] => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  },

  // Add to watchlist
  addToWatchlist: (item: ContentItem, priority: 'low' | 'medium' | 'high' = 'medium', notes?: string): boolean => {
    try {
      const watchlist = watchlistService.getWatchlist();
      const exists = watchlist.find(watch => watch.id === item.id);
      
      if (exists) {
        return false; // Already in watchlist
      }

      const watchlistItem: WatchlistItem = {
        id: item.id,
        title: item.title,
        image: item.image,
        type: item.type,
        year: item.year,
        rating: item.rating,
        addedAt: new Date().toISOString(),
        priority,
        notes
      };

      watchlist.push(watchlistItem);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  },

  // Remove from watchlist
  removeFromWatchlist: (id: string): boolean => {
    try {
      const watchlist = watchlistService.getWatchlist();
      const filtered = watchlist.filter(watch => watch.id !== id);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  },

  // Check if item is in watchlist
  isInWatchlist: (id: string): boolean => {
    const watchlist = watchlistService.getWatchlist();
    return watchlist.some(watch => watch.id === id);
  },

  // Update watchlist item
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>): boolean => {
    try {
      const watchlist = watchlistService.getWatchlist();
      const updated = watchlist.map(item => 
        item.id === id 
          ? { ...item, ...updates }
          : item
      );
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      return false;
    }
  },

  // Get watchlist by priority
  getWatchlistByPriority: (priority: 'low' | 'medium' | 'high'): WatchlistItem[] => {
    const watchlist = watchlistService.getWatchlist();
    return watchlist.filter(item => item.priority === priority);
  }
};

// User Preferences Service
export const preferencesService = {
  // Get user preferences
  getPreferences: (): UserPreferences => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  // Update user preferences
  updatePreferences: (updates: Partial<UserPreferences>): boolean => {
    try {
      const current = preferencesService.getPreferences();
      const updated = { ...current, ...updates };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  },

  // Reset preferences to default
  resetPreferences: (): boolean => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      return true;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }
};
