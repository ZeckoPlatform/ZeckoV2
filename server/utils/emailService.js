const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (to, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Verify Your Email',
    html: `
      <h1>Welcome to Zecko!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="http://localhost:3000/verify-email/${token}">Verify Email</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

const sendPasswordResetEmail = async (to, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
