"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_enum_1 = require("../enums/auth.enum");
const config_service_1 = require("../../config/config.service");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const user_repo_1 = require("../../DB/repositories/user.repo");
const user_model_1 = require("../../DB/Models/user.model");
class TokenService {
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    sign = async (payload, secret, options) => {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    };
    verify = async (token, secret) => {
        return jsonwebtoken_1.default.verify(token, secret);
    };
    getSignature = ({ signatureLevel = auth_enum_1.SignatureEnum.USER }) => {
        let signature = {
            accessSignature: "",
            refereshSignature: "",
        };
        switch (signatureLevel) {
            case auth_enum_1.SignatureEnum.ADMIN:
                signature.accessSignature = config_service_1.TOKEN_ACCESS_ADMIN_SECRET_KEY;
                signature.refereshSignature = config_service_1.TOKEN_REFRESH_ADMIN_SECRET_KEY;
                break;
            case auth_enum_1.SignatureEnum.USER:
                signature.accessSignature = config_service_1.TOKEN_ACCESS_USER_SECRET_KEY;
                signature.refereshSignature = config_service_1.TOKEN_REFRESH_USER_SECRET_KEY;
                break;
            default:
                signature.accessSignature = config_service_1.TOKEN_ACCESS_USER_SECRET_KEY;
                signature.refereshSignature = config_service_1.TOKEN_REFRESH_USER_SECRET_KEY;
                break;
        }
        return signature;
    };
    getNewLoginCredentials = async (user) => {
        const signature = await this.getSignature({
            signatureLevel: user.role != auth_enum_1.RoleEnum.ADMIN ? auth_enum_1.SignatureEnum.USER : auth_enum_1.SignatureEnum.ADMIN,
        });
        const jwtid = (0, uuid_1.v4)();
        const accessToken = await this.sign({ id: user._id, jti: jwtid }, signature.accessSignature, { expiresIn: Number(config_service_1.ACCESS_EXPIRES) });
        const refreshToken = await this.sign({ id: user._id, jti: jwtid }, signature.refereshSignature, { expiresIn: Number(config_service_1.REFRESH_EXPIRES) });
        return { accessToken, refreshToken };
    };
    decodedToken = async ({ authorization, tokenType = auth_enum_1.TokenTypeEnum.ACCESS, }) => {
        if (!authorization)
            throw new error_response_1.BadRequestException("Authorization Header is missing");
        const [Bearer, token] = authorization.split(" ") || [];
        if (!Bearer || !token)
            throw new error_response_1.BadRequestException("Invalid Token Format");
        // signatature
        let signature = await this.getSignature({
            signatureLevel: Bearer === "Admin" ? auth_enum_1.SignatureEnum.ADMIN : auth_enum_1.SignatureEnum.USER,
        });
        const secret = tokenType === auth_enum_1.TokenTypeEnum.ACCESS
            ? signature.accessSignature
            : signature.refereshSignature;
        const decoded = await this.verify(token, secret);
        const user = await this._userRepo.findById({ id: decoded.id });
        if (!user)
            throw new error_response_1.NotFoundException("User not registered.");
        return { user, decoded };
    };
}
exports.TokenService = TokenService;
