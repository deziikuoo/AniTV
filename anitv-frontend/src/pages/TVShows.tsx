import { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import AdvancedFilters from '../components/AdvancedFilters';
import type { ContentItem } from '../types';
import { tvShowApi } from '../services/api';
import './TVShows.css';

const TVShows = () => {
  const [tvShows, setTvShows] = useState<ContentItem[]>([]);
  const [filteredTvShows, setFilteredTvShows] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTVShows();
  }, []);

  const fetchTVShows = async () => {
    setLoading(true);
    try {
      // Fetch real TV shows from API
      const popularTvShows = await tvShowApi.getPopular('flixhq');
      setTvShows(popularTvShows);
      setFilteredTvShows(popularTvShows);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
      setTvShows([]);
      setFilteredTvShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filteredContent: ContentItem[]) => {
    setFilteredTvShows(filteredContent);
  };

  if (loading) {
    return (
      <div className="tvshows-container">
        <div className="tvshows-header">
          <div className="tvshows-title-section">
            <h1>TV Shows</h1>
            <p>Discover amazing TV series</p>
          </div>
          <div className="tvshows-stats">
            <div className="tvshows-count skeleton-count"></div>
            <div className="tvshows-count-label">TV Shows found</div>
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="tvshows-filters skeleton-filters">
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
        
        {/* TV Shows Grid Skeleton */}
        <div className="tvshows-grid">
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
    <div className="tvshows-container">
      {/* Page Header */}
      <div className="tvshows-header">
        <div className="tvshows-title-section">
          <h1>TV Shows</h1>
          <p>Discover amazing TV series</p>
        </div>
        <div className="tvshows-stats">
          <div className="tvshows-count">{filteredTvShows.length}</div>
          <div className="tvshows-count-label">TV Shows found</div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        content={tvShows}
        onFiltersChange={handleFiltersChange}
        contentType="tv"
      />

      {/* TV Shows Grid */}
      {filteredTvShows.length > 0 ? (
        <div className="tvshows-grid">
          {filteredTvShows.map((show) => (
            <ContentCard key={show.id} content={show} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">📺</div>
          <h3>No TV shows found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default TVShows;
