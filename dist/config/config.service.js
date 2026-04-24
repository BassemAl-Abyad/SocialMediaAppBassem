"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCKED_IPS = exports.API_LIMITER_MAX_REQUESTS = exports.API_LIMITER_WINDOW_MS = exports.STRICT_LIMITER_MAX_REQUESTS = exports.STRICT_LIMITER_WINDOW_MS = exports.GENERAL_LIMITER_MAX_REQUESTS = exports.GENERAL_LIMITER_WINDOW_MS = exports.WHITE_LIST = exports.USER_PASSWORD = exports.USER_EMAIL = exports.CLIENT_ID = exports.REFRESH_EXPIRES = exports.ACCESS_EXPIRES = exports.TOKEN_REFRESH_ADMIN_SECRET_KEY = exports.TOKEN_ACCESS_ADMIN_SECRET_KEY = exports.TOKEN_REFRESH_USER_SECRET_KEY = exports.TOKEN_ACCESS_USER_SECRET_KEY = exports.ENCRYPTION_SECRET = exports.SALT = exports.REDIS_URI = exports.DB_URI = exports.PORT = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const env = process.env.NODE_ENV || "dev";
const envFile = `.env.${env}`;
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), `src/config/${envFile}`) });
function getEnv(key) {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not defined.`);
    }
    return value;
}
// Main
exports.PORT = getEnv("PORT");
exports.DB_URI = getEnv("DB_URI");
exports.REDIS_URI = getEnv("REDIS_URI");
// Encryption
exports.SALT = getEnv("SALT");
exports.ENCRYPTION_SECRET = getEnv("ENCRYPTION_SECRET_KEY");
// Tokens
exports.TOKEN_ACCESS_USER_SECRET_KEY = getEnv("TOKEN_ACCESS_USER_SECRET_KEY");
exports.TOKEN_REFRESH_USER_SECRET_KEY = getEnv("TOKEN_REFRESH_USER_SECRET_KEY");
exports.TOKEN_ACCESS_ADMIN_SECRET_KEY = getEnv("TOKEN_ACCESS_ADMIN_SECRET_KEY");
exports.TOKEN_REFRESH_ADMIN_SECRET_KEY = getEnv("TOKEN_REFRESH_ADMIN_SECRET_KEY");
// Access time
exports.ACCESS_EXPIRES = getEnv("ACCESS_EXPIRES");
exports.REFRESH_EXPIRES = getEnv("REFRESH_EXPIRES");
// Social Login
exports.CLIENT_ID = getEnv("CLIENT_ID");
// Sending Email
exports.USER_EMAIL = getEnv("USER_EMAIL");
exports.USER_PASSWORD = getEnv("USER_PASSWORD");
// White List
exports.WHITE_LIST = getEnv("WHITE_LIST").split(",");
// Rate Limiter
exports.GENERAL_LIMITER_WINDOW_MS = parseInt(getEnv("GENERAL_LIMITER_WINDOW_MS"));
exports.GENERAL_LIMITER_MAX_REQUESTS = parseInt(getEnv("GENERAL_LIMITER_MAX_REQUESTS"));
exports.STRICT_LIMITER_WINDOW_MS = parseInt(getEnv("STRICT_LIMITER_WINDOW_MS"));
exports.STRICT_LIMITER_MAX_REQUESTS = parseInt(getEnv("STRICT_LIMITER_MAX_REQUESTS"));
exports.API_LIMITER_WINDOW_MS = parseInt(getEnv("API_LIMITER_WINDOW_MS"));
exports.API_LIMITER_MAX_REQUESTS = parseInt(getEnv("API_LIMITER_MAX_REQUESTS"));
// Blocked IPs
exports.BLOCKED_IPS = getEnv("BLOCKED_IPS") === "" ? [] : getEnv("BLOCKED_IPS").split(",").map(ip => ip.trim());
