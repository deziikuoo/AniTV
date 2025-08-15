import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ContentItem } from '../types';
import { favoritesService, watchlistService } from '../services/favorites';
import './ContentCard.css';

interface ContentCardProps {
  content: ContentItem;
  variant?: 'default' | 'featured' | 'compact';
  showActions?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  variant = 'default',
  showActions = false
}) => {
  const [isFavorite, setIsFavorite] = useState(favoritesService.isFavorite(content.id));
  const [isInWatchlist, setIsInWatchlist] = useState(watchlistService.isInWatchlist(content.id));

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      favoritesService.removeFromFavorites(content.id);
      setIsFavorite(false);
    } else {
      favoritesService.addToFavorites(content);
      setIsFavorite(true);
    }
  };

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWatchlist) {
      watchlistService.removeFromWatchlist(content.id);
      setIsInWatchlist(false);
    } else {
      watchlistService.addToWatchlist(content);
      setIsInWatchlist(true);
    }
  };
  const getContentTypeIcon = () => {
    switch (content.type) {
      case 'movie':
        return (
          <svg className="content-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M6 4h12M4 16h16M4 12h16" />
          </svg>
        );
      case 'tv':
        return (
          <svg className="content-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'anime':
        return (
          <svg className="content-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getContentPath = () => {
    switch (content.type) {
      case 'movie':
        return `/content/movie/${content.id}`;
      case 'tv':
        return `/content/tv/${content.id}`;
      case 'anime':
        return `/content/anime/${content.id}`;
      default:
        return `/content/${content.type}/${content.id}`;
    }
  };

  if (variant === 'featured') {
    return (
      <Link to={getContentPath()} className="content-card">
        <div className="content-card-featured">
          {/* Image */}
          <div className="content-card-featured-image-container">
            <img
              src={content.image || '/placeholder-image.jpg'}
              alt={content.title}
              className="content-card-featured-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.jpg';
              }}
            />
            
            {/* Overlay */}
            <div className="content-card-featured-overlay" />
            
            {/* Play Button */}
            <div className="content-card-play-button">
              <div className="content-card-play-icon">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Type Badge */}
            <div className="content-card-type-badge">
              <div className="content-card-type-badge-content">
                {getContentTypeIcon()}
                <span className="content-card-type-text">{content.type}</span>
              </div>
            </div>

                      {/* Rating */}
          {content.rating && (
            <div className="content-card-rating">
              {content.rating}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="content-card-actions">
              <button
                onClick={handleFavoriteToggle}
                className={`content-card-action-btn ${isFavorite ? 'active' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
              <button
                onClick={handleWatchlistToggle}
                className={`content-card-action-btn ${isInWatchlist ? 'active' : ''}`}
                title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {isInWatchlist ? '📋' : '📄'}
              </button>
            </div>
          )}
        </div>

          {/* Content Info */}
          <div className="content-card-info">
            <h3 className="content-card-title">
              {content.title}
            </h3>
            
            <div className="content-card-meta">
              {content.year && <span>{content.year}</span>}
              {content.duration && <span>{content.duration}</span>}
              {content.episodes && <span>{content.episodes} episodes</span>}
            </div>

            {content.genres && content.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.genres.slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs bg-tertiary text-secondary px-2 py-1 rounded-md"
                  >
                    {genre}
                  </span>
                ))}
                {content.genres.length > 2 && (
                  <span className="text-xs text-muted">+{content.genres.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={getContentPath()} className="content-card">
        <div className="content-card-compact">
          {/* Image */}
          <div className="content-card-compact-image-container">
            <img
              src={content.image || '/placeholder-image.jpg'}
              alt={content.title}
              className="content-card-compact-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.jpg';
              }}
            />
          </div>

          {/* Content Info */}
          <div className="content-card-compact-info">
            <h3 className="content-card-compact-title">
              {content.title}
            </h3>
            
            <div className="content-card-compact-meta">
              {content.year && <span>{content.year}</span>}
              {content.rating && <span>• {content.rating}</span>}
              {content.duration && <span>• {content.duration}</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={getContentPath()} className="content-card-group">
      <div className="content-card-container">
        {/* Image */}
        <div className="content-card-image-container">
          <img
            src={content.image || '/placeholder-image.jpg'}
            alt={content.title}
            className="content-card-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.jpg';
            }}
          />
          
          {/* Overlay */}
          <div className="content-card-overlay" />
          
          {/* Play Button */}
          <div className="content-card-play-button">
            <div className="content-card-play-icon">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Type Badge */}
          <div className="content-card-type-badge">
            <div className="content-card-type-badge-content">
              {getContentTypeIcon()}
              <span className="content-card-type-text">{content.type}</span>
            </div>
          </div>

          {/* Rating */}
          {content.rating && (
            <div className="content-card-rating">
              {content.rating}
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="content-card-info">
          <h3 className="content-card-title">
            {content.title}
          </h3>
          
          <div className="content-card-meta">
            {content.year && <span>{content.year}</span>}
            {content.duration && <span>• {content.duration}</span>}
            {content.episodes && <span>• {content.episodes} eps</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
