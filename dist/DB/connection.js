"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_service_1 = require("../config/config.service");
const connectDB = async () => {
    try {
        const connection = await mongoose_1.default.connect(config_service_1.DB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB connected successfully on ${connection.connection.host}.`);
    }
    catch (error) {
        console.log(`MongoDB connection failed, error: ${error.message}`);
    }
};
exports.default = connectDB;
