"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIPBlocked = exports.getBlockedIPs = exports.unblockIP = exports.blockIP = exports.ipBlockerMiddleware = void 0;
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
