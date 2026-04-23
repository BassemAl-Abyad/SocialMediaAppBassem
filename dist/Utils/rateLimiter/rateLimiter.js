"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitStore = exports.apiLimiter = exports.strictLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General rate limiter for all requests
exports.generalLimiter = (0, express_rate_limit_1.default)({
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
exports.strictLimiter = (0, express_rate_limit_1.default)({
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
exports.apiLimiter = (0, express_rate_limit_1.default)({
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
const createRateLimitStore = () => {
    // This would be used with Redis in production
    // For now, using the default memory store
    return undefined;
};
exports.createRateLimitStore = createRateLimitStore;
