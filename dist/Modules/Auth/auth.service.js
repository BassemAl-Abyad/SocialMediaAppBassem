"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/Models/user.model");
const user_repo_1 = require("../../DB/repositories/user.repo");
const error_response_1 = require("../../Utils/response/error.response");
const hash_1 = require("../../Utils/security/hash");
const encryption_1 = require("../../Utils/security/encryption");
const generateOTP_1 = require("../../Utils/generateOTP");
const email_events_1 = require("../../Utils/events/email.events");
const token_1 = require("../../Utils/services/token");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const redis_service_1 = require("../../DB/repositories/redis.service");
const config_service_1 = require("../../config/config.service");
class AuthenticationService {
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    _tokenService;
    constructor() {
        this._tokenService = new token_1.TokenService();
    }
    signup = async (req, res) => {
        const { username, email, password, phone } = req.body;
        const checkUser = await this._userRepo.findOne({
            filter: { email },
            select: "email",
        });
        if (checkUser)
            throw new error_response_1.ConflictException("User already exists.");
        const otp = (0, generateOTP_1.generateOTP)();
        const [firstName, lastName] = username.split(" ");
        const user = await this._userRepo.create({
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
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this._userRepo.findOne({
            filter: { email, confirmEmail: { $exists: true } },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found or already confirmed.");
        if (!(await (0, hash_1.compareHash)(password, user.password)))
            throw new error_response_1.BadRequestException("Invalid email or password.");
        const credentials = await this._tokenService.getNewLoginCredentials(user);
        return res
            .status(201)
            .json({ message: "User logged in successfully.", data: { credentials } });
    };
    logoutWithRedis = async (req, res) => {
        const { flag } = req.body;
        let status = 200;
        switch (flag) {
            case auth_enum_1.LogoutTypeEnum.LOGOUT:
                await (0, redis_service_1.set)({
                    key: (0, redis_service_1.revokeTokenKey)({ userId: req.decoded.id, jti: req.decoded.jti }),
                    value: req.decoded.jti,
                    ttl: Number(config_service_1.ACCESS_EXPIRES), // 3600
                });
                status = 201;
                break;
            case auth_enum_1.LogoutTypeEnum.LOGOUT_FROM_ALL:
                await this._userRepo.updateOne({
                    filter: { _id: req.decoded.id },
                    update: {
                        changeCredentialTime: Date.now(),
                    },
                });
                status = 200;
                break;
        }
        return res.status(status).json({ message: "Logout successful." });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this._userRepo.findOne({
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
        await this._userRepo.updateOne({
            filter: { email },
            update: {
                confirmEmail: new Date(),
                $unset: {
                    confirmEmailOTP: true,
                },
            },
        });
        return res.status(200).json({ message: "User confirmed successfully." });
    };
    resetPassword = async (req, res) => {
        const { email } = req.body;
        const user = await this._userRepo.findOne({
            filter: { email },
            select: "username email",
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found.");
        const otp = (0, generateOTP_1.generateOTP)();
        await this._userRepo.updateOne({
            filter: { email },
            update: {
                resetPasswordOTP: await (0, hash_1.generateHash)(otp),
            },
        });
        await email_events_1.emailEvents.emit("resetPasswordOTP", {
            to: email,
            username: user.username,
            otp,
        });
        return res
            .status(200)
            .json({ message: "Reset password OTP sent successfully." });
    };
    resetPasswordConfirm = async (req, res) => {
        const { email, otp, newPassword } = req.body;
        const user = await this._userRepo.findOne({
            filter: {
                email,
                resetPasswordOTP: { $exists: true },
            },
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found or no reset request.");
        if (!(await (0, hash_1.compareHash)(otp, user?.resetPasswordOTP)))
            throw new error_response_1.NotFoundException("Invalid OTP.");
        await this._userRepo.updateOne({
            filter: { email },
            update: {
                password: await (0, hash_1.generateHash)(newPassword),
                $unset: {
                    resetPasswordOTP: true,
                },
            },
        });
        return res.status(200).json({ message: "Password reset successfully." });
    };
    resendOTP = async (req, res) => {
        const { email } = req.body;
        const user = await this._userRepo.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
            },
            select: "username email",
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found or already confirmed.");
        const otp = (0, generateOTP_1.generateOTP)();
        await this._userRepo.updateOne({
            filter: { email },
            update: {
                confirmEmailOTP: await (0, hash_1.generateHash)(otp),
            },
        });
        await email_events_1.emailEvents.emit("confirmEmail", {
            to: email,
            username: user.username,
            otp,
        });
        return res.status(200).json({ message: "OTP resent successfully." });
    };
    verifyAccount = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this._userRepo.findOne({
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
        await this._userRepo.updateOne({
            filter: { email },
            update: {
                confirmEmail: new Date(),
                $unset: {
                    confirmEmailOTP: true,
                },
            },
        });
        return res.status(200).json({ message: "Account verified successfully." });
    };
}
exports.default = new AuthenticationService();
