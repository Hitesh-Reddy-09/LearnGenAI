const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter (you'll need to configure this with your email service)
const createTransporter = () => {
  // For development, you can use a service like Mailtrap or Ethereal
  // For production, use services like SendGrid, AWS SES, or Gmail
  
  // Example for Gmail (you'll need to enable 2FA and use app password)
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Example for SendGrid
  // return nodemailer.createTransporter({
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: 'apikey',
  //     pass: process.env.SENDGRID_API_KEY
  //   }
  // });

  // Example for AWS SES
  // return nodemailer.createTransporter({
  //   host: process.env.SES_HOST,
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: process.env.SES_USER,
  //     pass: process.env.SES_PASSWORD
  //   }
  // });
};

// Send email function
const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
      html: html || message
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const subject = 'Password Reset Request - LearnGenAI';
  const message = `
    Hello,

    You are receiving this email because you (or someone else) has requested the reset of your password.

    Please click on the following link to reset your password:
    ${resetUrl}

    If you did not request this, please ignore this email and your password will remain unchanged.

    This link will expire in 10 minutes.

    Best regards,
    The LearnGenAI Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You are receiving this email because you (or someone else) has requested the reset of your password.</p>
      <p>Please click on the following button to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p><strong>This link will expire in 10 minutes.</strong></p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">Best regards,<br>The LearnGenAI Team</p>
    </div>
  `;

  return sendEmail({ email, subject, message, html });
};

// Send email verification email
const sendEmailVerification = async (email, verificationToken, verificationUrl) => {
  const subject = 'Verify Your Email - LearnGenAI';
  const message = `
    Hello,

    Thank you for registering with LearnGenAI! Please verify your email address by clicking on the following link:

    ${verificationUrl}

    If you did not create an account, please ignore this email.

    This link will expire in 24 hours.

    Best regards,
    The LearnGenAI Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to LearnGenAI!</h2>
      <p>Hello,</p>
      <p>Thank you for registering with LearnGenAI! Please verify your email address by clicking on the following button:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>If you did not create an account, please ignore this email.</p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">Best regards,<br>The LearnGenAI Team</p>
    </div>
  `;

  return sendEmail({ email, subject, message, html });
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to LearnGenAI!';
  const message = `
    Hello ${name},

    Welcome to LearnGenAI! We're excited to have you on board.

    Here are some things you can do to get started:
    - Explore our course catalog
    - Complete your profile
    - Set your learning preferences
    - Join our community

    If you have any questions, feel free to reach out to our support team.

    Happy learning!

    Best regards,
    The LearnGenAI Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to LearnGenAI!</h2>
      <p>Hello ${name},</p>
      <p>Welcome to LearnGenAI! We're excited to have you on board.</p>
      <p>Here are some things you can do to get started:</p>
      <ul>
        <li>Explore our course catalog</li>
        <li>Complete your profile</li>
        <li>Set your learning preferences</li>
        <li>Join our community</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p><strong>Happy learning!</strong></p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">Best regards,<br>The LearnGenAI Team</p>
    </div>
  `;

  return sendEmail({ email, subject, message, html });
};

// Send course completion email
const sendCourseCompletionEmail = async (email, name, courseName, certificateUrl) => {
  const subject = `Congratulations! You've completed ${courseName}`;
  const message = `
    Hello ${name},

    Congratulations! You've successfully completed the course "${courseName}".

    You can download your certificate from the following link:
    ${certificateUrl}

    Keep up the great work and continue your learning journey!

    Best regards,
    The LearnGenAI Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🎉 Congratulations!</h2>
      <p>Hello ${name},</p>
      <p>Congratulations! You've successfully completed the course <strong>"${courseName}"</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${certificateUrl}" style="background-color: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Certificate</a>
      </div>
      <p>Keep up the great work and continue your learning journey!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">Best regards,<br>The LearnGenAI Team</p>
    </div>
  `;

  return sendEmail({ email, subject, message, html });
};

// Send streak reminder email
const sendStreakReminderEmail = async (email, name, streak) => {
  const subject = `Don't break your ${streak}-day learning streak!`;
  const message = `
    Hello ${name},

    You're on a ${streak}-day learning streak! Don't break it now.

    Log in today and continue your learning journey. Every day counts towards your goals.

    Keep up the amazing work!

    Best regards,
    The LearnGenAI Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🔥 ${streak}-Day Learning Streak!</h2>
      <p>Hello ${name},</p>
      <p>You're on a <strong>${streak}-day learning streak</strong>! Don't break it now.</p>
      <p>Log in today and continue your learning journey. Every day counts towards your goals.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Continue Learning</a>
      </div>
      <p>Keep up the amazing work!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px;">Best regards,<br>The LearnGenAI Team</p>
    </div>
  `;

  return sendEmail({ email, subject, message, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendWelcomeEmail,
  sendCourseCompletionEmail,
  sendStreakReminderEmail
}; 