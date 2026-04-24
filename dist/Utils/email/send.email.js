"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const config_service_1 = require("../../config/config.service");
const generateHTML_1 = require("./generateHTML");
const sendEmail = async (data) => {
    const transporter = (0, nodemailer_1.createTransport)({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: config_service_1.USER_EMAIL,
            pass: config_service_1.USER_PASSWORD,
        },
    });
    // Generate HTML email content using the template
    if (!data.otp || !data.username) {
        throw new Error("OTP and username are required");
    }
    const firstName = data.username.split(" ")[0];
    const subject = data.subject ?? "Email Verification";
    const htmlContent = (0, generateHTML_1.template)(data.otp, firstName, subject);
    const info = await transporter.sendMail({
        ...data,
        from: `"Social Media App by Bassem" <${config_service_1.USER_EMAIL}>`,
        html: htmlContent,
    });
    console.log(info.messageId);
    return info;
};
exports.sendEmail = sendEmail;
