import winston from 'winston';
import path from 'path';

// Sanitize sensitive data from logs
const sanitizeData = (data: any): any => {
  if (!data) return data;
  
  const sensitiveFields = [
    'password', 'token', 'key', 'secret', 'authorization',
    'cookie', 'session', 'api_key', 'private_key'
  ];
  
  if (typeof data === 'object') {
    const sanitized = { ...data };
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }
  
  return data;
};

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'anitv-api',
    version: '1.0.0'
  },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Secure logging methods
export const secureLogger = {
  info: (message: string, meta?: any) => {
    logger.info(message, sanitizeData(meta));
  },
  
  error: (message: string, error?: any) => {
    logger.error(message, {
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined,
      timestamp: new Date().toISOString()
    });
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, sanitizeData(meta));
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, sanitizeData(meta));
  },
  
  // Log API requests securely
  logRequest: (req: any, res: any, responseTime?: number) => {
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      timestamp: new Date().toISOString()
    };
    
    // Don't log sensitive headers or body
    logger.info('API Request', logData);
  },
  
  // Log security events
  logSecurityEvent: (event: string, details: any) => {
    logger.warn('Security Event', {
      event,
      details: sanitizeData(details),
      timestamp: new Date().toISOString()
    });
  }
};

export default secureLogger;
