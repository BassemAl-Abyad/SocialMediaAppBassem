"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const user_repo_1 = require("../../DB/repositories/user.repo");
const error_response_1 = require("../../Utils/response/error.response");
const hash_1 = require("../../Utils/security/hash");
const encryption_1 = require("../../Utils/security/encryption");
const generateOTP_1 = require("../../Utils/generateOTP");
const email_events_1 = require("../../Utils/events/email.events");
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
        const otp = (0, generateOTP_1.generateOTP)();
        const [firstName, lastName] = username.split(" ");
        const user = await this._userModel.create({
            data: [
                {
                    firstName,
                    lastName,
                    username,
                    email,
                    password: await (0, hash_1.generateHash)(password),
                    phone: await (0, encryption_1.encrypt)(phone),
                    confirmEmailOTP: await (0, hash_1.generateHash)(otp),
                },
            ],
        });
        await email_events_1.emailEvents.emit("confirmEmail", { to: email, username, otp });
        return res
            .status(201)
            .json({ message: "User created successfully.", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                confirmEmailOTP: { $exists: true },
                confirmEmail: { $exists: false },
            },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found or already confirmed.");
        if (!(await (0, hash_1.compareHash)(otp, user?.confirmEmailOTP)))
            throw new error_response_1.NotFoundException("Invalid OTP.");
        await this._userModel.updateOne({
            filter: { email },
            update: {
                confirmEmail: new Date(),
                $unset: {
                    confirmEmailOTP: true,
                },
            },
        });
        return res
            .status(200)
            .json({ message: "User confirmed successfully." });
    };
}
exports.default = new AuthenticationService();
