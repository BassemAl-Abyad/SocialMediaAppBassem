"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_service_js_1 = require("../../config/config.service.js");
const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = config_service_js_1.ENCRYPTION_SECRET;
const encrypt = async (text) => {
    const iv = node_crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_SECRET_KEY), iv);
    let encryptedData = cipher.update(text, "utf8", "hex");
    encryptedData += cipher.final("hex");
    return `${iv.toString("hex")}:${encryptedData}`;
};
exports.encrypt = encrypt;
const decrypt = async (encryptedData) => {
    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
        throw new Error("Invalid encrypted data format");
    }
    const [iv, encryptedText] = parts;
    if (!iv || !encryptedText) {
        throw new Error("Invalid encrypted data format");
    }
    const binaryLike = Buffer.from(iv, "hex");
    const decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, binaryLike);
    let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
};
exports.decrypt = decrypt;
