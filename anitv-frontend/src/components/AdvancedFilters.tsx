import { useState, useEffect } from 'react';
import type { ContentItem } from '../types';
import './AdvancedFilters.css';

export interface FilterOptions {
  searchQuery: string;
  selectedGenres: string[];
  selectedStatus: string;
  selectedYear: string;
  yearRange: { min: string; max: string };
  ratingRange: { min: string; max: string };
  durationRange: { min: string; max: string };
  episodeRange: { min: string; max: string };
  selectedProviders: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  content: ContentItem[];
  onFiltersChange: (filteredContent: ContentItem[]) => void;
  contentType: 'movie' | 'tv' | 'anime' | 'book' | 'manga';
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  content,
  onFiltersChange,
  contentType
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    selectedGenres: [],
    selectedStatus: '',
    selectedYear: '',
    yearRange: { min: '', max: '' },
    ratingRange: { min: '', max: '' },
    durationRange: { min: '', max: '' },
    episodeRange: { min: '', max: '' },
    selectedProviders: [],
    sortBy: 'title',
    sortOrder: 'asc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generate filter options from content
  const uniqueGenres = Array.from(new Set(content.flatMap(item => item.genres || [])));
  const uniqueYears = Array.from(new Set(content.map(item => item.year).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
  const uniqueRatings = Array.from(new Set(content.map(item => item.rating).filter(Boolean))).sort();
  const uniqueStatuses = Array.from(new Set(content.map(item => item.status).filter(Boolean))) as string[];

  useEffect(() => {
    const filteredContent = applyFilters(content, filters);
    onFiltersChange(filteredContent);
  }, [content, filters, onFiltersChange]);

  const applyFilters = (items: ContentItem[], filterOptions: FilterOptions): ContentItem[] => {
    let filtered = [...items];

    // Search filter
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.genres?.some(genre => genre.toLowerCase().includes(query))
      );
    }

    // Genre filter (multiple selection)
    if (filterOptions.selectedGenres.length > 0) {
      filtered = filtered.filter(item =>
        item.genres?.some(genre => filterOptions.selectedGenres.includes(genre))
      );
    }

    // Status filter
    if (filterOptions.selectedStatus) {
      filtered = filtered.filter(item => item.status === filterOptions.selectedStatus);
    }

    // Year filter
    if (filterOptions.selectedYear) {
      filtered = filtered.filter(item => item.year === filterOptions.selectedYear);
    }

    // Year range filter
    if (filterOptions.yearRange.min || filterOptions.yearRange.max) {
      filtered = filtered.filter(item => {
        const year = Number(item.year);
        const min = filterOptions.yearRange.min ? Number(filterOptions.yearRange.min) : 0;
        const max = filterOptions.yearRange.max ? Number(filterOptions.yearRange.max) : 9999;
        return year >= min && year <= max;
      });
    }

    // Rating range filter
    if (filterOptions.ratingRange.min || filterOptions.ratingRange.max) {
      filtered = filtered.filter(item => {
        const rating = parseFloat(item.rating || '0');
        const min = filterOptions.ratingRange.min ? parseFloat(filterOptions.ratingRange.min) : 0;
        const max = filterOptions.ratingRange.max ? parseFloat(filterOptions.ratingRange.max) : 10;
        return rating >= min && rating <= max;
      });
    }

    // Duration range filter (for movies/TV shows)
    if (filterOptions.durationRange.min || filterOptions.durationRange.max) {
      filtered = filtered.filter(item => {
        const duration = parseFloat(item.duration?.replace(/\D/g, '') || '0');
        const min = filterOptions.durationRange.min ? parseFloat(filterOptions.durationRange.min) : 0;
        const max = filterOptions.durationRange.max ? parseFloat(filterOptions.durationRange.max) : 999;
        return duration >= min && duration <= max;
      });
    }

    // Episode range filter (for TV shows/anime)
    if (filterOptions.episodeRange.min || filterOptions.episodeRange.max) {
      filtered = filtered.filter(item => {
        const episodes = item.episodes || 0;
        const min = filterOptions.episodeRange.min ? parseInt(filterOptions.episodeRange.min) : 0;
        const max = filterOptions.episodeRange.max ? parseInt(filterOptions.episodeRange.max) : 999;
        return episodes >= min && episodes <= max;
      });
    }

    // Sort content
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filterOptions.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
          aValue = Number(a.year) || 0;
          bValue = Number(b.year) || 0;
          break;
        case 'rating':
          aValue = parseFloat(a.rating || '0');
          bValue = parseFloat(b.rating || '0');
          break;
        case 'episodes':
          aValue = a.episodes || 0;
          bValue = b.episodes || 0;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (filterOptions.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      selectedGenres: [],
      selectedStatus: '',
      selectedYear: '',
      yearRange: { min: '', max: '' },
      ratingRange: { min: '', max: '' },
      durationRange: { min: '', max: '' },
      episodeRange: { min: '', max: '' },
      selectedProviders: [],
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter(g => g !== genre)
        : [...prev.selectedGenres, genre]
    }));
  };

  const hasActiveFilters = () => {
    return (
      filters.searchQuery ||
      filters.selectedGenres.length > 0 ||
      filters.selectedStatus ||
      filters.selectedYear ||
      filters.yearRange.min ||
      filters.yearRange.max ||
      filters.ratingRange.min ||
      filters.ratingRange.max ||
      filters.durationRange.min ||
      filters.durationRange.max ||
      filters.episodeRange.min ||
      filters.episodeRange.max ||
      filters.selectedProviders.length > 0
    );
  };

  return (
    <div className="advanced-filters">
      {/* Basic Filters */}
      <div className="basic-filters">
        <div className="search-section">
          <input
            type="text"
            placeholder={`Search ${contentType}...`}
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          {/* Genre Filter */}
          <div className="filter-group">
            <label className="filter-label">Genres</label>
            <div className="genre-chips">
              {uniqueGenres.slice(0, 5).map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`genre-chip ${filters.selectedGenres.includes(genre) ? 'active' : ''}`}
                >
                  {genre}
                </button>
              ))}
              {uniqueGenres.length > 5 && (
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="genre-chip more-btn"
                >
                  {showAdvanced ? 'Less' : `+${uniqueGenres.length - 5} more`}
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          {uniqueStatuses.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                value={filters.selectedStatus}
                onChange={(e) => updateFilter('selectedStatus', e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Year Filter */}
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select
              value={filters.selectedYear}
              onChange={(e) => updateFilter('selectedYear', e.target.value)}
              className="filter-select"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <div className="sort-controls">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="sort-select"
              >
                <option value="title">Title</option>
                <option value="year">Year</option>
                <option value="rating">Rating</option>
                {contentType === 'tv' || contentType === 'anime' ? (
                  <option value="episodes">Episodes</option>
                ) : null}
              </select>
              <button
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
                title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="advanced-toggle"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters-panel">
          <div className="advanced-filters-grid">
            {/* Year Range */}
            <div className="filter-group">
              <label className="filter-label">Year Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min Year"
                  value={filters.yearRange.min}
                  onChange={(e) => updateFilter('yearRange', { ...filters.yearRange, min: e.target.value })}
                  className="range-input"
                />
                <span className="range-separator">-</span>
                <input
                  type="number"
                  placeholder="Max Year"
                  value={filters.yearRange.max}
                  onChange={(e) => updateFilter('yearRange', { ...filters.yearRange, max: e.target.value })}
                  className="range-input"
                />
              </div>
            </div>

            {/* Rating Range */}
            {uniqueRatings.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Rating Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Min Rating"
                    value={filters.ratingRange.min}
                    onChange={(e) => updateFilter('ratingRange', { ...filters.ratingRange, min: e.target.value })}
                    className="range-input"
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Max Rating"
                    value={filters.ratingRange.max}
                    onChange={(e) => updateFilter('ratingRange', { ...filters.ratingRange, max: e.target.value })}
                    className="range-input"
                  />
                </div>
              </div>
            )}

            {/* Duration Range (for movies/TV shows) */}
            {(contentType === 'movie' || contentType === 'tv') && (
              <div className="filter-group">
                <label className="filter-label">Duration Range (minutes)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min Duration"
                    value={filters.durationRange.min}
                    onChange={(e) => updateFilter('durationRange', { ...filters.durationRange, min: e.target.value })}
                    className="range-input"
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max Duration"
                    value={filters.durationRange.max}
                    onChange={(e) => updateFilter('durationRange', { ...filters.durationRange, max: e.target.value })}
                    className="range-input"
                  />
                </div>
              </div>
            )}

            {/* Episode Range (for TV shows/anime) */}
            {(contentType === 'tv' || contentType === 'anime') && (
              <div className="filter-group">
                <label className="filter-label">Episode Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min Episodes"
                    value={filters.episodeRange.min}
                    onChange={(e) => updateFilter('episodeRange', { ...filters.episodeRange, min: e.target.value })}
                    className="range-input"
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max Episodes"
                    value={filters.episodeRange.max}
                    onChange={(e) => updateFilter('episodeRange', { ...filters.episodeRange, max: e.target.value })}
                    className="range-input"
                  />
                </div>
              </div>
            )}

            {/* All Genres (expanded) */}
            <div className="filter-group full-width">
              <label className="filter-label">All Genres</label>
              <div className="genre-chips-expanded">
                {uniqueGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`genre-chip ${filters.selectedGenres.includes(genre) ? 'active' : ''}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="active-filters">
          <div className="active-filters-tags">
            {filters.searchQuery && (
              <span className="filter-tag">
                Search: {filters.searchQuery}
                <button onClick={() => updateFilter('searchQuery', '')}>×</button>
              </span>
            )}
            {filters.selectedGenres.map(genre => (
              <span key={genre} className="filter-tag">
                Genre: {genre}
                <button onClick={() => toggleGenre(genre)}>×</button>
              </span>
            ))}
            {filters.selectedStatus && (
              <span className="filter-tag">
                Status: {filters.selectedStatus}
                <button onClick={() => updateFilter('selectedStatus', '')}>×</button>
              </span>
            )}
            {filters.selectedYear && (
              <span className="filter-tag">
                Year: {filters.selectedYear}
                <button onClick={() => updateFilter('selectedYear', '')}>×</button>
              </span>
            )}
            {(filters.yearRange.min || filters.yearRange.max) && (
              <span className="filter-tag">
                Year Range: {filters.yearRange.min || '0'} - {filters.yearRange.max || '∞'}
                <button onClick={() => updateFilter('yearRange', { min: '', max: '' })}>×</button>
              </span>
            )}
            {(filters.ratingRange.min || filters.ratingRange.max) && (
              <span className="filter-tag">
                Rating: {filters.ratingRange.min || '0'} - {filters.ratingRange.max || '10'}
                <button onClick={() => updateFilter('ratingRange', { min: '', max: '' })}>×</button>
              </span>
            )}
            {(filters.durationRange.min || filters.durationRange.max) && (
              <span className="filter-tag">
                Duration: {filters.durationRange.min || '0'} - {filters.durationRange.max || '∞'} min
                <button onClick={() => updateFilter('durationRange', { min: '', max: '' })}>×</button>
              </span>
            )}
            {(filters.episodeRange.min || filters.episodeRange.max) && (
              <span className="filter-tag">
                Episodes: {filters.episodeRange.min || '0'} - {filters.episodeRange.max || '∞'}
                <button onClick={() => updateFilter('episodeRange', { min: '', max: '' })}>×</button>
              </span>
            )}
          </div>
          <button onClick={clearAllFilters} className="clear-all-filters">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
