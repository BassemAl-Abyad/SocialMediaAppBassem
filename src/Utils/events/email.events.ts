import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { template } from "../email/generateHTML";
import { sendEmail } from "../email/send.email";

export const emailEvents = new EventEmitter();

export interface IEmail extends Mail.Options {
  otp: string;
  username: string;
}

emailEvents.on("confirmEmail", async (data: IEmail) => {
  try {
    data.subject = "Confirm Your Email";
    if (!data.otp || !data.username) {
      throw new Error("OTP and username are required");
    }
    const firstName = data.username!.split(" ")[0] as string;
    const subject = data.subject ?? "Confirm Your Email";
    data.html = template(data.otp!, firstName, subject);
    await sendEmail(data);
  } catch (error) {
    console.log(`Fail to send Email`, error);
  }
});