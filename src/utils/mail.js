import { text } from "express";
import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import ApiError from "./api-error.js";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "TaskManager",
      link: "https://taskmanagerlink.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    throw new ApiError(
      407,
      `Email service failed Make sure credentials are correct ${error}`,
    );
  }
};

const emailVerificationEmailContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app we are excited to onBorad you",
      action: {
        instruction: "To cerify the email please click on the button",
        button: {
          color: "#22bc66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro: "Need help or question ? Just reply over this email",
    },
  };
};
const ForgotPasswordEmailContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got the request to reset the password for your account",
      action: {
        instruction: "To reset the password click on the button",
        button: {
          color: "#22bc66",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro: "Need help or question ? Just reply over this email",
    },
  };
};

export { emailVerificationEmailContent, ForgotPasswordEmailContent, sendEmail };
