"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const auth_enum_1 = require("../Utils/enums/auth.enum");
const token_1 = require("../Utils/services/token");
const error_response_1 = require("../Utils/response/error.response");
const authentication = ({ tokenType = auth_enum_1.TokenTypeEnum.ACCESS }) => {
    return async (req, res, next) => {
        const tokenService = new token_1.TokenService();
        if (!req.headers.authorization)
            throw new error_response_1.BadRequestException("Authorization header is missing.");
        const { user, decoded } = (await tokenService.decodedToken({
            authorization: req.headers.authorization,
            tokenType,
        })) || {};
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authentication = authentication;
const authorization = ({ accessRoles = [], }) => {
    return async (req, res, next) => {
        if (!req.user.role || !accessRoles.includes(req.user.role)) {
            throw new error_response_1.ForbiddenException("Forbidden request.");
        }
        return next();
    };
};
exports.authorization = authorization;
