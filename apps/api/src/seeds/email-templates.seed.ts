import { Collection } from 'mongodb';
import { EmailTemplateType } from '../email/schema/email-template.schema';

export const seedEmailTemplates = async (
  emailTemplateCollection: Collection,
) => {
  // Delete all existing templates
  await emailTemplateCollection.deleteMany({});

  // Welcome email template
  const welcomeTemplate = {
    name: 'Welcome Email',
    type: EmailTemplateType.WELCOME,
    subject: 'Welcome to BroGlow',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to {{appName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin-bottom: 30px; }
          .button { display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; }
          .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to {{appName}}!</h1>
          </div>
          <div class="content">
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>Thank you for joining {{appName}}. We're excited to have you as a new member!</p>
            <p>Your account has been successfully created with the email address: <strong>{{email}}</strong></p>
            <p>You can now sign in to your account and start using our platform.</p>
            <p style="text-align: center;">
              <a href="{{loginUrl}}" class="button">Sign In to Your Account</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; {{appName}}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Welcome to {{appName}}!

      Hello {{firstName}} {{lastName}},

      Thank you for joining {{appName}}. We're excited to have you as a new member!

      Your account has been successfully created with the email address: {{email}}

      You can now sign in to your account and start using our platform.

      Sign in here: {{loginUrl}}

      © {{appName}}. All rights reserved.
    `,
    description: 'Email sent to users after successful registration',
  };

  // Email verification template
  const verifyEmailTemplate = {
    name: 'Email Verification',
    type: EmailTemplateType.VERIFY_EMAIL,
    subject: 'Verify Your Email - BroGlow',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin-bottom: 30px; }
          .verification-link { display: inline-block; background-color: #4285F4; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; }
          .verification-code { font-size: 24px; text-align: center; font-weight: bold; letter-spacing: 6px; margin: 20px 0; color: #4285F4; }
          .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>Thank you for creating an account with {{appName}}. To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="{{verificationLink}}" class="verification-link">Verify Email Address</a>
            </p>
            <p>Or use this verification code:</p>
            <div class="verification-code">{{verificationCode}}</div>
            <p>This verification code will expire in {{expirationMinutes}} minutes.</p>
            <p>If you did not create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; {{appName}}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Verify Your Email Address

      Hello {{firstName}} {{lastName}},

      Thank you for creating an account with {{appName}}. To complete your registration, please verify your email address by visiting the link below:

      {{verificationLink}}

      Or use this verification code: {{verificationCode}}

      This verification code will expire in {{expirationMinutes}} minutes.

      If you did not create an account with us, please ignore this email.

      © {{appName}}. All rights reserved.
    `,
    description: 'Email sent for email verification after registration',
  };

  // Forgot password template
  const forgotPasswordTemplate = {
    name: 'Forgot Password',
    type: EmailTemplateType.FORGOT_PASSWORD,
    subject: 'Password Reset Code - BroGlow',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin-bottom: 30px; }
          .reset-code { font-size: 28px; text-align: center; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #E53935; }
          .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Code</h1>
          </div>
          <div class="content">
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>We received a request to reset your password for your {{appName}} account. Use the code below to reset your password:</p>
            <div class="reset-code">{{otp}}</div>
            <p>This code will expire in {{expirationMinutes}} minutes.</p>
            <p>If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.</p>
          </div>
          <div class="footer">
            <p>&copy; {{appName}}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Password Reset Code

      Hello {{firstName}} {{lastName}},

      We received a request to reset your password for your {{appName}} account. Use the code below to reset your password:

      {{otp}}

      This code will expire in {{expirationMinutes}} minutes.

      If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.

      © {{appName}}. All rights reserved.
    `,
    description: 'Email sent when user requests a password reset',
  };

  // Password change notification template
  const passwordChangeTemplate = {
    name: 'Password Changed',
    type: EmailTemplateType.CHANGE_PASSWORD,
    subject: 'Password Changed Successfully - BroGlow',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Changed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin-bottom: 30px; }
          .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          <div class="content">
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>Your password for {{appName}} has been changed successfully.</p>
            <p>If you did not make this change, please contact our support team immediately at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
          </div>
          <div class="footer">
            <p>&copy; {{appName}}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Password Changed Successfully

      Hello {{firstName}} {{lastName}},

      Your password for {{appName}} has been changed successfully.

      If you did not make this change, please contact our support team immediately at {{supportEmail}}.

      © {{appName}}. All rights reserved.
    `,
    description: 'Email sent to confirm password has been changed',
  };

  // Insert all templates
  await emailTemplateCollection.insertMany([
    welcomeTemplate,
    verifyEmailTemplate,
    forgotPasswordTemplate,
    passwordChangeTemplate,
  ]);

  console.log('Email templates seeded successfully');
};
