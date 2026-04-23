import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve("./src/config/.env.dev")});

function getEnv(key:string): string {
    const value  = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not defined.`);
    }
    return value;
}

// Main
export const PORT = getEnv("PORT");
export const DB_URI = getEnv("DB_URI");
export const REDIS_URI = getEnv("REDIS_URI");

// Encryption
export const SALT = getEnv("SALT");
export const ENCRYPTION_SECRET_KEY = getEnv("ENCRYPTION_SECRET_KEY");

// Tokens
export const TOKEN_ACCESS_USER_SECRET_KEY = getEnv("TOKEN_ACCESS_USER_SECRET_KEY");
export const TOKEN_REFRESH_USER_SECRET_KEY = getEnv("TOKEN_REFRESH_USER_SECRET_KEY");
export const TOKEN_ACCESS_ADMIN_SECRET_KEY = getEnv("TOKEN_ACCESS_ADMIN_SECRET_KEY");
export const TOKEN_REFRESH_ADMIN_SECRET_KEY = getEnv("TOKEN_REFRESH_ADMIN_SECRET_KEY");

// Access time
export const ACCESS_EXPIRES = getEnv("ACCESS_EXPIRES");
export const REFRESH_EXPIRES = getEnv("REFRESH_EXPIRES");

// Social Login
export const CLIENT_ID = getEnv("CLIENT_ID");

// Sending Email
export const USER_EMAIL = getEnv("USER_EMAIL");
export const USER_PASSWORD = getEnv("USER_PASSWORD");

// White List
export const WHITE_LIST = getEnv("WHITE_LIST").split(",");



