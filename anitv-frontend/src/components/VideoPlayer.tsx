import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import type { StreamingLink } from '../types';
import './VideoPlayer.css';

interface VideoPlayerProps {
  streamingLinks: StreamingLink[];
  title: string;
  onClose: () => void;
  onQualityChange?: (quality: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  streamingLinks,
  title,
  onClose,
  onQualityChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get the best quality available (prioritize 1080p, then 720p, then others)
  const getBestQuality = (links: StreamingLink[]): StreamingLink => {
    const sorted = links.sort((a, b) => {
      const qualityA = parseInt(a.quality.replace(/\D/g, ''));
      const qualityB = parseInt(b.quality.replace(/\D/g, ''));
      return qualityB - qualityA;
    });
    return sorted[0];
  };

  // Create quality mapping for Plyr (string to number)
  const createQualityMapping = (links: StreamingLink[]) => {
    const mapping: { [key: string]: number } = {};
    links.forEach((link, index) => {
      mapping[link.quality] = index;
    });
    return mapping;
  };

  useEffect(() => {
    if (!videoRef.current || streamingLinks.length === 0) return;

    const bestQuality = getBestQuality(streamingLinks);
    setCurrentQuality(bestQuality.quality);

    // Create quality mapping
    const qualityMapping = createQualityMapping(streamingLinks);
    const bestQualityIndex = qualityMapping[bestQuality.quality];

    // Initialize Plyr
    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      settings: ['captions', 'quality', 'speed'],
      quality: {
        default: bestQualityIndex,
        options: streamingLinks.map((_, index) => index),
        forced: true,
        onChange: (qualityIndex: number) => {
          const qualityString = streamingLinks[qualityIndex]?.quality || bestQuality.quality;
          setCurrentQuality(qualityString);
          onQualityChange?.(qualityString);
        }
      },
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }
    });

    // Set video source
    videoRef.current.src = bestQuality.url;
    videoRef.current.load();

    // Handle loading states
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadStart = () => setIsLoading(true);

    videoRef.current.addEventListener('canplay', handleCanPlay);
    videoRef.current.addEventListener('loadstart', handleLoadStart);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (videoRef.current) {
        videoRef.current.removeEventListener('canplay', handleCanPlay);
        videoRef.current.removeEventListener('loadstart', handleLoadStart);
      }
    };
  }, [streamingLinks, onQualityChange]);

  const handleQualityChange = (quality: string) => {
    if (!videoRef.current || !playerRef.current) return;

    const selectedLink = streamingLinks.find(link => link.quality === quality);
    if (selectedLink) {
      const currentTime = videoRef.current.currentTime;
      videoRef.current.src = selectedLink.url;
      videoRef.current.currentTime = currentTime;
      videoRef.current.load();
      setCurrentQuality(quality);
      onQualityChange?.(quality);
    }
  };

  if (streamingLinks.length === 0) {
    return (
      <div className="video-player-error">
        <div className="error-content">
          <h3>No streaming sources available</h3>
          <p>This content is not available for streaming at the moment.</p>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <div className="video-player-header">
        <h3>{title}</h3>
        <div className="video-controls">
          {/* Quality Selector */}
          {streamingLinks.length > 1 && (
            <select
              value={currentQuality}
              onChange={(e) => handleQualityChange(e.target.value)}
              className="quality-selector"
            >
              {streamingLinks.map((link) => (
                <option key={link.quality} value={link.quality}>
                  {link.quality}
                </option>
              ))}
            </select>
          )}
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      <div className="video-player-wrapper">
        {isLoading && (
          <div className="video-loading">
            <div className="loading-spinner"></div>
            <p>Loading video...</p>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="video-player"
          playsInline
          controls
        >
          <source src="" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="video-info">
        <p>Quality: {currentQuality}</p>
        <p>Available sources: {streamingLinks.length}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
