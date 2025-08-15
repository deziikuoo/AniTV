// Content validation for streaming URLs
export const validateContentUrl = (url: string): boolean => {
  try {
    // Input validation
    if (!url || typeof url !== 'string') {
      console.warn('ContentValidator: Invalid URL input type', { type: typeof url });
      return false;
    }
    
    // Check for empty or whitespace-only strings
    if (url.trim().length === 0) {
      console.warn('ContentValidator: Empty URL provided');
      return false;
    }
    
    // Check URL length to prevent potential DoS attacks
    if (url.length > 2048) {
      console.warn('ContentValidator: URL too long', { length: url.length });
      return false;
    }
    
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      console.warn('ContentValidator: Invalid protocol', { protocol: urlObj.protocol });
      return false;
    }
    
    // Check for dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:', 'mailto:'];
    if (dangerousProtocols.some(protocol => url.toLowerCase().includes(protocol))) {
      console.warn('ContentValidator: Dangerous protocol detected', { url: url.substring(0, 100) });
      return false;
    }
    
    // Check for injection patterns
    const injectionPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
      /alert\s*\(/i,
      /confirm\s*\(/i,
      /prompt\s*\(/i
    ];
    
    if (injectionPatterns.some(pattern => pattern.test(url))) {
      console.warn('ContentValidator: Injection pattern detected', { url: url.substring(0, 100) });
      return false;
    }
    
    // Validate hostname (basic check)
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      console.warn('ContentValidator: Invalid hostname');
      return false;
    }
    
    return true;
  } catch (error) {
    // Graceful error handling
    console.error('ContentValidator: Error validating URL', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      url: url ? url.substring(0, 100) : 'undefined'
    });
    return false;
  }
};

// Validate streaming content type
export const validateContentType = (contentType: string): boolean => {
  try {
    // Input validation
    if (!contentType || typeof contentType !== 'string') {
      console.warn('ContentValidator: Invalid content type input', { type: typeof contentType });
      return false;
    }
    
    // Check for empty or whitespace-only strings
    if (contentType.trim().length === 0) {
      console.warn('ContentValidator: Empty content type provided');
      return false;
    }
    
    // Check content type length to prevent potential attacks
    if (contentType.length > 100) {
      console.warn('ContentValidator: Content type too long', { length: contentType.length });
      return false;
    }
    
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/mkv',
      'application/x-mpegURL',
      'application/vnd.apple.mpegurl',
      'video/MP2T',
      'video/mp2t',
      'audio/mp4',
      'audio/webm',
      'audio/ogg'
    ];
    
    const normalizedContentType = contentType.toLowerCase().trim();
    const isValid = allowedTypes.includes(normalizedContentType);
    
    if (!isValid) {
      console.warn('ContentValidator: Unsupported content type', { contentType: normalizedContentType });
    }
    
    return isValid;
  } catch (error) {
    // Graceful error handling
    console.error('ContentValidator: Error validating content type', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      contentType: contentType ? contentType.substring(0, 50) : 'undefined'
    });
    return false;
  }
};

// Sanitize content metadata
export const sanitizeContentMetadata = (metadata: any): any => {
  try {
    // Input validation
    if (!metadata) {
      console.warn('ContentValidator: No metadata provided for sanitization');
      return {};
    }
    
    if (typeof metadata !== 'object' || Array.isArray(metadata)) {
      console.warn('ContentValidator: Invalid metadata type for sanitization', { type: typeof metadata });
      return {};
    }
    
    // Check for circular references
    const seen = new WeakSet();
    const checkCircular = (obj: any): boolean => {
      if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return true;
        seen.add(obj);
        for (const key in obj) {
          if (checkCircular(obj[key])) return true;
        }
      }
      return false;
    };
    
    if (checkCircular(metadata)) {
      console.error('ContentValidator: Circular reference detected in metadata');
      return {};
    }
    
    const sanitized = { ...metadata };
    
    // Remove potentially dangerous fields
    const dangerousFields = [
      'script', 'javascript', 'onload', 'onerror', 'onclick', 'onmouseover',
      'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
      'onunload', 'onbeforeunload', 'onresize', 'onscroll', 'onkeydown',
      'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove',
      'onmouseout', 'onmouseenter', 'onmouseleave', 'oncontextmenu',
      'eval', 'Function', 'setTimeout', 'setInterval', 'execScript'
    ];
    
    dangerousFields.forEach(field => {
      if (sanitized.hasOwnProperty(field)) {
        console.warn('ContentValidator: Removed dangerous field', { field });
        delete sanitized[field];
      }
    });
    
    // Sanitize string fields
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        const originalValue = sanitized[key];
        
        // Remove script tags and dangerous content
        let sanitizedValue = originalValue
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/data:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/eval\s*\(/gi, '')
          .replace(/Function\s*\(/gi, '')
          .replace(/setTimeout\s*\(/gi, '')
          .replace(/setInterval\s*\(/gi, '');
        
        // Limit string length to prevent potential attacks
        if (sanitizedValue.length > 10000) {
          console.warn('ContentValidator: Truncated long string field', { 
            key, 
            originalLength: originalValue.length,
            truncatedLength: 10000 
          });
          sanitizedValue = sanitizedValue.substring(0, 10000);
        }
        
        sanitized[key] = sanitizedValue;
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeContentMetadata(sanitized[key]);
      }
    });
    
    return sanitized;
  } catch (error) {
    // Graceful error handling
    console.error('ContentValidator: Error sanitizing metadata', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return {};
  }
};

// Validate and sanitize streaming sources
export const validateStreamingSources = (sources: any[]): any[] => {
  try {
    if (!Array.isArray(sources)) {
      console.warn('ContentValidator: Invalid sources input type', { type: typeof sources });
      return [];
    }
    
    if (sources.length > 50) {
      console.warn('ContentValidator: Too many streaming sources', { count: sources.length });
      return sources.slice(0, 50);
    }
    
    return sources.filter(source => {
      try {
        if (!source || typeof source !== 'object') {
          console.warn('ContentValidator: Invalid source object');
          return false;
        }
        
        // Validate URL if present
        if (source.url && !validateContentUrl(source.url)) {
          console.warn('ContentValidator: Invalid source URL', { url: source.url.substring(0, 100) });
          return false;
        }
        
        // Validate content type if present
        if (source.type && !validateContentType(source.type)) {
          console.warn('ContentValidator: Invalid source content type', { type: source.type });
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('ContentValidator: Error validating individual source', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return false;
      }
    });
  } catch (error) {
    console.error('ContentValidator: Error validating streaming sources', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return [];
  }
};

// Validate subtitle sources
export const validateSubtitleSources = (subtitles: any[]): any[] => {
  try {
    if (!Array.isArray(subtitles)) {
      console.warn('ContentValidator: Invalid subtitles input type', { type: typeof subtitles });
      return [];
    }
    
    if (subtitles.length > 20) {
      console.warn('ContentValidator: Too many subtitle sources', { count: subtitles.length });
      return subtitles.slice(0, 20);
    }
    
    return subtitles.filter(subtitle => {
      try {
        if (!subtitle || typeof subtitle !== 'object') {
          return false;
        }
        
        // Validate URL if present
        if (subtitle.url && !validateContentUrl(subtitle.url)) {
          return false;
        }
        
        // Validate language code (basic check)
        if (subtitle.language && typeof subtitle.language !== 'string') {
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('ContentValidator: Error validating subtitle', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return false;
      }
    });
  } catch (error) {
    console.error('ContentValidator: Error validating subtitle sources', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return [];
  }
};
