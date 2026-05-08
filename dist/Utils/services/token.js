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
class TokenService {
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
}
exports.TokenService = TokenService;
