"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// rate limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: {
        statusCode: 429,
        message: "Too many requests, please try again later."
    }
});
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const PORT = 3000;
    app.use(express_1.default.json(), (0, cors_1.default)(), (0, helmet_1.default)(), limiter);
    app.get("/", (req, res, next) => {
        return res
            .status(200)
            .json({ message: "Welcome to Social Media App by Bassem." });
    });
    app.use("{/*dummy}", (req, res) => {
        return res
            .status(404)
            .json({ message: "Handler not found!" });
    });
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};
exports.bootstrap = bootstrap;
