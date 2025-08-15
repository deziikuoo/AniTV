import axios from 'axios';
import type { 
  Movie, 
  TVShow, 
  Anime, 
  ContentItem, 
  MovieProvider, 
  AnimeProvider,
  SearchResponse
} from '../types';

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://anitv.onrender.com',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle different types of errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - server may be down or CORS issue');
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    
    if (error.response?.status === 503) {
      console.error('Service unavailable - server is down');
      return Promise.reject(new Error('Service temporarily unavailable'));
    }
    
    if (error.response?.status === 429) {
      console.error('Rate limited');
      return Promise.reject(new Error('Too many requests - please wait a moment'));
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
      return Promise.reject(new Error('Server error - please try again later'));
    }
    
    if (error.response?.status >= 400) {
      console.error('Client error:', error.response.status);
      return Promise.reject(new Error('Request failed - please check your input'));
    }
    
    return Promise.reject(error);
  }
);

// Movie & TV Show API Methods
export const movieApi = {
  // Get recent movies
  getRecent: async (provider: MovieProvider = 'flixhq'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/movies/${provider}/recent`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching recent movies:', error);
      return [];
    }
  },

  // Get popular movies
  getPopular: async (provider: MovieProvider = 'flixhq'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/movies/${provider}/popular`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  },

  // Search movies
  search: async (query: string, provider: MovieProvider = 'flixhq'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/movies/${provider}/${encodeURIComponent(query)}`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  },

  // Get movie details
  getInfo: async (id: string, provider: MovieProvider = 'flixhq'): Promise<Movie | null> => {
    try {
      const response = await api.get(`/movies/${provider}/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie info:', error);
      return null;
    }
  },

  // Get streaming links
  getStreamingLinks: async (id: string, provider: MovieProvider = 'flixhq'): Promise<any> => {
    try {
      const response = await api.get(`/movies/${provider}/watch/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      return null;
    }
  },
};

// Anime API Methods
export const animeApi = {
  // Get recent episodes
  getRecentEpisodes: async (provider: AnimeProvider = 'gogoanime'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/anime/${provider}/recent-episodes`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching recent episodes:', error);
      return [];
    }
  },

  // Get top airing anime
  getTopAiring: async (provider: AnimeProvider = 'gogoanime'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/anime/${provider}/top-airing`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching top airing anime:', error);
      return [];
    }
  },

  // Search anime
  search: async (query: string, provider: AnimeProvider = 'gogoanime'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/anime/${provider}/${encodeURIComponent(query)}`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  },

  // Get anime details
  getInfo: async (id: string, provider: AnimeProvider = 'gogoanime'): Promise<Anime | null> => {
    try {
      const response = await api.get(`/anime/${provider}/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime info:', error);
      return null;
    }
  },

  // Get episode streaming links
  getStreamingLinks: async (id: string, provider: AnimeProvider = 'gogoanime'): Promise<any> => {
    try {
      const response = await api.get(`/anime/${provider}/watch/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      return null;
    }
  },
};

// TV Show API Methods (using movie providers that support TV shows)
export const tvShowApi = {
  // Get recent TV shows
  getRecent: async (provider: MovieProvider = 'flixhq'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/movies/${provider}/recent`);
      // Filter for TV shows if the API provides type information
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching recent TV shows:', error);
      return [];
    }
  },

  // Get popular TV shows
  getPopular: async (provider: MovieProvider = 'flixhq'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/movies/${provider}/popular`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      return [];
    }
  },

  // Search TV shows
  search: async (query: string, provider: MovieProvider = 'flixhq'): Promise<ContentItem[]> => {
    try {
      const response = await api.get(`/movies/${provider}/${encodeURIComponent(query)}`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching TV shows:', error);
      return [];
    }
  },

  // Get TV show details
  getInfo: async (id: string, provider: MovieProvider = 'flixhq'): Promise<TVShow | null> => {
    try {
      const response = await api.get(`/movies/${provider}/info/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching TV show info:', error);
      return null;
    }
  },
};

// Generic search across all content types
export const searchApi = {
  searchAll: async (query: string): Promise<SearchResponse> => {
    try {
      // Search across multiple providers and content types
      const [movies, anime] = await Promise.all([
        movieApi.search(query, 'flixhq'),
        animeApi.search(query, 'gogoanime'),
      ]);

      const results = [...movies, ...anime];
      
      return {
        results,
        total: results.length,
        page: 1,
        hasNext: false,
      };
    } catch (error) {
      console.error('Error in global search:', error);
      return {
        results: [],
        total: 0,
        page: 1,
        hasNext: false,
      };
    }
  },

  // Get search suggestions from multiple providers
  getSuggestions: async (query: string): Promise<string[]> => {
    try {
      // Get suggestions from multiple providers in parallel
      const [animeKaiSuggestions, zoroSuggestions, trendingSuggestions] = await Promise.allSettled([
        // AnimeKai search suggestions
        api.get(`/anime/animekai/search-suggestions/${encodeURIComponent(query)}`),
        // Zoro search suggestions
        api.get(`/anime/zoro/search-suggestions/${encodeURIComponent(query)}`),
        // Get trending content for fallback suggestions
        Promise.all([
          movieApi.getPopular('flixhq'),
          animeApi.getRecentEpisodes('gogoanime'),
        ])
      ]);

      const suggestions: string[] = [];

      // Process AnimeKai suggestions
      if (animeKaiSuggestions.status === 'fulfilled' && animeKaiSuggestions.value.data) {
        const animeKaiData = animeKaiSuggestions.value.data;
        if (Array.isArray(animeKaiData)) {
          suggestions.push(...animeKaiData.slice(0, 3));
        } else if (animeKaiData.results && Array.isArray(animeKaiData.results)) {
          suggestions.push(...animeKaiData.results.slice(0, 3).map((item: any) => item.title));
        }
      }

      // Process Zoro suggestions
      if (zoroSuggestions.status === 'fulfilled' && zoroSuggestions.value.data) {
        const zoroData = zoroSuggestions.value.data;
        if (Array.isArray(zoroData)) {
          suggestions.push(...zoroData.slice(0, 3));
        } else if (zoroData.results && Array.isArray(zoroData.results)) {
          suggestions.push(...zoroData.results.slice(0, 3).map((item: any) => item.title));
        }
      }

      // Add trending content as fallback suggestions
      if (trendingSuggestions.status === 'fulfilled') {
        const [popularMovies, recentAnime] = trendingSuggestions.value;
        const trendingTitles = [
          ...popularMovies.slice(0, 2).map((item: any) => item.title),
          ...recentAnime.slice(0, 2).map((item: any) => item.title)
        ];
        suggestions.push(...trendingTitles);
      }

      // Remove duplicates and limit to 8 suggestions
      const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8);
      
      return uniqueSuggestions;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      // Return trending content as fallback
      return getFallbackSuggestions();
    }
  },

  // Get trending suggestions for empty search state
  getTrendingSuggestions: async (): Promise<string[]> => {
    try {
      const [popularMovies, recentAnime, topAiring] = await Promise.allSettled([
        movieApi.getPopular('flixhq'),
        animeApi.getRecentEpisodes('gogoanime'),
        animeApi.getTopAiring('gogoanime')
      ]);

      const suggestions: string[] = [];

      // Add popular movies
      if (popularMovies.status === 'fulfilled') {
        suggestions.push(...popularMovies.value.slice(0, 3).map((item: any) => item.title));
      }

      // Add recent anime
      if (recentAnime.status === 'fulfilled') {
        suggestions.push(...recentAnime.value.slice(0, 3).map((item: any) => item.title));
      }

      // Add top airing anime
      if (topAiring.status === 'fulfilled') {
        suggestions.push(...topAiring.value.slice(0, 2).map((item: any) => item.title));
      }

      return [...new Set(suggestions)].slice(0, 8);
    } catch (error) {
      console.error('Error fetching trending suggestions:', error);
      return getFallbackSuggestions();
    }
  }
};

// Fallback suggestions when API calls fail
const getFallbackSuggestions = (): string[] => {
  return [
    'Attack on Titan',
    'Demon Slayer',
    'One Piece',
    'Spider-Man: Into The Spider-Verse',
    'Breaking Bad',
    'Game of Thrones',
    'Dunkirk',
    'The Martian'
  ];
};

export default api;
