import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import AdvancedFilters from '../components/AdvancedFilters';
import type { ContentItem } from '../types';
import { searchApi } from '../services/api';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setFilteredResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Search across all content types
      const searchResponse = await searchApi.searchAll(query);
      setSearchResults(searchResponse.results);
      setFilteredResults(searchResponse.results);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filteredContent: ContentItem[]) => {
    setFilteredResults(filteredContent);
  };

  // Determine content type for filters (use the most common type in results)
  const getContentType = () => {
    if (searchResults.length === 0) return 'movie';
    
    const typeCounts = searchResults.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonType = Object.entries(typeCounts).reduce((a, b) => 
      typeCounts[a[0]] > typeCounts[b[0]] ? a : b
    )[0];
    
    return mostCommonType as 'movie' | 'tv' | 'anime' | 'book' | 'manga';
  };

  if (loading) {
    return (
      <div className="search-container">
        <div className="search-header">
          <div className="search-title-section">
            <h1>Search Results for "{query}"</h1>
            <p>Searching...</p>
          </div>
          <div className="search-stats">
            <div className="search-count skeleton-count"></div>
            <div className="search-count-label">Results found</div>
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="search-filters skeleton-filters">
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
        
        {/* Results Grid Skeleton */}
        <div className="results-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
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
    <div className="search-container">
      <div className="search-header">
        <div className="search-title-section">
          <h1>Search Results for "{query}"</h1>
          <p>Found {filteredResults.length} results</p>
        </div>
        <div className="search-stats">
          <div className="search-count">{filteredResults.length}</div>
          <div className="search-count-label">Results found</div>
        </div>
      </div>

      {/* Advanced Filters */}
      {searchResults.length > 0 && (
        <AdvancedFilters
          content={searchResults}
          onFiltersChange={handleFiltersChange}
          contentType={getContentType()}
        />
      )}

      {/* Results */}
      {!loading && filteredResults.length > 0 && (
        <div className="results-grid">
          {filteredResults.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              variant="default"
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredResults.length === 0 && query.trim() && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try adjusting your search terms or browse our categories</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !query.trim() && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>Search for content</h3>
          <p>Enter a search term to find movies, TV shows, anime, books, and more</p>
        </div>
      )}
    </div>
  );
};

export default Search;
