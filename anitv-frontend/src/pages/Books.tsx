import { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import SearchBar from '../components/SearchBar';
import type { ContentItem } from '../types';
import './Books.css';

const Books = () => {
  const [books, setBooks] = useState<ContentItem[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedGenre]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Mock data for books - will be replaced with actual API calls
      const mockBooks: ContentItem[] = [
        {
          id: '1',
          title: 'The Great Gatsby',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=The+Great+Gatsby',
          type: 'book',
          year: '1925',
          rating: '4.2',
          description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
          genres: ['Classic', 'Romance', 'Drama']
        },
        {
          id: '2',
          title: '1984',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=1984',
          type: 'book',
          year: '1949',
          rating: '4.5',
          description: 'A dystopian novel about totalitarianism and surveillance society.',
          genres: ['Dystopian', 'Political', 'Science Fiction']
        },
        {
          id: '3',
          title: 'To Kill a Mockingbird',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=To+Kill+a+Mockingbird',
          type: 'book',
          year: '1960',
          rating: '4.3',
          description: 'A story of racial injustice and the loss of innocence in the American South.',
          genres: ['Classic', 'Drama', 'Historical']
        },
        {
          id: '4',
          title: 'The Hobbit',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=The+Hobbit',
          type: 'book',
          year: '1937',
          rating: '4.4',
          description: 'A fantasy novel about a hobbit\'s journey with thirteen dwarves.',
          genres: ['Fantasy', 'Adventure', 'Fiction']
        },
        {
          id: '5',
          title: 'Pride and Prejudice',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=Pride+and+Prejudice',
          type: 'book',
          year: '1813',
          rating: '4.1',
          description: 'A romantic novel of manners about the relationship between Elizabeth Bennet and Mr. Darcy.',
          genres: ['Romance', 'Classic', 'Drama']
        },
        {
          id: '6',
          title: 'The Catcher in the Rye',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=The+Catcher+in+the+Rye',
          type: 'book',
          year: '1951',
          rating: '4.0',
          description: 'A novel about teenage alienation and loss of innocence in post-World War II America.',
          genres: ['Coming-of-age', 'Fiction', 'Drama']
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBooks(mockBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book =>
        book.genres?.includes(selectedGenre)
      );
    }

    setFilteredBooks(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const getUniqueGenres = () => {
    const genres = books.flatMap(book => book.genres || []);
    return ['all', ...Array.from(new Set(genres))];
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Books</h1>
          <p>Discover amazing literature</p>
        </div>
        <div className="content-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="content-card skeleton">
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
    <div className="page-container">
      <div className="page-header">
        <h1>Books</h1>
        <p>Discover amazing literature from around the world</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <SearchBar onSearch={handleSearch} placeholder="Search books..." />
        
        <div className="filter-controls">
          <select
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="genre-filter"
          >
            {getUniqueGenres().map(genre => (
              <option key={genre} value={genre}>
                {genre === 'all' ? 'All Genres' : genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="content-grid">
          {filteredBooks.map((book) => (
            <ContentCard key={book.id} content={book} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Books;
