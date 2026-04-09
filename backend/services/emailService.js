import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendCertificateEmail = async ({ email, name, certificateText }) => {
  if (!email) {
    throw new Error('Recipient email is required');
  }

  if (!certificateText?.trim()) {
    throw new Error('Certificate content is required');
  }

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS is not configured');
  }

  const safeName = name?.trim() || 'Volunteer';
  const cleanBody = certificateText.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <p>Dear ${safeName},</p>
      <p>Thank you for your valuable contribution to our community service efforts.</p>
      <p>${cleanBody.replace(/\n/g, '<br/>')}</p>
      <p>With gratitude,<br/>Community Service NGO Team</p>
    </div>
  `.trim();

  const text = `Dear ${safeName},

Thank you for your valuable contribution to our community service efforts.

${cleanBody}

With gratitude,
Community Service NGO Team`;

  return transporter.sendMail({
    from: `"Community Service NGO" <${EMAIL_USER}>`,
    to: email,
    subject: 'Your Certificate of Participation',
    text,
    html,
  });
};
