import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

// General rate limiter for all requests
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for sensitive endpoints (login, register, etc.)
export const strictLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    statusCode: 429,
    message: 'Too many attempts from this IP, please try again after 15 minutes.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// API rate limiter for general API endpoints
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    statusCode: 429,
    message: 'API rate limit exceeded, please try again after 1 minute.',
    retryAfter: 60 // 1 minute in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a store for rate limiting (optional, for production with Redis)
export const createRateLimitStore = () => {
  // This would be used with Redis in production
  // For now, using the default memory store
  return undefined;
};