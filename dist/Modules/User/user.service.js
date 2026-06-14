"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repo_1 = require("../../DB/repositories/user.repo");
const user_model_1 = require("../../DB/Models/user.model");
const error_response_1 = require("../../Utils/response/error.response");
class UserService {
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    getProfile = async (user) => {
        return {
            message: "User Profile",
            data: user,
        };
    };
    updateProfile = async (req, res) => {
        const updates = req.body;
        const updated = await this._userRepo.findOneAndUpdate({
            filter: { _id: req.user._id },
            update: { ...updates },
            options: { new: true },
        });
        return res.status(200).json({ message: "Profile updated.", data: updated });
    };
    getUserById = async (req, res) => {
        const { userId } = req.params;
        const user = await this._userRepo.findOne({
            filter: { _id: userId },
            select: "firstName lastName username email phone address gender role ProfilePic createdAt",
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found.");
        return res.status(200).json({ message: "User loaded.", data: user });
    };
}
exports.default = new UserService();
