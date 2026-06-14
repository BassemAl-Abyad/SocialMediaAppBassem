"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_1 = __importDefault(require("../user.service"));
class UserResolver {
    getProfile = async (_, __, { user }) => {
        return await user_service_1.default.getProfile(user);
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
