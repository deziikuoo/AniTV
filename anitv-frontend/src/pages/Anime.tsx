import { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import AdvancedFilters from '../components/AdvancedFilters';
import type { ContentItem } from '../types';
import { animeApi } from '../services/api';
import './Anime.css';

const Anime = () => {
  const [anime, setAnime] = useState<ContentItem[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    setLoading(true);
    try {
      // Fetch real anime from API
      const topAiringAnime = await animeApi.getTopAiring('gogoanime');
      setAnime(topAiringAnime);
      setFilteredAnime(topAiringAnime);
    } catch (error) {
      console.error('Error fetching anime:', error);
      setAnime([]);
      setFilteredAnime([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filteredContent: ContentItem[]) => {
    setFilteredAnime(filteredContent);
  };

  if (loading) {
    return (
      <div className="anime-container">
        <div className="anime-header">
          <div className="anime-title-section">
            <h1>Anime</h1>
            <p>Discover amazing anime series and movies</p>
          </div>
          <div className="anime-stats">
            <div className="anime-count skeleton-count"></div>
            <div className="anime-count-label">Anime found</div>
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="anime-filters skeleton-filters">
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
        
        {/* Anime Grid Skeleton */}
        <div className="anime-grid">
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
    <div className="anime-container">
      {/* Page Header */}
      <div className="anime-header">
        <div className="anime-title-section">
          <h1>Anime</h1>
          <p>Discover amazing anime series and movies</p>
        </div>
        <div className="anime-stats">
          <div className="anime-count">{filteredAnime.length}</div>
          <div className="anime-count-label">Anime found</div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        content={anime}
        onFiltersChange={handleFiltersChange}
        contentType="anime"
      />

      {/* Anime Grid */}
      {filteredAnime.length > 0 ? (
        <div className="anime-grid">
          {filteredAnime.map((anime) => (
            <ContentCard key={anime.id} content={anime} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">🎌</div>
          <h3>No anime found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default Anime;
