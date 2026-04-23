"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationService {
    constructor() { }
    signUp = async (req, res) => {
        // DTO types
        const { username, email, password, confirmPassword } = req.body;
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
