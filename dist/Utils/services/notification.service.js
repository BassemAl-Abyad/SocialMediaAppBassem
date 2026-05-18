"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notification = exports.NotificationService = void 0;
const notification_config_1 = __importDefault(require("./notification.config"));
class NotificationService {
    async sendNotification({ token, data, }) {
        const message = {
            token,
            data,
        };
        return await notification_config_1.default.messaging().send(message);
    }
    async sendNotifications({ tokens, data, }) {
        return await Promise.allSettled(tokens.map((token) => {
            return this.sendNotification({ token, data });
        }));
    }
}
exports.NotificationService = NotificationService;
exports.notification = new NotificationService();
