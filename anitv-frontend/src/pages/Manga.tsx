import { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import SearchBar from '../components/SearchBar';
import type { ContentItem } from '../types';
import './Manga.css';

const Manga = () => {
  const [manga, setManga] = useState<ContentItem[]>([]);
  const [filteredManga, setFilteredManga] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchManga();
  }, []);

  useEffect(() => {
    filterManga();
  }, [manga, searchQuery, selectedGenre, selectedStatus]);

  const fetchManga = async () => {
    setLoading(true);
    try {
      // Mock data for manga - will be replaced with actual API calls
      const mockManga: ContentItem[] = [
        {
          id: '1',
          title: 'One Piece',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=One+Piece',
          type: 'manga',
          year: '1997',
          rating: '4.8',
          description: 'A story about pirates searching for the ultimate treasure.',
          genres: ['Action', 'Adventure', 'Comedy'],
          status: 'ongoing',
          episodes: 1000
        },
        {
          id: '2',
          title: 'Naruto',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=Naruto',
          type: 'manga',
          year: '1999',
          rating: '4.6',
          description: 'A young ninja seeks to become the strongest ninja in his village.',
          genres: ['Action', 'Adventure', 'Fantasy'],
          status: 'completed',
          episodes: 700
        },
        {
          id: '3',
          title: 'Dragon Ball',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=Dragon+Ball',
          type: 'manga',
          year: '1984',
          rating: '4.7',
          description: 'A martial artist searches for the seven Dragon Balls.',
          genres: ['Action', 'Adventure', 'Fantasy'],
          status: 'completed',
          episodes: 519
        },
        {
          id: '4',
          title: 'Attack on Titan',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=Attack+on+Titan',
          type: 'manga',
          year: '2009',
          rating: '4.9',
          description: 'Humanity fights against giant humanoid creatures called Titans.',
          genres: ['Action', 'Drama', 'Horror'],
          status: 'completed',
          episodes: 139
        },
        {
          id: '5',
          title: 'My Hero Academia',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=My+Hero+Academia',
          type: 'manga',
          year: '2014',
          rating: '4.5',
          description: 'A boy without powers in a world of superheroes.',
          genres: ['Action', 'Adventure', 'Superhero'],
          status: 'ongoing',
          episodes: 300
        },
        {
          id: '6',
          title: 'Demon Slayer',
          image: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=Demon+Slayer',
          type: 'manga',
          year: '2016',
          rating: '4.7',
          description: 'A young man becomes a demon slayer to save his sister.',
          genres: ['Action', 'Fantasy', 'Horror'],
          status: 'completed',
          episodes: 205
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setManga(mockManga);
    } catch (error) {
      console.error('Error fetching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterManga = () => {
    let filtered = manga;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(manga =>
        manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manga.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(manga =>
        manga.genres?.includes(selectedGenre)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(manga =>
        manga.status === selectedStatus
      );
    }

    setFilteredManga(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const getUniqueGenres = () => {
    const genres = manga.flatMap(manga => manga.genres || []);
    return ['all', ...Array.from(new Set(genres))];
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Manga</h1>
          <p>Discover amazing manga series</p>
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
        <h1>Manga</h1>
        <p>Discover amazing manga series from Japan</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <SearchBar onSearch={handleSearch} placeholder="Search manga..." />
        
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

          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>Found {filteredManga.length} manga series</p>
      </div>

      {/* Manga Grid */}
      {filteredManga.length > 0 ? (
        <div className="content-grid">
          {filteredManga.map((manga) => (
            <ContentCard key={manga.id} content={manga} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No manga found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Manga;
