"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvents = void 0;
const node_events_1 = require("node:events");
const generateHTML_1 = require("../email/generateHTML");
const send_email_1 = require("../email/send.email");
exports.emailEvents = new node_events_1.EventEmitter();
exports.emailEvents.on("confirmEmail", async (data) => {
    try {
        data.subject = "Confirm Your Email";
        if (!data.otp || !data.username) {
            throw new Error("OTP and username are required");
        }
        const firstName = data.username.split(" ")[0];
        const subject = data.subject ?? "Confirm Your Email";
        data.html = (0, generateHTML_1.template)(data.otp, firstName, subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log(`Fail to send Email`, error);
    }
});
