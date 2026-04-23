"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHITE_LIST = exports.USER_PASSWORD = exports.USER_EMAIL = exports.CLIENT_ID = exports.REFRESH_EXPIRES = exports.ACCESS_EXPIRES = exports.TOKEN_REFRESH_ADMIN_SECRET_KEY = exports.TOKEN_ACCESS_ADMIN_SECRET_KEY = exports.TOKEN_REFRESH_USER_SECRET_KEY = exports.TOKEN_ACCESS_USER_SECRET_KEY = exports.ENCRYPTION_SECRET_KEY = exports.SALT = exports.REDIS_URI = exports.DB_URI = exports.PORT = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const env = process.env.NODE_ENV || "dev";
const envFile = `.env.${env}`;
dotenv_1.default.config({ path: path_1.default.resolve(`./src/config/${envFile}`) });
function getEnv(key) {
    const value = process.env[key];
    if (!value) {
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
exports.ENCRYPTION_SECRET_KEY = getEnv("ENCRYPTION_SECRET_KEY");
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
