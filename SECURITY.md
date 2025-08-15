# Security Guide - AniTV Streaming App

## Security Overview
This document outlines security measures for the AniTV streaming application using Consumet API, React frontend, and Render hosting.

## 1. Backend Security (Consumet API)

### 1.1 Essential Security Libraries
```bash
npm install helmet cors rate-limiter-flexible express-rate-limit
npm install --save-dev @types/helmet
```

### 1.2 Security Middleware Implementation
```typescript
// security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const securityMiddleware = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'", "https:"],
        connectSrc: ["'self'", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  }),

  cors: cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
};
```

### 1.3 Environment Variables Security
```env
# Required for production
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
API_KEY=your-secure-api-key

# Optional but recommended
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
TMDB_KEY=your-tmdb-api-key

# Security headers
STRICT_TRANSPORT_SECURITY=true
CONTENT_SECURITY_POLICY=true
```

## 2. Frontend Security (React)

### 2.1 Security Libraries
```bash
npm install helmet react-helmet-async
npm install --save-dev @types/react-helmet-async
```

### 2.2 Content Security Policy
```typescript
// csp.ts
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'media-src': ["'self'", "https:"],
  'connect-src': ["'self'", "https://your-api-domain.com"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"]
};
```

### 2.3 API Communication Security
```typescript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.REACT_APP_API_KEY
  },
  withCredentials: true
});

// Request interceptor for security
api.interceptors.request.use((config) => {
  // Add security headers
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 3. Infrastructure Security (Render)

### 3.1 Environment Variables in Render
- Set all sensitive variables in Render dashboard
- Use Render's built-in secrets management
- Never commit secrets to Git

### 3.2 Network Security
```yaml
# render.yaml
services:
  - type: web
    name: anitv-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: FRONTEND_URL
        value: https://your-frontend-domain.com
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
      - path: /*
        name: Referrer-Policy
        value: strict-origin-when-cross-origin
```

## 4. Content Security (Streaming)

### 4.1 Video Player Security
```typescript
// VideoPlayer.tsx
import Plyr from 'plyr';

const VideoPlayer = ({ src, poster }) => {
  const playerConfig = {
    controls: ['play', 'progress', 'current-time', 'volume', 'fullscreen'],
    disableContextMenu: true,
    keyboard: { focused: true, global: false },
    tooltips: { controls: true, seek: true },
    captions: { active: true, language: 'auto', update: true }
  };

  return (
    <video
      crossOrigin="anonymous"
      playsInline
      controls
      poster={poster}
      onContextMenu={(e) => e.preventDefault()}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};
```

### 4.2 Content Validation
```typescript
// contentValidator.ts
export const validateContentUrl = (url: string): boolean => {
  const allowedDomains = [
    'your-api-domain.com',
    'trusted-streaming-domain.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};
```

## 5. Data Protection

### 5.1 User Data Handling
- No personal data collection (streaming app)
- Implement data minimization
- Use HTTPS for all communications
- Implement proper error handling (no sensitive data in errors)

### 5.2 Logging Security
```typescript
// logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'anitv-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Sanitize logs
logger.info('API Request', {
  method: req.method,
  path: req.path,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  // Never log sensitive data
});
```

## 6. Security Testing

### 6.1 Automated Security Tests
```bash
npm install --save-dev eslint-plugin-security
npm install --save-dev @typescript-eslint/eslint-plugin
```

### 6.2 Security Headers Testing
```typescript
// security.test.ts
import request from 'supertest';
import app from '../src/app';

describe('Security Headers', () => {
  it('should include security headers', async () => {
    const response = await request(app).get('/');
    
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('strict-transport-security');
  });
});
```

## 7. Monitoring & Incident Response

### 7.1 Security Monitoring
- Monitor for unusual traffic patterns
- Set up alerts for failed authentication attempts
- Log all API requests and responses
- Monitor for content scraping attempts

### 7.2 Incident Response Plan
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Determine scope and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

## 8. Legal Compliance

### 8.1 Terms of Service
- Clear usage terms
- Copyright compliance
- DMCA takedown procedures
- User responsibility clauses

### 8.2 Privacy Policy
- Data collection practices
- Third-party services
- User rights
- Contact information

## 9. Implementation Checklist

- [ ] Install security middleware (helmet, cors, rate limiting)
- [ ] Configure environment variables securely
- [ ] Implement Content Security Policy
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure security headers
- [ ] Implement input validation
- [ ] Set up error handling (no sensitive data exposure)
- [ ] Configure logging (sanitized)
- [ ] Set up monitoring and alerting
- [ ] Create incident response plan
- [ ] Draft legal documents (Terms, Privacy Policy)
- [ ] Conduct security testing
- [ ] Set up automated security scans

## 10. Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [Render Security Documentation](https://render.com/docs/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
