import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import type { Movie, TVShow, Anime, Episode, StreamingLink } from '../types';
import { movieApi, tvShowApi, animeApi } from '../services/api';
import './ContentDetail.css';

const ContentDetail = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | TVShow | Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [streamingLinks, setStreamingLinks] = useState<StreamingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (type && id) {
      fetchContentDetails();
    }
  }, [type, id]);

  const fetchContentDetails = async () => {
    if (!type || !id) {
      console.error('Missing type or id parameter');
      return;
    }

    setLoading(true);
    try {
      let contentData: Movie | TVShow | Anime | null = null;
      let streamingData: any = null;

      // Fetch content details based on type
      switch (type) {
        case 'movie':
          contentData = await movieApi.getInfo(id, 'flixhq');
          streamingData = await movieApi.getStreamingLinks(id, 'flixhq');
          break;
        case 'tv':
          contentData = await tvShowApi.getInfo(id, 'flixhq');
          streamingData = await movieApi.getStreamingLinks(id, 'flixhq');
          break;
        case 'anime':
          contentData = await animeApi.getInfo(id, 'gogoanime');
          streamingData = await animeApi.getStreamingLinks(id, 'gogoanime');
          break;
        default:
          throw new Error('Invalid content type');
      }

      if (contentData) {
        setContent(contentData);
        
        // Extract episodes if available (for TV shows and anime)
        if ((contentData as TVShow | Anime).episodes && Array.isArray((contentData as TVShow | Anime).episodes)) {
          const episodesArray = (contentData as TVShow | Anime).episodes;
          if (episodesArray && episodesArray.length > 0) {
            setEpisodes(episodesArray);
            setSelectedEpisode(episodesArray[0]);
          }
        }

        // Extract streaming links if available
        if (streamingData && streamingData.sources) {
          const links: StreamingLink[] = streamingData.sources.map((source: any) => ({
            quality: source.quality || 'Unknown',
            url: source.url,
            type: source.type || 'mp4'
          }));
          setStreamingLinks(links);
        }
      }
    } catch (error) {
      console.error('Error fetching content details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="content-detail-loading">
        <div className="skeleton-hero">
          <div className="skeleton-cover"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-buttons"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="content-not-found">
        <h2>Content not found</h2>
        <button onClick={handleBack} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="content-detail">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-cover" style={{ backgroundImage: `url(${content.image})` }}>
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-info">
                <h1 className="hero-title">{content.title}</h1>
                                  <div className="hero-meta">
                    <span className="meta-item">{content.year}</span>
                    <span className="meta-item">{content.rating} ⭐</span>
                    <span className="meta-item">{content.genres?.join(', ')}</span>
                  </div>
                <p className="hero-description">{content.description}</p>
                <div className="hero-actions">
                  <button onClick={handlePlay} className="btn btn-primary btn-large">
                    ▶ Play Now
                  </button>
                  <button className="btn btn-secondary btn-large">
                    + Add to List
                  </button>
                </div>
              </div>
              <div className="hero-poster">
                <img src={content.image} alt={content.title} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="content-body">
        <div className="content-grid">
          {/* Main Content */}
          <div className="content-main">
            {/* Video Player Section */}
            {isPlaying && selectedEpisode && (
              <div className="video-section">
                <VideoPlayer
                  streamingLinks={streamingLinks}
                  title={selectedEpisode.title}
                  onClose={() => setIsPlaying(false)}
                  onQualityChange={(quality) => console.log('Quality changed to:', quality)}
                />
              </div>
            )}

            {/* Episodes Section (for TV Shows and Anime) */}
            {type !== 'movie' && episodes.length > 0 && (
              <div className="episodes-section">
                <h3 className="section-title">Episodes</h3>
                <div className="episodes-grid">
                  {episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className={`episode-card ${selectedEpisode?.id === episode.id ? 'active' : ''}`}
                      onClick={() => setSelectedEpisode(episode)}
                    >
                      <div className="episode-thumbnail">
                        <img src={episode.image} alt={episode.title} />
                        <div className="episode-overlay">
                          <span className="episode-number">EP {episode.episode}</span>
                        </div>
                      </div>
                                              <div className="episode-info">
                          <h4>{episode.title}</h4>
                          <p>Episode {episode.episode}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streaming Links */}
            {streamingLinks.length > 0 && (
              <div className="streaming-section">
                <h3 className="section-title">Available Sources</h3>
                <div className="streaming-links">
                  {streamingLinks.map((link) => (
                    <button key={link.quality} className="streaming-link">
                      <span className="link-quality">{link.quality}</span>
                      <span className="link-provider">{link.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="content-sidebar">
            {/* Cast & Crew */}
            <div className="cast-section">
              <h3 className="section-title">Cast & Crew</h3>
              <div className="cast-list">
                {content.cast?.map((actor, index) => (
                  <div key={index} className="cast-member">
                    <div className="cast-avatar">
                      {actor.name.charAt(0)}
                    </div>
                    <span className="cast-name">{actor.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Content */}
            <div className="related-section">
              <h3 className="section-title">You May Also Like</h3>
              <div className="related-list">
                {/* Mock related content */}
                <div className="related-item">
                  <img src="https://via.placeholder.com/100x150/1a1a2e/ffffff?text=Related" alt="Related" />
                  <div className="related-info">
                    <h4>Related Title</h4>
                    <p>2023 • Action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
