"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationService {
    constructor() { }
    signUp = (req, res) => {
        return res.status(200).json({ message: "Sign up" });
    };
    login = (req, res) => {
        return res.status(200).json({ message: "Login" });
    };
    logout = (req, res) => {
        return res.status(200).json({ message: "Logout" });
    };
}
exports.default = new AuthenticationService();
