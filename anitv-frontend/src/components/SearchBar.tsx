import { useState, useRef, useEffect } from 'react';
import { searchApi } from '../services/api';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search movies, TV shows, anime..." 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions from API
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // Show trending suggestions when search is empty
      try {
        const trendingSuggestions = await searchApi.getTrendingSuggestions();
        setSuggestions(trendingSuggestions);
      } catch (error) {
        console.error('Error fetching trending suggestions:', error);
        setSuggestions([]);
      }
      return;
    }

    setLoading(true);
    try {
      const apiSuggestions = await searchApi.getSuggestions(searchQuery);
      setSuggestions(apiSuggestions);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // 300ms debounce delay

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Load trending suggestions on component mount
  useEffect(() => {
    if (isFocused && !query.trim()) {
      fetchSuggestions('');
    }
  }, [isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear suggestions if query is empty
    if (!newQuery.trim()) {
      setSuggestions([]);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Load trending suggestions when focused and no query
    if (!query.trim()) {
      fetchSuggestions('');
    }
  };

  const handleBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => setIsFocused(false), 200);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
          />
          
          <div className="search-icon">
            <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="clear-button"
            >
              <svg className="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isFocused && (suggestions.length > 0 || loading) && (
        <div className="suggestions-dropdown">
          {loading && (
            <div className="suggestion-item loading">
              <div className="suggestion-content">
                <div className="loading-spinner"></div>
                <span className="suggestion-text">Loading suggestions...</span>
              </div>
            </div>
          )}
          
          {!loading && suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              <div className="suggestion-content">
                <svg className="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="suggestion-text">{suggestion}</span>
              </div>
            </button>
          ))}
          
          {!loading && suggestions.length === 0 && query.trim() && (
            <div className="suggestion-item no-results">
              <div className="suggestion-content">
                <span className="suggestion-text">No suggestions found</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
