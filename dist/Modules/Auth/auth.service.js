"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
class AuthenticationService {
    constructor() { }
    signUp = async (req, res) => {
        // DTO types
        const { username, email, password } = req.body;
        const user = await new user_model_1.UserModel({});
        user.save();
        return res.status(200).json({ message: "Signed up successfully." });
    };
    login = (req, res) => {
        return res.status(200).json({ message: "Login" });
    };
    logout = (req, res) => {
        return res.status(200).json({ message: "Logout" });
    };
}
exports.default = new AuthenticationService();
