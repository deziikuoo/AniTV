import { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import type { ContentItem } from '../types';
import { movieApi, animeApi } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<ContentItem[]>([]);
  const [recentAnime, setRecentAnime] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Fetch real data from API
      const [popularMovies, topAiringAnime, recentEpisodes] = await Promise.all([
        movieApi.getPopular('flixhq'),
        animeApi.getTopAiring('gogoanime'),
        animeApi.getRecentEpisodes('gogoanime')
      ]);

      // Set featured content (mix of popular movies and top anime)
      const featured = [...popularMovies.slice(0, 2), ...topAiringAnime.slice(0, 1)];
      setFeaturedContent(featured);

      // Set trending movies
      setTrendingMovies(popularMovies.slice(0, 6));

      // Set recent anime episodes
      setRecentAnime(recentEpisodes.slice(0, 6));

    } catch (error) {
      console.error('Error fetching home data:', error);
      // Fallback to empty arrays if API fails
      setFeaturedContent([]);
      setTrendingMovies([]);
      setRecentAnime([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data functions - commented out as they're not currently used
  /*
  const getMockFeaturedContent = (): ContentItem[] => [
    {
      id: '1',
      title: 'Spider-Man: Into The Spider-Verse',
      image: 'https://via.placeholder.com/400x600/667eea/ffffff?text=Spider-Man',
      type: 'movie',
      year: '2018',
      rating: '8.4',
      genres: ['Animation', 'Action', 'Comedy'],
      duration: '1h 57m',
    },
    {
      id: '2',
      title: 'Attack on Titan',
      image: 'https://via.placeholder.com/400x600/764ba2/ffffff?text=Attack+on+Titan',
      type: 'anime',
      year: '2013',
      rating: '9.0',
      genres: ['Action', 'Drama', 'Fantasy'],
      episodes: 25,
      status: 'completed',
    },
  ];

  const getMockMovies = (): ContentItem[] => [
    {
      id: '3',
      title: 'Dunkirk',
      image: 'https://via.placeholder.com/400x600/4ade80/ffffff?text=Dunkirk',
      type: 'movie',
      year: '2017',
      rating: '7.8',
      genres: ['Action', 'Drama', 'History'],
      duration: '1h 46m',
    },
    {
      id: '4',
      title: 'The Martian',
      image: 'https://via.placeholder.com/400x600/fbbf24/ffffff?text=The+Martian',
      type: 'movie',
      year: '2015',
      rating: '8.0',
      genres: ['Adventure', 'Drama', 'Sci-Fi'],
      duration: '2h 31m',
    },
    {
      id: '5',
      title: 'About Schmidt',
      image: 'https://via.placeholder.com/400x600/f87171/ffffff?text=About+Schmidt',
      type: 'movie',
      year: '2002',
      rating: '7.2',
      genres: ['Comedy', 'Drama'],
      duration: '2h 5m',
    },
  ];

  const getMockAnime = (): ContentItem[] => [
    {
      id: '6',
      title: 'Demon Slayer',
      image: 'https://via.placeholder.com/400x600/667eea/ffffff?text=Demon+Slayer',
      type: 'anime',
      year: '2019',
      rating: '8.9',
      genres: ['Action', 'Fantasy', 'Supernatural'],
      episodes: 26,
      status: 'completed',
    },
    {
      id: '7',
      title: 'One Piece',
      image: 'https://via.placeholder.com/400x600/764ba2/ffffff?text=One+Piece',
      type: 'anime',
      year: '1999',
      rating: '8.7',
      genres: ['Action', 'Adventure', 'Comedy'],
      episodes: 1000,
      status: 'ongoing',
    },
  ];
  */

  if (loading) {
    return (
      <div className="space-y-xl">
        {/* Featured Content Skeleton */}
        <div>
          <div className="skeleton h-8 w-48 mb-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton aspect-[2/3] rounded-xl"></div>
            ))}
          </div>
        </div>

        {/* Trending Movies Skeleton */}
        <div>
          <div className="skeleton h-8 w-48 mb-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton aspect-[2/3] rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Recent Anime Skeleton */}
        <div>
          <div className="skeleton h-8 w-48 mb-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton aspect-[2/3] rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Featured Content */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Featured Content</h2>
          <button className="section-button">
            Browse More
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="featured-grid">
          {featuredContent.map((content) => (
            <ContentCard key={content.id} content={content} variant="featured" />
          ))}
        </div>
      </section>

      {/* Trending Movies */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Trending Movies</h2>
          <button className="section-button">
            See All
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="content-grid">
          {trendingMovies.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>

      {/* Recent Anime */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Recent Anime</h2>
          <button className="section-button">
            See All
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="content-grid">
          {recentAnime.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-number stat-number-primary">
            {trendingMovies.length + recentAnime.length}
          </div>
          <div className="stat-label">Total Content</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number stat-number-success">
            {trendingMovies.length}
          </div>
          <div className="stat-label">Movies Available</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number stat-number-warning">
            {recentAnime.length}
          </div>
          <div className="stat-label">Anime Series</div>
        </div>
      </section>
    </div>
  );
};

export default Home;
