// Content Types
export interface ContentItem {
  id: string;
  title: string;
  image: string;
  type: 'movie' | 'tv' | 'anime' | 'book' | 'manga';
  year?: string;
  rating?: string;
  description?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed';
  episodes?: number;
  duration?: string;
}

// Movie/TV Show Types
export interface Movie {
  id: string;
  title: string;
  image: string;
  description?: string;
  year?: string;
  rating?: string;
  genres?: string[];
  duration?: string;
  cast?: CastMember[];
  reviews?: Review[];
  streamingLinks?: StreamingLink[];
}

export interface TVShow {
  id: string;
  title: string;
  image: string;
  description?: string;
  year?: string;
  rating?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed';
  episodes?: Episode[];
  cast?: CastMember[];
  reviews?: Review[];
}

// Anime Types
export interface Anime {
  id: string;
  title: string;
  image: string;
  description?: string;
  year?: string;
  rating?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed';
  episodes?: AnimeEpisode[];
  cast?: CastMember[];
  reviews?: Review[];
}

export interface AnimeEpisode {
  id: string;
  title: string;
  episode: number;
  image?: string;
  streamingLinks?: StreamingLink[];
}

export interface Episode {
  id: string;
  title: string;
  episode: number;
  season?: number;
  image?: string;
  streamingLinks?: StreamingLink[];
}

// Supporting Types
export interface CastMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}

export interface Review {
  id: string;
  author: string;
  authorImage?: string;
  title: string;
  content: string;
  rating: number;
  date: string;
  platform?: string;
}

export interface StreamingLink {
  quality: string;
  url: string;
  type: 'hls' | 'mp4' | 'm3u8';
}

// User Preferences & Favorites Types
export interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  type: 'movie' | 'tv' | 'anime' | 'book' | 'manga';
  year?: string;
  rating?: string;
  addedAt: string;
  lastWatched?: string;
}

export interface WatchlistItem {
  id: string;
  title: string;
  image: string;
  type: 'movie' | 'tv' | 'anime' | 'book' | 'manga';
  year?: string;
  rating?: string;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  defaultQuality: '720p' | '1080p' | 'auto';
  autoplay: boolean;
  subtitles: boolean;
  defaultProvider: {
    movies: MovieProvider;
    anime: AnimeProvider;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SearchResponse {
  results: ContentItem[];
  total: number;
  page: number;
  hasNext: boolean;
}

// Provider Types
export type MovieProvider = 'flixhq' | 'fmovies' | 'goku' | 'sflix' | 'dramacool' | 'viewasian';
export type AnimeProvider = 'gogoanime' | 'animepahe' | 'zoro' | 'nineanime' | 'animefox' | 'anify' | 'crunchyroll' | 'bilibili' | 'marin' | 'anix' | 'animekai';

// News Types
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  image?: string;
  author?: string;
  readTime?: string;
}

// UI State Types
export interface AppState {
  currentContent: Movie | TVShow | Anime | null;
  searchQuery: string;
  selectedProvider: MovieProvider | AnimeProvider;
  isLoading: boolean;
  error: string | null;
}
