"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitStore = exports.apiLimiter = exports.strictLimiter = exports.generalLimiter = exports.isIPBlocked = exports.getBlockedIPs = exports.unblockIP = exports.blockIP = exports.ipBlockerMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_service_1 = require("../../config/config.service");
// In-memory store for dynamically blocked IPs (for runtime blocking)
const dynamicBlockedIPs = new Set();
const ipBlockerMiddleware = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    if (!clientIP) {
        return next();
    }
    // Check if IP is in environment blocked list
    if (config_service_1.BLOCKED_IPS.includes(clientIP)) {
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
exports.ipBlockerMiddleware = ipBlockerMiddleware;
// Block an IP dynamically
const blockIP = (ip) => {
    if (!ip || typeof ip !== 'string') {
        return { success: false, message: 'Invalid IP address' };
    }
    if (dynamicBlockedIPs.has(ip)) {
        return { success: false, message: 'IP address is already blocked' };
    }
    dynamicBlockedIPs.add(ip);
    return { success: true, message: `IP ${ip} has been blocked` };
};
exports.blockIP = blockIP;
// Unblock an IP dynamically
const unblockIP = (ip) => {
    if (!ip || typeof ip !== 'string') {
        return { success: false, message: 'Invalid IP address' };
    }
    if (!dynamicBlockedIPs.has(ip)) {
        return { success: false, message: 'IP address is not in the blocked list' };
    }
    dynamicBlockedIPs.delete(ip);
    return { success: true, message: `IP ${ip} has been unblocked` };
};
exports.unblockIP = unblockIP;
// Get list of all dynamically blocked IPs
const getBlockedIPs = () => {
    return Array.from(dynamicBlockedIPs);
};
exports.getBlockedIPs = getBlockedIPs;
// Check if an IP is blocked
const isIPBlocked = (ip) => {
    return config_service_1.BLOCKED_IPS.includes(ip) || dynamicBlockedIPs.has(ip);
};
exports.isIPBlocked = isIPBlocked;
// General rate limiter for all requests
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_service_1.GENERAL_LIMITER_WINDOW_MS,
    max: config_service_1.GENERAL_LIMITER_MAX_REQUESTS,
    message: {
        statusCode: 429,
        message: `Too many requests from this IP, please try again after ${config_service_1.GENERAL_LIMITER_WINDOW_MS / 1000 / 60} minutes.`,
        retryAfter: config_service_1.GENERAL_LIMITER_WINDOW_MS / 1000
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Strict rate limiter for sensitive endpoints (login, register, etc.)
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_service_1.STRICT_LIMITER_WINDOW_MS,
    max: config_service_1.STRICT_LIMITER_MAX_REQUESTS,
    message: {
        statusCode: 429,
        message: `Too many attempts from this IP, please try again after ${config_service_1.STRICT_LIMITER_WINDOW_MS / 1000 / 60} minutes.`,
        retryAfter: config_service_1.STRICT_LIMITER_WINDOW_MS / 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});
// API rate limiter for general API endpoints
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_service_1.API_LIMITER_WINDOW_MS,
    max: config_service_1.API_LIMITER_MAX_REQUESTS,
    message: {
        statusCode: 429,
        message: `API rate limit exceeded, please try again after ${config_service_1.API_LIMITER_WINDOW_MS / 1000} seconds.`,
        retryAfter: config_service_1.API_LIMITER_WINDOW_MS / 1000
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
