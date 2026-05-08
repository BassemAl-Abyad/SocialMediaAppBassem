"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keys = exports.ttl = exports.expire = exports.del = exports.update = exports.get = exports.set = exports.globalRevokeKey = exports.revokeTokenKey = exports.revokeTokenKeyPrefix = void 0;
const redis_connection_js_1 = require("./redis.connection.js");
const revokeTokenKeyPrefix = ({ userId }) => {
    return `user:revokeToken:${userId}`;
};
exports.revokeTokenKeyPrefix = revokeTokenKeyPrefix;
const revokeTokenKey = ({ userId, jti }) => {
    return `${(0, exports.revokeTokenKeyPrefix)({ userId })}:${jti}`;
};
exports.revokeTokenKey = revokeTokenKey;
const globalRevokeKey = ({ userId }) => {
    return `user:globalRevoke:${userId}`;
};
exports.globalRevokeKey = globalRevokeKey;
const set = async ({ key, value, ttl = null }) => {
    try {
        const data = typeof value != "string" ? JSON.stringify(value) : value;
        if (ttl) {
            return await redis_connection_js_1.redisClient.set(key, data, {
                expiration: { type: "EX", value: ttl },
            });
        }
        else {
            return await redis_connection_js_1.redisClient.set(key, data);
        }
    }
    catch (error) {
        console.log("Redis set error: ", error);
        return null;
    }
};
exports.set = set;
const get = async ({ key }) => {
    try {
        const data = await redis_connection_js_1.redisClient.get(key);
        return data;
    }
    catch (error) {
        console.log("Redis get error: ", error);
        return null;
    }
};
exports.get = get;
const update = async ({ key, value, ttl = null }) => {
    try {
        const isExists = await redis_connection_js_1.redisClient.exists(key);
        if (!isExists)
            return false;
        const data = typeof value != "string" ? JSON.stringify(value) : value;
        if (ttl) {
            return await redis_connection_js_1.redisClient.set(key, data, {
                expiration: { type: "EX", value: ttl },
            });
        }
        else {
            return await redis_connection_js_1.redisClient.set(key, data);
        }
    }
    catch (error) {
        console.log("Redis update error: ", error);
        return null;
    }
};
exports.update = update;
const del = async ({ key }) => {
    try {
        const isExists = await redis_connection_js_1.redisClient.exists(key);
        if (!isExists)
            return false;
        return await redis_connection_js_1.redisClient.del(key);
    }
    catch (error) {
        console.log("Redis delete error: ", error);
        return null;
    }
};
exports.del = del;
const expire = async ({ key, ttl }) => {
    try {
        const isExists = await redis_connection_js_1.redisClient.exists(key);
        if (!isExists)
            return false;
        return await redis_connection_js_1.redisClient.expire(key, ttl);
    }
    catch (error) {
        console.log("Redis expire error: ", error);
        return null;
    }
};
exports.expire = expire;
const ttl = async ({ key }) => {
    try {
        const isExists = await redis_connection_js_1.redisClient.exists(key);
        if (!isExists)
            return false;
        return await redis_connection_js_1.redisClient.ttl(key);
    }
    catch (error) {
        console.log("Redis ttl error: ", error);
        return null;
    }
};
exports.ttl = ttl;
const keys = async ({ pattern }) => {
    try {
        return await redis_connection_js_1.redisClient.keys(pattern);
    }
    catch (error) {
        console.log("Redis keys error: ", error);
        return null;
    }
};
exports.keys = keys;
