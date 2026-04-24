"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const user_repo_1 = require("../../DB/repositories/user.repo");
const error_response_1 = require("../../Utils/response/error.response");
const hash_1 = require("../../Utils/security/hash");
const encryption_1 = require("../../Utils/security/encryption");
class AuthenticationService {
    _userModel = new user_repo_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password, phone } = req.body;
        const checkUser = await this._userModel.findOne({
            filter: { email },
            select: "email",
        });
        if (checkUser)
            throw new error_response_1.ConflictException("User already exists.");
        const [firstName, lastName] = username.split(" ");
        const user = await this._userModel.create({
            data: [{ firstName, lastName, email, password: await (0, hash_1.generateHash)(password), phone: await (0, encryption_1.encrypt)(phone) }],
        });
        return res.status(201).json({ message: "User created successfully.", data: { user } });
    };
}
exports.default = new AuthenticationService();
