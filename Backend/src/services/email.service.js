const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
transport
  .verify()
  .then(() => logger.info('Connected to email server'))
  .catch(() => logger.error('Connect to email server failed'));

const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

const sendResetPasswordEmail = async (to, token, name) => {
  const subject = 'Reset Password';
  const resetPasswordUrl = `${config.base_url}/api/v1/auth/reset-password?token=${token}`;
  const html = `<p><b style="color:blue">Hello ${name}</b><br><i>To reset your password, click the following link: ${resetPasswordUrl}<br>If you did not request a password reset, please ignore this email.</i></p>`;
  await sendEmail(to, subject, html);
};

const sendVerificationEmail = async (to, token, name) => {
  const subject = 'Email authentication';
  const verificationEmailUrl = `${config.base_url}/api/v1/auth/verify-email?token=${token}`;
  const html = `<p><b style="color:blue">Hello ${name}</b><br><i>To verify your email, click this link: ${verificationEmailUrl}<br>If you have not created an account, please ignore this email.</i></p>`;
  await sendEmail(to, subject, html);
};

const sendMsgEmail = async (data) => {
  const subject = 'Title email';
  let html = 'Hello';
  await sendEmail(data.email, subject, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendMsgEmail,
};
