import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { favoritesService } from '../services/favorites';
import type { FavoriteItem } from '../types';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'addedAt' | 'title' | 'lastWatched'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterAndSortFavorites();
  }, [favorites, selectedType, sortBy, sortOrder, searchQuery]);

  const loadFavorites = () => {
    const userFavorites = favoritesService.getFavorites();
    setFavorites(userFavorites);
  };

  const filterAndSortFavorites = () => {
    let filtered = favorites;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'lastWatched':
          aValue = a.lastWatched || '';
          bValue = b.lastWatched || '';
          break;
        default: // addedAt
          aValue = a.addedAt;
          bValue = b.addedAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFavorites(filtered);
  };

  const removeFromFavorites = (id: string) => {
    if (favoritesService.removeFromFavorites(id)) {
      loadFavorites();
    }
  };

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      favorites.forEach(fav => {
        favoritesService.removeFromFavorites(fav.id);
      });
      loadFavorites();
    }
  };

  const getTypeCount = (type: string) => {
    return favorites.filter(item => item.type === type).length;
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div className="favorites-title-section">
          <h1 className="favorites-title">My Favorites</h1>
          <p className="favorites-subtitle">
            {favorites.length} item{favorites.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        
        {favorites.length > 0 && (
          <button 
            className="clear-all-btn"
            onClick={clearAllFavorites}
          >
            Clear All
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">❤️</div>
          <h2>No favorites yet</h2>
          <p>Start adding your favorite movies, shows, and anime to see them here!</p>
          <Link to="/" className="browse-btn">
            Browse Content
          </Link>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="favorites-controls">
            <div className="search-section">
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-section">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="type-filter"
              >
                <option value="all">All Types ({favorites.length})</option>
                <option value="movie">Movies ({getTypeCount('movie')})</option>
                <option value="tv">TV Shows ({getTypeCount('tv')})</option>
                <option value="anime">Anime ({getTypeCount('anime')})</option>
                <option value="book">Books ({getTypeCount('book')})</option>
                <option value="manga">Manga ({getTypeCount('manga')})</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
              >
                <option value="addedAt">Date Added</option>
                <option value="title">Title</option>
                <option value="lastWatched">Last Watched</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="favorites-results">
            {filteredFavorites.length === 0 ? (
              <div className="no-results">
                <p>No favorites match your current filters.</p>
                <button 
                  onClick={() => {
                    setSelectedType('all');
                    setSearchQuery('');
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="favorites-grid">
                {filteredFavorites.map((item) => (
                  <div key={item.id} className="favorite-item">
                    <ContentCard
                      content={item}
                      showActions={true}
                    />
                    <div className="favorite-actions">
                      <button
                        onClick={() => removeFromFavorites(item.id)}
                        className="remove-btn"
                        title="Remove from favorites"
                      >
                        ❌
                      </button>
                      {item.lastWatched && (
                        <span className="last-watched">
                          Last watched: {new Date(item.lastWatched).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;
