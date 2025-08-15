import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { watchlistService } from '../services/favorites';
import type { WatchlistItem } from '../types';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'addedAt' | 'title' | 'priority'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    filterAndSortWatchlist();
  }, [watchlist, selectedType, selectedPriority, sortBy, sortOrder, searchQuery]);

  const loadWatchlist = () => {
    const userWatchlist = watchlistService.getWatchlist();
    setWatchlist(userWatchlist);
  };

  const filterAndSortWatchlist = () => {
    let filtered = watchlist;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
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
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
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

    setFilteredWatchlist(filtered);
  };

  const removeFromWatchlist = (id: string) => {
    if (watchlistService.removeFromWatchlist(id)) {
      loadWatchlist();
    }
  };

  const updatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    if (watchlistService.updateWatchlistItem(id, { priority })) {
      loadWatchlist();
    }
  };

  const clearAllWatchlist = () => {
    if (window.confirm('Are you sure you want to clear all watchlist items?')) {
      watchlist.forEach(item => {
        watchlistService.removeFromWatchlist(item.id);
      });
      loadWatchlist();
    }
  };

  const getTypeCount = (type: string) => {
    return watchlist.filter(item => item.type === type).length;
  };

  const getPriorityCount = (priority: string) => {
    return watchlist.filter(item => item.priority === priority).length;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <div className="watchlist-title-section">
          <h1 className="watchlist-title">My Watchlist</h1>
          <p className="watchlist-subtitle">
            {watchlist.length} item{watchlist.length !== 1 ? 's' : ''} in your watchlist
          </p>
        </div>
        
        {watchlist.length > 0 && (
          <button 
            className="clear-all-btn"
            onClick={clearAllWatchlist}
          >
            Clear All
          </button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <div className="empty-icon">📋</div>
          <h2>No watchlist items yet</h2>
          <p>Start adding movies, shows, and anime to your watchlist to keep track of what you want to watch!</p>
          <Link to="/" className="browse-btn">
            Browse Content
          </Link>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="watchlist-controls">
            <div className="search-section">
              <input
                type="text"
                placeholder="Search watchlist..."
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
                <option value="all">All Types ({watchlist.length})</option>
                <option value="movie">Movies ({getTypeCount('movie')})</option>
                <option value="tv">TV Shows ({getTypeCount('tv')})</option>
                <option value="anime">Anime ({getTypeCount('anime')})</option>
                <option value="book">Books ({getTypeCount('book')})</option>
                <option value="manga">Manga ({getTypeCount('manga')})</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="priority-filter"
              >
                <option value="all">All Priorities ({watchlist.length})</option>
                <option value="high">High Priority ({getPriorityCount('high')})</option>
                <option value="medium">Medium Priority ({getPriorityCount('medium')})</option>
                <option value="low">Low Priority ({getPriorityCount('low')})</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
              >
                <option value="priority">Priority</option>
                <option value="addedAt">Date Added</option>
                <option value="title">Title</option>
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
          <div className="watchlist-results">
            {filteredWatchlist.length === 0 ? (
              <div className="no-results">
                <p>No watchlist items match your current filters.</p>
                <button 
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedPriority('all');
                    setSearchQuery('');
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="watchlist-grid">
                {filteredWatchlist.map((item) => (
                  <div key={item.id} className="watchlist-item">
                    <ContentCard
                      content={item}
                      showActions={true}
                    />
                    <div className="watchlist-actions">
                      <div className="priority-badge" style={{ backgroundColor: getPriorityColor(item.priority) }}>
                        {item.priority.toUpperCase()}
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="remove-btn"
                        title="Remove from watchlist"
                      >
                        ❌
                      </button>
                    </div>
                    {item.notes && (
                      <div className="notes-section">
                        <p className="notes-text">{item.notes}</p>
                      </div>
                    )}
                    <div className="priority-controls">
                      <button
                        onClick={() => updatePriority(item.id, 'high')}
                        className={`priority-btn ${item.priority === 'high' ? 'active' : ''}`}
                        style={{ backgroundColor: item.priority === 'high' ? getPriorityColor('high') : 'transparent' }}
                      >
                        High
                      </button>
                      <button
                        onClick={() => updatePriority(item.id, 'medium')}
                        className={`priority-btn ${item.priority === 'medium' ? 'active' : ''}`}
                        style={{ backgroundColor: item.priority === 'medium' ? getPriorityColor('medium') : 'transparent' }}
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => updatePriority(item.id, 'low')}
                        className={`priority-btn ${item.priority === 'low' ? 'active' : ''}`}
                        style={{ backgroundColor: item.priority === 'low' ? getPriorityColor('low') : 'transparent' }}
                      >
                        Low
                      </button>
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

export default Watchlist;
