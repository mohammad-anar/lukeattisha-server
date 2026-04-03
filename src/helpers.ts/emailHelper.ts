import { config } from "config/index.js";
import nodemailer from "nodemailer";

export type ISendEmail = {
  to: string;
  subject: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false, // For port 587, set fixed TLS rejection in dev
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
