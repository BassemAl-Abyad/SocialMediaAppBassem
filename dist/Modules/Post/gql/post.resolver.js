"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolver = exports.PostResolver = void 0;
const post_service_1 = __importDefault(require("../post.service"));
class PostResolver {
    getPosts = async (_, __, { user }) => {
        return await post_service_1.default.getPosts(user);
    };
}
exports.PostResolver = PostResolver;
exports.postResolver = new PostResolver();
