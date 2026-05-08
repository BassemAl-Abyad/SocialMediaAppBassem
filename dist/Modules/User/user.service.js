"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserService {
    constructor() { }
    getProfile = async (req, res) => {
        return res.status(200).json({ message: "Done.", data: req.user });
    };
}
exports.default = new UserService();
