import nodemailer from "nodemailer";
import config from "src/config/index.js";

export type ISendEmail = {
  to: string;
  subject: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});

const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `"FixMinCykel" <${config.email.from}>`,
      to: values.to,
      subject: values.subject,
      html: values.html,
    });

    console.log("Mail send successfully", info.accepted);
  } catch (error) {
    console.error("Email", error);
  }
};

export const emailHelper = {
  sendEmail,
};
