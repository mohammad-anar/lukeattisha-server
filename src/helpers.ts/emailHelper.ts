import { config } from "../config/index.js";
import nodemailer from "nodemailer";
import { prisma } from "./prisma.js";

export type ISendEmail = {
  to: string;
  subject: string;
  html: string;
};

console.log("Email Config Diagnostics:");
console.log("- Host:", config.email.host);
console.log("- Port:", config.email.port);
console.log("- User:", config.email.user);
console.log("- Pass length:", config.email.pass?.length);
console.log("- Node Env:", config.node_env);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: config.node_env === "development" ? false : true,
  },
  logger: true,
  debug: true,
});

const sendEmail = async (values: ISendEmail) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: values.to },
      include: { notificationPref: true }
    });
    
    // Auth and transactional emails must always send
    const isTransactional = /verify|reset|password|otp/i.test(values.subject);
    
    if (!isTransactional && user?.notificationPref && user.notificationPref.email === false) {
      console.log(`Email Service: Blocked sending to [${values.to}] due to user preference`);
      return null;
    }

    console.log(`Email Service: Attempting to send [${values.subject}] to [${values.to}]`);
    const info = await transporter.sendMail({
      from: `"Laundry Link" <${config.email.from}>`,
      to: values.to,
      subject: values.subject,
      html: values.html,
    });
    console.log(`Email Service: Success! ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email Service Error Details:", error);
    // throw error; // Optional: throw to propagate to service layer
  }
};

export const emailHelper = {
  sendEmail,
};
