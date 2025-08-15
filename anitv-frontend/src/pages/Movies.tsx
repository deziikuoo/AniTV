import { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import AdvancedFilters from '../components/AdvancedFilters';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import type { ContentItem } from '../types';
import { movieApi } from '../services/api';
import './Movies.css';
import '../hooks/useInfiniteScroll.css';

const Movies = () => {
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      // Fetch real movies from API
      const popularMovies = await movieApi.getPopular('flixhq');
      setMovies(popularMovies);
      setFilteredMovies(popularMovies);
      setHasMore(false); // No pagination support in current API
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
      setFilteredMovies([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    // For now, we'll simulate infinite scroll with mock data
    // In a real implementation, this would call the API with pagination
    if (!hasMore || loading) return;
    
    // Simulate loading more content
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we'll just set hasMore to false
    setHasMore(false);
  };

  const { loadingRef } = useInfiniteScroll(loadMoreMovies, {
    enabled: hasMore && !loading,
    threshold: 0.1,
    rootMargin: '200px'
  });

  const handleFiltersChange = (filteredContent: ContentItem[]) => {
    setFilteredMovies(filteredContent);
  };

  if (loading) {
    return (
      <div className="movies-container">
        <div className="movies-header">
          <div className="movies-title-section">
            <h1>Movies & TV Shows</h1>
            <p>Discover the latest and greatest movies</p>
          </div>
          <div className="movies-stats">
            <div className="movies-count skeleton-count"></div>
            <div className="movies-count-label">Movies found</div>
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="movies-filters skeleton-filters">
          <div className="filters-grid">
            <div className="filter-group">
              <div className="skeleton-label"></div>
              <div className="skeleton-input"></div>
            </div>
            <div className="filter-group">
              <div className="skeleton-label"></div>
              <div className="skeleton-input"></div>
            </div>
            <div className="filter-group">
              <div className="skeleton-label"></div>
              <div className="skeleton-input"></div>
            </div>
          </div>
        </div>
        
        {/* Movies Grid Skeleton */}
        <div className="movies-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="content-card skeleton">
              <div className="card-image skeleton-image"></div>
              <div className="card-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="movies-container">
      {/* Page Header */}
      <div className="movies-header">
        <div className="movies-title-section">
          <h1>Movies & TV Shows</h1>
          <p>Discover the latest and greatest movies</p>
        </div>
        <div className="movies-stats">
          <div className="movies-count">{filteredMovies.length}</div>
          <div className="movies-count-label">Movies found</div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        content={movies}
        onFiltersChange={handleFiltersChange}
        contentType="movie"
      />

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <>
          <div className="movies-grid">
            {filteredMovies.map((movie) => (
              <ContentCard key={movie.id} content={movie} />
            ))}
          </div>
          <div ref={loadingRef} className="loading-indicator">
            {hasMore && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading more content...</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">🎬</div>
          <h3>No movies found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default Movies;
