import { test, expect } from '@jest/globals';
import { validateInput, secureErrorHandler } from '../security';
import { 
  validateContentUrl, 
  validateContentType, 
  sanitizeContentMetadata,
  validateStreamingSources,
  validateSubtitleSources
} from '../utils/contentValidator';

describe('Security Tests', () => {
  describe('Input Validation', () => {
    test('should validate safe input', () => {
      const safeInput = { query: 'spider man', page: 1 };
      expect(validateInput(safeInput)).toBe(true);
    });

    test('should reject script injection', () => {
      const maliciousInput = { query: '<script>alert("xss")</script>' };
      expect(validateInput(maliciousInput)).toBe(false);
    });

    test('should reject javascript protocol', () => {
      const maliciousInput = { url: 'javascript:alert("xss")' };
      expect(validateInput(maliciousInput)).toBe(false);
    });
  });

  describe('Content URL Validation', () => {
    test('should validate safe URLs', () => {
      const safeUrls = [
        'https://example.com/video.mp4',
        'http://localhost:3010/stream',
        'https://cdn.example.com/movie.webm'
      ];
      
      safeUrls.forEach(url => {
        expect(validateContentUrl(url)).toBe(true);
      });
    });

    test('should reject dangerous URLs', () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'file:///etc/passwd',
        'vbscript:msgbox("xss")',
        'ftp://example.com/file',
        'mailto:test@example.com'
      ];
      
      dangerousUrls.forEach(url => {
        expect(validateContentUrl(url)).toBe(false);
      });
    });

    test('should handle edge cases gracefully', () => {
      expect(validateContentUrl('')).toBe(false);
      expect(validateContentUrl('   ')).toBe(false);
      expect(validateContentUrl(null as any)).toBe(false);
      expect(validateContentUrl(undefined as any)).toBe(false);
      expect(validateContentUrl(123 as any)).toBe(false);
    });

         test('should reject overly long URLs', () => {
       const longUrl = 'https://example.com/' + 'a'.repeat(3000);
       expect(validateContentUrl(longUrl)).toBe(false);
     });

     test('should validate localhost URLs with new port', () => {
       expect(validateContentUrl('http://localhost:3010/api/video')).toBe(true);
       expect(validateContentUrl('https://localhost:3010/stream')).toBe(true);
     });
  });

  describe('Content Type Validation', () => {
    test('should validate safe content types', () => {
      const safeTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'application/x-mpegURL',
        'video/MP2T'
      ];
      
      safeTypes.forEach(type => {
        expect(validateContentType(type)).toBe(true);
      });
    });

    test('should reject dangerous content types', () => {
      const dangerousTypes = [
        'text/html',
        'application/javascript',
        'text/javascript',
        'application/x-executable'
      ];
      
      dangerousTypes.forEach(type => {
        expect(validateContentType(type)).toBe(false);
      });
    });

    test('should handle edge cases gracefully', () => {
      expect(validateContentType('')).toBe(false);
      expect(validateContentType('   ')).toBe(false);
      expect(validateContentType(null as any)).toBe(false);
      expect(validateContentType(undefined as any)).toBe(false);
      expect(validateContentType(123 as any)).toBe(false);
    });
  });

  describe('Content Metadata Sanitization', () => {
    test('should sanitize dangerous content', () => {
      const dangerousMetadata = {
        title: 'Movie Title',
        description: '<script>alert("xss")</script>',
        script: 'malicious code',
        onload: 'alert("xss")'
      };
      
      const sanitized = sanitizeContentMetadata(dangerousMetadata);
      
      expect(sanitized.title).toBe('Movie Title');
      expect(sanitized.description).toBe('');
      expect(sanitized.script).toBeUndefined();
      expect(sanitized.onload).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should sanitize error messages', () => {
      const sensitiveError = new Error('Database password: secret123');
      const sanitized = secureErrorHandler(sensitiveError);
      
      expect(sanitized.message).toBe('An error occurred');
      expect(sanitized.status).toBe(500);
      expect(sanitized.timestamp).toBeDefined();
    });
  });

  describe('Streaming Sources Validation', () => {
    test('should validate safe streaming sources', () => {
      const safeSources = [
        { url: 'https://example.com/video.mp4', type: 'video/mp4' },
        { url: 'https://cdn.example.com/movie.webm', type: 'video/webm' }
      ];
      
      const validated = validateStreamingSources(safeSources);
      expect(validated).toHaveLength(2);
    });

    test('should filter out dangerous sources', () => {
      const mixedSources = [
        { url: 'https://example.com/video.mp4', type: 'video/mp4' },
        { url: 'javascript:alert("xss")', type: 'video/mp4' },
        { url: 'https://cdn.example.com/movie.webm', type: 'video/webm' }
      ];
      
      const validated = validateStreamingSources(mixedSources);
      expect(validated).toHaveLength(2);
    });

    test('should handle edge cases gracefully', () => {
      expect(validateStreamingSources(null as any)).toEqual([]);
      expect(validateStreamingSources(undefined as any)).toEqual([]);
      expect(validateStreamingSources('not an array' as any)).toEqual([]);
    });

    test('should limit number of sources', () => {
      const manySources = Array.from({ length: 100 }, (_, i) => ({
        url: `https://example.com/video${i}.mp4`,
        type: 'video/mp4'
      }));
      
      const validated = validateStreamingSources(manySources);
      expect(validated).toHaveLength(50);
    });
  });

  describe('Subtitle Sources Validation', () => {
    test('should validate safe subtitle sources', () => {
      const safeSubtitles = [
        { url: 'https://example.com/subtitle.vtt', language: 'en' },
        { url: 'https://cdn.example.com/subtitle.srt', language: 'es' }
      ];
      
      const validated = validateSubtitleSources(safeSubtitles);
      expect(validated).toHaveLength(2);
    });

    test('should filter out dangerous subtitle sources', () => {
      const mixedSubtitles = [
        { url: 'https://example.com/subtitle.vtt', language: 'en' },
        { url: 'javascript:alert("xss")', language: 'en' },
        { url: 'https://cdn.example.com/subtitle.srt', language: 'es' }
      ];
      
      const validated = validateSubtitleSources(mixedSubtitles);
      expect(validated).toHaveLength(2);
    });

    test('should handle edge cases gracefully', () => {
      expect(validateSubtitleSources(null as any)).toEqual([]);
      expect(validateSubtitleSources(undefined as any)).toEqual([]);
      expect(validateSubtitleSources('not an array' as any)).toEqual([]);
    });

    test('should limit number of subtitle sources', () => {
      const manySubtitles = Array.from({ length: 50 }, (_, i) => ({
        url: `https://example.com/subtitle${i}.vtt`,
        language: 'en'
      }));
      
      const validated = validateSubtitleSources(manySubtitles);
      expect(validated).toHaveLength(20);
    });
  });
});
