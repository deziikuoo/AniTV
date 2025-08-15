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

// API Configuration
const API_BASE_URL = 'https://anitv.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 404) {
      throw new Error('Content not found');
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    throw new Error(error.response?.data?.message || 'An error occurred');
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
};

export default api;
