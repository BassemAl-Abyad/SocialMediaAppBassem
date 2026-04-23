import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import {
  GENERAL_LIMITER_WINDOW_MS,
  GENERAL_LIMITER_MAX_REQUESTS,
  STRICT_LIMITER_WINDOW_MS,
  STRICT_LIMITER_MAX_REQUESTS,
  API_LIMITER_WINDOW_MS,
  API_LIMITER_MAX_REQUESTS,
  BLOCKED_IPS
} from '../../config/config.service';

// In-memory store for dynamically blocked IPs (for runtime blocking)
const dynamicBlockedIPs = new Set<string>();

export const ipBlockerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  if (!clientIP) {
    return next();
  }

  // Check if IP is in environment blocked list
  if (BLOCKED_IPS.includes(clientIP)) {
    return res.status(403).json({
      statusCode: 403,
      message: 'Access denied: IP address is blocked',
      error: 'IP_BLOCKED'
    });
  }

  // Check if IP is in dynamic blocked list
  if (dynamicBlockedIPs.has(clientIP)) {
    return res.status(403).json({
      statusCode: 403,
      message: 'Access denied: IP address is temporarily blocked',
      error: 'IP_TEMPORARILY_BLOCKED'
    });
  }

  next();
};

// Block an IP dynamically
export const blockIP = (ip: string): { success: boolean; message: string } => {
  if (!ip || typeof ip !== 'string') {
    return { success: false, message: 'Invalid IP address' };
  }

  if (dynamicBlockedIPs.has(ip)) {
    return { success: false, message: 'IP address is already blocked' };
  }

  dynamicBlockedIPs.add(ip);
  return { success: true, message: `IP ${ip} has been blocked` };
};

// Unblock an IP dynamically
export const unblockIP = (ip: string): { success: boolean; message: string } => {
  if (!ip || typeof ip !== 'string') {
    return { success: false, message: 'Invalid IP address' };
  }

  if (!dynamicBlockedIPs.has(ip)) {
    return { success: false, message: 'IP address is not in the blocked list' };
  }

  dynamicBlockedIPs.delete(ip);
  return { success: true, message: `IP ${ip} has been unblocked` };
};

// Get list of all dynamically blocked IPs
export const getBlockedIPs = (): string[] => {
  return Array.from(dynamicBlockedIPs);
};

// Check if an IP is blocked
export const isIPBlocked = (ip: string): boolean => {
  return BLOCKED_IPS.includes(ip) || dynamicBlockedIPs.has(ip);
};

// General rate limiter for all requests
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: GENERAL_LIMITER_WINDOW_MS,
  max: GENERAL_LIMITER_MAX_REQUESTS,
  message: {
    statusCode: 429,
    message: `Too many requests from this IP, please try again after ${GENERAL_LIMITER_WINDOW_MS / 1000 / 60} minutes.`,
    retryAfter: GENERAL_LIMITER_WINDOW_MS / 1000
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for sensitive endpoints (login, register, etc.)
export const strictLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: STRICT_LIMITER_WINDOW_MS,
  max: STRICT_LIMITER_MAX_REQUESTS,
  message: {
    statusCode: 429,
    message: `Too many attempts from this IP, please try again after ${STRICT_LIMITER_WINDOW_MS / 1000 / 60} minutes.`,
    retryAfter: STRICT_LIMITER_WINDOW_MS / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// API rate limiter for general API endpoints
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: API_LIMITER_WINDOW_MS,
  max: API_LIMITER_MAX_REQUESTS,
  message: {
    statusCode: 429,
    message: `API rate limit exceeded, please try again after ${API_LIMITER_WINDOW_MS / 1000} seconds.`,
    retryAfter: API_LIMITER_WINDOW_MS / 1000
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