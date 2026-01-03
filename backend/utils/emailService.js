import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // ensures env vars are loaded

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set in .env");
}

// Nodemailer transporter
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail SMTP
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Send verification email
export const sendVerificationEmail = async (toEmail, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Community Service" <${EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email",
    html: `
      <p>Hi,</p>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
