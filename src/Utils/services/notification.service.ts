import firebaseApp from "./notification.config";
import { getMessaging } from "firebase-admin/messaging";

export class NotificationService {
  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {
    const message = {
      token,
      data,
    };
    return await getMessaging(firebaseApp).send(message);
  }

  async sendNotifications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: { title: string; body: string };
  }) {
    return await Promise.allSettled(
      tokens.map((token) => {
        return this.sendNotification({ token, data });
      }),
    );
  }
}

export const notification = new NotificationService();
