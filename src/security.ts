import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { FastifyInstance } from 'fastify';

// Content Security Policy configuration
const cspDirectives = {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  mediaSrc: ["'self'", "https:", "blob:"],
  connectSrc: ["'self'", "https:"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: []
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

// CORS configuration
const corsConfig = {
  origin: process.env.NODE_ENV === 'development' ? true : (process.env.FRONTEND_URL || ['http://localhost:3010', 'http://localhost:5173', 'http://localhost:5183']),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Security headers configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: cspDirectives
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
};

// Input validation middleware
export const validateInput = (input: any): boolean => {
  if (!input || typeof input !== 'object') return false;
  
  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i
  ];
  
  const inputString = JSON.stringify(input);
  return !dangerousPatterns.some(pattern => pattern.test(inputString));
};

// Error handling middleware
export const secureErrorHandler = (error: any): any => {
  // Don't expose sensitive information in error messages
  const sanitizedError = {
    message: 'An error occurred',
    status: 500,
    timestamp: new Date().toISOString()
  };
  
  // Log the actual error for debugging (but don't expose it)
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  return sanitizedError;
};

// In-memory rate limiting store
const rateLimitStore = new Map<string, number[]>();

// Security middleware setup for Fastify
export const setupSecurityMiddleware = async (fastify: FastifyInstance): Promise<void> => {
  // Apply CORS
  await fastify.register(require('@fastify/cors'), corsConfig);
  
  // Add security headers
  fastify.addHook('onRequest', async (request, reply) => {
    // Apply rate limiting
    const clientIP = request.ip;
    const now = Date.now();
    const windowStart = now - rateLimitConfig.windowMs;
    
    const clientRequests = rateLimitStore.get(clientIP) || [];
    const recentRequests = clientRequests.filter((timestamp: number) => timestamp > windowStart);
    
    if (recentRequests.length >= rateLimitConfig.max) {
      return reply.status(429).send(rateLimitConfig.message);
    }
    
    recentRequests.push(now);
    rateLimitStore.set(clientIP, recentRequests);
    
    // Add security headers
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  });
  
  // Input validation hook
  fastify.addHook('preValidation', async (request, reply) => {
    if (request.body && !validateInput(request.body)) {
      return reply.status(400).send({
        error: 'Invalid input detected',
        message: 'The request contains potentially dangerous content'
      });
    }
  });
  
  // Error handling hook
  fastify.setErrorHandler((error, request, reply) => {
    const sanitizedError = secureErrorHandler(error);
    reply.status(sanitizedError.status).send(sanitizedError);
  });
};

// Export configurations for use in other files
export const securityConfig = {
  cspDirectives,
  rateLimitConfig,
  corsConfig,
  helmetConfig
};
