import { createTransport } from "nodemailer";
import { USER_EMAIL, USER_PASSWORD } from "../../config/config.service";
import { IEmail } from "../events/email.events";
import { template } from "./generateHTML";

export const sendEmail = async (data: IEmail): Promise<any> => {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: USER_EMAIL as string,
      pass: USER_PASSWORD as string,
    },
  });

  // Generate HTML email content using the template
  if (!data.otp || !data.username) {
    throw new Error("OTP and username are required");
  }
  const firstName = data.username!.split(" ")[0] as string;
  const subject = data.subject ?? "Email Verification";
  const htmlContent = template(data.otp!, firstName, subject);

  const info = await transporter.sendMail({
    ...data,
    from: `"Social Media App by Bassem" <${USER_EMAIL as string}>`,
    html: htmlContent,
  });

  console.log(info.messageId);
  return info;
};