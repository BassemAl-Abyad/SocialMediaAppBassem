"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.generateOTPWithExpiration = generateOTPWithExpiration;
const nanoid_1 = require("nanoid");
function generateOTP() {
    return (0, nanoid_1.customAlphabet)("0123456789", 6)();
}
function generateOTPWithExpiration(expirationMinutes = 5) {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    return { otp, expiresAt };
}
