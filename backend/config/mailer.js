const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_PORT) === '465',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendPasswordResetEmail = async ({ to, resetUrl, name }) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'ReWear password reset',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a2e;">
        <h2 style="color: #1B5E20;">Reset your ReWear password</h2>
        <p>Hi ${name || 'there'},</p>
        <p>We received a request to reset your password. Use the link below to continue:</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#1B5E20;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;">Reset Password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return true;
};

module.exports = { sendPasswordResetEmail };