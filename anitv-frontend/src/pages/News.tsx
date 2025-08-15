import { useState, useEffect } from 'react';
import type { NewsItem } from '../types';
import './News.css';

interface NewsItemExtended extends NewsItem {
  image?: string;
  author?: string;
  readTime?: string;
}

const News = () => {
  const [news, setNews] = useState<NewsItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Mock data for news - will be replaced with actual API calls
      const mockNews: NewsItemExtended[] = [
        {
          id: '1',
          title: 'New Season of Attack on Titan Announced',
          content: 'The highly anticipated final season of Attack on Titan has been officially announced for release in 2024.',
          date: '2024-01-15',
          category: 'anime',
          image: 'https://via.placeholder.com/400x250/1a1a2e/ffffff?text=Attack+on+Titan+News',
          author: 'Anime News Network',
          readTime: '3 min read'
        },
        {
          id: '2',
          title: 'One Piece Live Action Series Renewed for Season 2',
          content: 'Netflix has officially renewed the One Piece live action series for a second season following its successful debut.',
          date: '2024-01-14',
          category: 'live-action',
          image: 'https://via.placeholder.com/400x250/1a1a2e/ffffff?text=One+Piece+Live+Action',
          author: 'Entertainment Weekly',
          readTime: '5 min read'
        },
        {
          id: '3',
          title: 'Demon Slayer Movie Breaks Box Office Records',
          content: 'The latest Demon Slayer movie has broken multiple box office records in Japan and worldwide.',
          date: '2024-01-13',
          category: 'anime',
          image: 'https://via.placeholder.com/400x250/1a1a2e/ffffff?text=Demon+Slayer+Movie',
          author: 'Box Office Mojo',
          readTime: '4 min read'
        },
        {
          id: '4',
          title: 'New Studio Ghibli Film Announced',
          content: 'Studio Ghibli has announced a new feature film directed by Hayao Miyazaki, set to release in 2024.',
          date: '2024-01-12',
          category: 'anime',
          image: 'https://via.placeholder.com/400x250/1a1a2e/ffffff?text=Studio+Ghibli',
          author: 'Anime News Network',
          readTime: '6 min read'
        },
        {
          id: '5',
          title: 'My Hero Academia Final Season Confirmed',
          content: 'The final season of My Hero Academia has been confirmed and will adapt the remaining manga chapters.',
          date: '2024-01-11',
          category: 'anime',
          image: 'https://via.placeholder.com/400x250/1a1a2e/ffffff?text=My+Hero+Academia',
          author: 'Crunchyroll News',
          readTime: '3 min read'
        },
        {
          id: '6',
          title: 'Dragon Ball Super Returns with New Arc',
          content: 'Dragon Ball Super is returning with a new arc that will explore the origins of the Saiyans.',
          date: '2024-01-10',
          category: 'anime',
          image: 'https://via.placeholder.com/400x250/1a1a2e/ffffff?text=Dragon+Ball+Super',
          author: 'Shonen Jump',
          readTime: '4 min read'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNews(mockNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'anime':
        return 'var(--accent-color)';
      case 'live-action':
        return 'var(--success-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>News</h1>
          <p>Latest updates from the anime and entertainment world</p>
        </div>
        <div className="news-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="news-card skeleton">
              <div className="news-image skeleton-image"></div>
              <div className="news-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
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
        <h1>News</h1>
        <p>Latest updates from the anime and entertainment world</p>
      </div>

      {/* Category Filter */}
      <div className="news-filters">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All News
        </button>
        <button
          className={`category-btn ${selectedCategory === 'anime' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('anime')}
        >
          Anime
        </button>
        <button
          className={`category-btn ${selectedCategory === 'live-action' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('live-action')}
        >
          Live Action
        </button>
      </div>

      {/* News Grid */}
      <div className="news-grid">
        {filteredNews.map((item) => (
          <article key={item.id} className="news-card">
            <div className="news-image">
              <img src={item.image} alt={item.title} />
              <div 
                className="news-category"
                style={{ backgroundColor: getCategoryColor(item.category) }}
              >
                {item.category}
              </div>
            </div>
            <div className="news-content">
              <div className="news-meta">
                <span className="news-author">{item.author}</span>
                <span className="news-date">{formatDate(item.date)}</span>
                <span className="news-read-time">{item.readTime}</span>
              </div>
              <h3 className="news-title">{item.title}</h3>
              <p className="news-excerpt">{item.content}</p>
              <button className="btn btn-primary btn-sm">Read More</button>
            </div>
          </article>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="no-results">
          <h3>No news found</h3>
          <p>Try selecting a different category</p>
        </div>
      )}
    </div>
  );
};

export default News;
