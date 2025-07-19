import { Collection } from 'mongodb';
import { EmailTemplateType } from '../email/schema/email-template.schema';

export const seedEmailTemplates = async (
  emailTemplateCollection: Collection,
) => {
  // Delete all existing templates
  await emailTemplateCollection.deleteMany({});

  // Modern email template styles
  const modernEmailStyles = `
    .bg-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      color: #333;
      line-height: 1.6;
      background: #f1f0f0;
      padding: 24px;
      margin: 0;
    }
    .container {
      display: table;
      margin: 0 auto;
      width: 100%;
    }
    .content {
      display: table;
      max-width: 640px;
      margin: 0 auto;
      width: 100%;
    }
    .content-body {
      display: block;
      background-color: #fff;
      border-radius: 20px;
      padding: 42px;
    }
    .content-body p {
      color: #4d4948;
      margin-top: 16px;
      margin-bottom: 0px;
      padding: 0px;
      font-family: inherit;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
      letter-spacing: -0.096px;
    }
    .content-help {
      display: block;
      margin-top: 24px;
      padding: 42px;
      background-color: #02AAEB;
      border-radius: 20px;
      color: #fff;
    }
    .content-help p {
      font-family: inherit;
      font-size: 16px;
      line-height: 150%;
    }
    .support-button {
      border-radius: 999px;
      background: #fff;
      color: #1584F2;
      cursor: pointer;
      display: inline-block;
      padding: 16px 24px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      line-height: 100%;
      letter-spacing: -0.16px;
      text-decoration: none;
      font-family: inherit;
    }
    .cta-button {
      border-radius: 999px;
      background: linear-gradient(to right, #02AAEB, #1584F2);
      color: white !important;
      cursor: pointer;
      display: inline-block;
      padding: 16px 24px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      line-height: 100%;
      letter-spacing: -0.16px;
      text-decoration: none;
      font-family: inherit;
    }
    .verification-code {
      font-size: 28px;
      text-align: center;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 25px 0;
      color: #02AAEB;
      background-color: #f0f8ff;
      padding: 15px;
      border-radius: 8px;
    }
    h1 {
      color: #1584F2;
      font-size: 24px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 24px;
      text-align: center;
      font-family: inherit;
    }
    h2 {
      color: #1584F2;
      font-size: 20px;
      font-weight: 600;
      margin-top: 32px;
      margin-bottom: 16px;
      font-family: inherit;
    }
    .broglow-logo {
      margin-bottom: 32px;
      width: 100%;
      text-align: center;
    }
    .broglow-logo img {
      padding-right: 20px;
      max-width: 100%;
      height: auto;
    }
    .footer-text {
      font-size: 12px;
      text-align: left;
      color: #888;
      margin-top: 24px;
      font-family: inherit;
    }
    .footer-text a {
      color: #1584F2;
      text-decoration: none;
    }
    .help-container {
      display: table;
      width: 100%;
    }
    .help-title {
      display: table-cell;
      width: 50%;
      vertical-align: middle;
    }
    .help-button {
      display: table-cell;
      width: 50%;
      text-align: right;
      vertical-align: middle;
    }
    .alert-icon {
      font-size: 48px;
      color: #02AAEB;
      text-align: center;
      margin: 20px 0;
    }

    /* Responsive styles */
    @media only screen and (max-width: 640px) {
      .bg-container {
        padding: 12px;
      }
      .content-body {
        padding: 24px;
        border-radius: 12px;
      }
      .content-help {
        padding: 24px;
        border-radius: 12px;
      }
      h1 {
        font-size: 22px;
      }
      h2 {
        font-size: 18px;
      }
      .help-container {
        display: block;
      }
      .help-title, .help-button {
        display: block;
        width: 100%;
        text-align: center;
      }
      .help-button {
        margin-top: 16px;
      }
      .support-button {
        padding: 12px 20px;
        font-size: 14px;
      }
      .cta-button {
        padding: 12px 20px;
        font-size: 14px;
      }
    }
  `;

  // Welcome email template
  const welcomeTemplate = {
    name: 'Welcome Email',
    type: EmailTemplateType.WELCOME,
    subject: 'Welcome to BroGlow - Your Skincare Journey Begins Now!',
    htmlContent: `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to BroGlow</title>
          <style>
            ${modernEmailStyles}
          </style>
        </head>
        <body>
        <div class="bg-container">
          <div class="container">
            <div class="content">
              <div class="content-body">
                <div style="margin-bottom: 32px" class="broglow-logo">
                  <img src="https://storage.googleapis.com/hitech-platform.appspot.com/sws/broglow-logo_638884992209688353.png" alt="BroGlow" width="150" />
                </div>
                <h1>Welcome to BroGlow!</h1>
                <div>
                  <p>
                    <strong>Hello {{firstName}} {{lastName}},</strong>
                  </p>
                  <p>Welcome to BroGlow - the revolutionary AI-powered skincare platform designed specifically for men who want real results!</p>
                  <p>Your account has been successfully created with the email address: <strong>{{email}}</strong></p>
                  <p>You're now ready to:</p>
                  <ul style="margin: 16px 0; padding-left: 20px;">
                    <li>Get AI-powered skin analysis in seconds</li>
                    <li>Receive personalized skincare recommendations</li>
                    <li>Track your skin improvement journey</li>
                    <li>Access expert tips and guidance</li>
                  </ul>
                  <p style="text-align: center; margin-top: 24px;">
                    <a href="{{loginUrl}}" class="cta-button">Start Your Skincare Journey</a>
                  </p>
                  <p>Ready to level up your skin game? Let's get started!</p>
                  <p class="footer-text">
                    Made with 🫶 by
                    <a href="https://broglow.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Need Help?</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://broglow.vercel.app/support" class="support-button">Get Support</a>
                  </div>
                </div>
                <div style="margin-top: 32px">
                  <p style="color: #fff; margin-top: 0">
                    BroGlow - AI-powered skincare that actually works for men. Get personalized routines, track progress, and achieve your best skin.
                  </p>
                  <p style="color: #fff; margin-top: 8px">
                    Please do not reply to this email. This is an automated message from a no-reply address. For support, please click the Support button above or email us at support@broglow.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </html>
    `,
    textContent: `
      Welcome to BroGlow!

      Hello {{firstName}} {{lastName}},

      Welcome to BroGlow - the revolutionary AI-powered skincare platform designed specifically for men who want real results!

      Your account has been successfully created with the email address: {{email}}

      You're now ready to:
      • Get AI-powered skin analysis in seconds
      • Receive personalized skincare recommendations
      • Track your skin improvement journey
      • Access expert tips and guidance

      Start Your Skincare Journey: {{loginUrl}}

      Ready to level up your skin game? Let's get started!

      © {{currentYear}} BroGlow. All rights reserved.

      Need help? Visit https://broglow.vercel.app/support or contact support@broglow.com
    `,
    description: 'Email sent to users after successful registration',
  };

  // Email verification template
  const verifyEmailTemplate = {
    name: 'Email Verification',
    type: EmailTemplateType.VERIFY_EMAIL,
    subject: 'Verify Your Email - Complete Your BroGlow Registration',
    htmlContent: `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Your Email Address</title>
          <style>
            ${modernEmailStyles}
          </style>
        </head>
        <body>
        <div class="bg-container">
          <div class="container">
            <div class="content">
              <div class="content-body">
                <div style="margin-bottom: 32px" class="broglow-logo">
                  <img src="https://storage.googleapis.com/hitech-platform.appspot.com/sws/broglow-logo_638884992209688353.png" alt="BroGlow" width="150" />
                </div>
                <h1>Verify Your Email Address</h1>
                <div>
                  <p>
                    <strong>Hello {{firstName}} {{lastName}},</strong>
                  </p>
                  <p>Thank you for creating an account with BroGlow! To complete your registration and start your personalized skincare journey, please verify your email address.</p>
                  <p style="text-align: center; margin-top: 24px;">
                    <a href="{{verificationLink}}" class="cta-button">Verify Email Address</a>
                  </p>
                  <p>Or use this verification code:</p>
                  <div class="verification-code">{{verificationCode}}</div>
                  <p><strong>This verification code will expire in {{expirationMinutes}} minutes.</strong></p>
                  <p>Once verified, you'll have access to:</p>
                  <ul style="margin: 16px 0; padding-left: 20px;">
                    <li>AI-powered skin analysis</li>
                    <li>Personalized skincare recommendations</li>
                    <li>Progress tracking and insights</li>
                    <li>Expert tips and guidance</li>
                  </ul>
                  <p>If you did not create an account with us, please ignore this email.</p>
                  <p class="footer-text">
                    Made with 🫶 by
                    <a href="https://broglow.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Need Help?</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://broglow.vercel.app/support" class="support-button">Get Support</a>
                  </div>
                </div>
                <div style="margin-top: 32px">
                  <p style="color: #fff; margin-top: 0">
                    BroGlow - Revolutionary AI-powered skincare designed specifically for men who want real results.
                  </p>
                  <p style="color: #fff; margin-top: 8px">
                    Please do not reply to this email. This is an automated message from a no-reply address. For support, please click the Support button above or email us at support@broglow.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </html>
    `,
    textContent: `
      Verify Your Email Address

      Hello {{firstName}} {{lastName}},

      Thank you for creating an account with BroGlow! To complete your registration and start your personalized skincare journey, please verify your email address by visiting the link below:

      {{verificationLink}}

      Or use this verification code: {{verificationCode}}

      This verification code will expire in {{expirationMinutes}} minutes.

      Once verified, you'll have access to:
      • AI-powered skin analysis
      • Personalized skincare recommendations
      • Progress tracking and insights
      • Expert tips and guidance

      If you did not create an account with us, please ignore this email.

      © {{currentYear}} BroGlow. All rights reserved.

      Need help? Visit https://broglow.vercel.app/support or contact support@broglow.com
    `,
    description: 'Email sent for email verification after registration',
  };

  // Forgot password template
  const forgotPasswordTemplate = {
    name: 'Forgot Password',
    type: EmailTemplateType.FORGOT_PASSWORD,
    subject: 'Reset Your BroGlow Password - Secure Access Code',
    htmlContent: `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset Code</title>
          <style>
            ${modernEmailStyles}
          </style>
        </head>
        <body>
        <div class="bg-container">
          <div class="container">
            <div class="content">
              <div class="content-body">
                <div style="margin-bottom: 32px" class="broglow-logo">
                  <img src="https://storage.googleapis.com/hitech-platform.appspot.com/sws/broglow-logo_638884992209688353.png" alt="BroGlow" width="150" />
                </div>
                <h1>Password Reset Request</h1>
                <div>
                  <p>
                    <strong>Hello {{firstName}} {{lastName}},</strong>
                  </p>
                  <p>We received a request to reset your password for your BroGlow account. Use the secure code below to reset your password:</p>
                  <div class="verification-code">{{otp}}</div>
                  <p><strong>This code will expire in {{expirationMinutes}} minutes.</strong></p>
                  <p>For your security:</p>
                  <ul style="margin: 16px 0; padding-left: 20px;">
                    <li>This code can only be used once</li>
                    <li>Never share this code with anyone</li>
                    <li>BroGlow will never ask for this code via phone or email</li>
                  </ul>
                  <p>If you did not request a password reset, please ignore this email or contact our support team if you have any concerns about your account security.</p>
                  <p class="footer-text">
                    Made with 🫶 by
                    <a href="https://broglow.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Security Concerns?</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://broglow.vercel.app/support" class="support-button">Contact Support</a>
                  </div>
                </div>
                <div style="margin-top: 32px">
                  <p style="color: #fff; margin-top: 0">
                    Your account security is our priority. If you didn't request this reset, please contact our support team immediately.
                  </p>
                  <p style="color: #fff; margin-top: 8px">
                    Please do not reply to this email. This is an automated message from a no-reply address. For support, please click the Support button above or email us at support@broglow.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </html>
    `,
    textContent: `
      Password Reset Request

      Hello {{firstName}} {{lastName}},

      We received a request to reset your password for your BroGlow account. Use the secure code below to reset your password:

      {{otp}}

      This code will expire in {{expirationMinutes}} minutes.

      For your security:
      • This code can only be used once
      • Never share this code with anyone
      • BroGlow will never ask for this code via phone or email

      If you did not request a password reset, please ignore this email or contact our support team if you have any concerns about your account security.

      © {{currentYear}} BroGlow. All rights reserved.

      Security concerns? Visit https://broglow.vercel.app/support or contact support@broglow.com
    `,
    description: 'Email sent when user requests a password reset',
  };

  // Password change notification template
  const passwordChangeTemplate = {
    name: 'Password Changed',
    type: EmailTemplateType.CHANGE_PASSWORD,
    subject: 'BroGlow Password Changed Successfully - Security Notification',
    htmlContent: `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Changed Successfully</title>
          <style>
            ${modernEmailStyles}
          </style>
        </head>
        <body>
        <div class="bg-container">
          <div class="container">
            <div class="content">
              <div class="content-body">
                <div style="margin-bottom: 32px" class="broglow-logo">
                  <img src="https://storage.googleapis.com/hitech-platform.appspot.com/sws/broglow-logo_638884992209688353.png" alt="BroGlow" width="150" />
                </div>
                <h1>Password Changed Successfully</h1>
                <div>
                  <div class="alert-icon">✓</div>
                  <p>
                    <strong>Hello {{firstName}} {{lastName}},</strong>
                  </p>
                  <p>Your password for BroGlow has been changed successfully. This is a security notification to confirm the change.</p>
                  <p><strong>Account Details:</strong></p>
                  <ul style="margin: 16px 0; padding-left: 20px;">
                    <li>Email: {{email}}</li>
                    <li>Changed on: {{changeDate}}</li>
                    <li>Device: {{deviceInfo}}</li>
                  </ul>
                  <p>If you made this change, no further action is required. Your account remains secure.</p>
                  <p><strong>If you did NOT make this change:</strong></p>
                  <ul style="margin: 16px 0; padding-left: 20px;">
                    <li>Contact our support team immediately</li>
                    <li>Review your account activity</li>
                    <li>Consider enabling two-factor authentication</li>
                  </ul>
                  <p style="text-align: center; margin-top: 24px;">
                    <a href="mailto:{{supportEmail}}" class="cta-button">Contact Support Immediately</a>
                  </p>
                  <p class="footer-text">
                    Made with 🫶 by
                    <a href="https://broglow.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Account Security</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://broglow.vercel.app/support" class="support-button">Security Help</a>
                  </div>
                </div>
                <div style="margin-top: 32px">
                  <p style="color: #fff; margin-top: 0">
                    Your account security is our top priority. If you have any concerns about this password change, please contact us immediately.
                  </p>
                  <p style="color: #fff; margin-top: 8px">
                    Please do not reply to this email. This is an automated message from a no-reply address. For support, please click the Security Help button above or email us at support@broglow.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </html>
    `,
    textContent: `
      Password Changed Successfully

      Hello {{firstName}} {{lastName}},

      Your password for BroGlow has been changed successfully. This is a security notification to confirm the change.

      Account Details:
      • Email: {{email}}
      • Changed on: {{changeDate}}
      • Device: {{deviceInfo}}

      If you made this change, no further action is required. Your account remains secure.

      If you did NOT make this change:
      • Contact our support team immediately
      • Review your account activity
      • Consider enabling two-factor authentication

      Contact Support Immediately: {{supportEmail}}

      © {{currentYear}} BroGlow. All rights reserved.

      Account Security Help: https://broglow.vercel.app/support or contact support@broglow.com
    `,
    description: 'Email sent to confirm password has been changed',
  };

  // App Launch Notification template (UNCHANGED)
  const appLaunchTemplate = {
    name: 'App Launch Notification',
    type: EmailTemplateType.APP_LAUNCH,
    subject:
      '🎉 Chỉ 10 ngày nữa: App BroGlow chính thức ra mắt – Sẵn sàng để bùng nổ trải nghiệm làm đẹp?',
    htmlContent: `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>THÔNG BÁO LAUNCHING</title>
          <style>
            .bg-container {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              color: #333;
              line-height: 1.6;
              background: #f1f0f0;
              padding: 24px;
              margin: 0;
            }
            .container {
              display: table;
              margin: 0 auto;
              width: 100%;
            }
            .content {
              display: table;
              max-width: 640px;
              margin: 0 auto;
              width: 100%;
            }
            .content-body {
              display: block;
              background-color: #fff;
              border-radius: 20px;
              padding: 42px;
            }
            .content-body p {
              color: #4d4948;
              margin-top: 16px;
              margin-bottom: 0px;
              padding: 0px;
              font-family: inherit;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 150%;
              letter-spacing: -0.096px;
            }
            .content-help {
              display: block;
              margin-top: 24px;
              padding: 42px;
              background-color: #02AAEB;
              border-radius: 20px;
              color: #fff;
            }
            .content-help p {
              font-family: inherit;
              font-size: 16px;
              line-height: 150%;
            }
            .support-button {
              border-radius: 999px;
              background: #fff;
              color: #1584F2;
              cursor: pointer;
              display: inline-block;
              padding: 16px 24px;
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              line-height: 100%;
              letter-spacing: -0.16px;
              text-decoration: none;
              font-family: inherit;
            }
            .feature-list {
              margin-top: 24px;
            }
            .feature-item {
              margin-bottom: 16px;
              display: flex;
              align-items: flex-start;
              font-family: inherit;
              font-size: 16px;
            }
            .feature-icon {
              color: #1584F2;
              margin-right: 10px;
              font-weight: bold;
            }
            .countdown {
              display: block;
              margin-top: 24px;
              padding: 16px;
              background-color: #f0f8ff;
              border-radius: 8px;
              color: #1584F2;
              font-weight: 600;
              text-align: center;
              font-family: inherit;
              font-size: 16px;
            }
            .cta-button {
              border-radius: 999px;
              background: linear-gradient(to right, #02AAEB, #1584F2);
              color: white !important;
              cursor: pointer;
              display: inline-block;
              padding: 16px 24px;
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              line-height: 100%;
              letter-spacing: -0.16px;
              text-decoration: none;
              font-family: inherit;
            }
            h1 {
              color: #1584F2;
              font-size: 24px;
              font-weight: 700;
              margin-top: 0;
              margin-bottom: 24px;
              text-align: center;
              font-family: inherit;
            }
            h2 {
              color: #1584F2;
              font-size: 20px;
              font-weight: 600;
              margin-top: 32px;
              margin-bottom: 16px;
              font-family: inherit;
            }
            .broglow-logo {
              margin-bottom: 32px;
              width: 100%;
              text-align: center;
            }
            .broglow-logo img {
              padding-right: 20px;
              max-width: 100%;
              height: auto;
            }
            .footer-text {
              font-size: 12px;
              text-align: left;
              color: #888;
              margin-top: 24px;
              font-family: inherit;
            }
            .footer-text a {
              color: #1584F2;
              text-decoration: none;
            }
            .help-container {
              display: table;
              width: 100%;
            }
            .help-title {
              display: table-cell;
              width: 50%;
              vertical-align: middle;
            }
            .help-button {
              display: table-cell;
              width: 50%;
              text-align: right;
              vertical-align: middle;
            }

            /* Responsive styles */
            @media only screen and (max-width: 640px) {
              .bg-container {
                padding: 12px;
              }
              .content-body {
                padding: 24px;
                border-radius: 12px;
              }
              .content-help {
                padding: 24px;
                border-radius: 12px;
              }
              h1 {
                font-size: 22px;
              }
              h2 {
                font-size: 18px;
              }
              .help-container {
                display: block;
              }
              .help-title, .help-button {
                display: block;
                width: 100%;
                text-align: center;
              }
              .help-button {
                margin-top: 16px;
              }
              .support-button {
                padding: 12px 20px;
                font-size: 14px;
              }
              .cta-button {
                padding: 12px 20px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
        <div class="bg-container">
          <div class="container">
            <div class="content">
              <div class="content-body">
                <div style="margin-bottom: 32px" class="broglow-logo">
                  <img src="https://storage.googleapis.com/hitech-platform.appspot.com/sws/broglow-logo_638884992209688353.png" alt="BroGlow" width="150" />
                </div>
                <h1>THÔNG BÁO LAUNCHING</h1>
                <div>
                  <p>
                    <strong>Gửi {{fullName}},</strong>
                  </p>
                  <p>Bạn đã sẵn sàng để nâng tầm trải nghiệm làm đẹp chưa?</p>
                  <p>
                    Chúng tôi rất vui mừng thông báo rằng <strong>ứng dụng chính thức của BroGlow sẽ chính thức được ra mắt trong vòng 10 ngày tới!</strong> Và vì bạn đã từng đăng ký trên website của chúng tôi, bạn sẽ là một trong những người đầu tiên được trải nghiệm app – hoàn toàn miễn phí và với rất nhiều ưu đãi đặc biệt.
                  </p>

                  <h2>✨ Vì sao bạn nên tải ngay App BroGlow?</h2>

                  <div class="feature-list">
                    <div class="feature-item">
                      <div class="feature-icon">•</div>
                      <div>Cá nhân hóa trải nghiệm làm đẹp với AI Beauty Matching</div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">•</div>
                      <div>Nhận ưu đãi đặc biệt chỉ dành riêng cho người dùng app</div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">•</div>
                      <div>Theo dõi lịch trình chăm da, nhắc hẹn và cập nhật xu hướng mới nhất dễ dàng</div>
                    </div>
                  </div>

                  <div class="countdown">
                    ⏳ Chỉ còn 10 ngày nữa, app sẽ có mặt trên App Store!
                  </div>

                  <p>👉 Hãy là người đầu tiên nhận thông báo cài đặt và nhận phần quà độc quyền.</p>

                  <p style="text-align: center; margin-top: 24px;">
                    <a href="https://broglow.vercel.app/register" class="cta-button">Đăng ký để nhận link tải ngay khi ra mắt</a>
                  </p>

                  <p>Cảm ơn bạn đã đồng hành cùng BroGlow ngay từ những ngày đầu.</p>
                  <p>Chúng tôi tin rằng bạn sẽ yêu thích trải nghiệm hoàn toàn mới trên app của BroGlow – nhanh hơn, đẹp hơn, và cá nhân hóa hơn bao giờ hết.</p>
                  <p>Hẹn gặp bạn trên ứng dụng!</p>
                  <p>
                    Thân ái,<br />
                    Đội ngũ BroGlow
                  </p>
                  <p class="footer-text">
                    Made with 🫶 by
                    <a href="https://broglow.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Cần hỗ trợ?</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://broglow.vercel.app/support" class="support-button">Hỗ trợ</a>
                  </div>
                </div>
                <div style="margin-top: 32px">
                  <p style="color: #fff; margin-top: 0">
                    Trải nghiệm làm đẹp được cá nhân hóa với BroGlow AI, ưu đãi độc quyền và nhiều tính năng hấp dẫn khác đang chờ bạn khám phá.
                  </p>
                  <p style="color: #fff; margin-top: 8px">
                    Vui lòng không trả lời email này. Đây là tin nhắn tự động từ địa chỉ không nhận phản hồi. Để được hỗ trợ, vui lòng nhấp vào nút Hỗ trợ ở trên hoặc gửi email cho chúng tôi tại support@broglow.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </html>
    `,
    textContent: `
      THÔNG BÁO LAUNCHING

      Gửi {{fullName}},

      Bạn đã sẵn sàng để nâng tầm trải nghiệm làm đẹp chưa?

      Chúng tôi rất vui mừng thông báo rằng ứng dụng chính thức của BroGlow sẽ chính thức được ra mắt trong vòng 10 ngày tới! Và vì bạn đã từng đăng ký trên website của chúng tôi, bạn sẽ là một trong những người đầu tiên được trải nghiệm app – hoàn toàn miễn phí và với rất nhiều ưu đãi đặc biệt.

      ✨ Vì sao bạn nên tải ngay App BroGlow?

      • Cá nhân hóa trải nghiệm làm đẹp với AI Beauty Matching
      • Nhận ưu đãi đặc biệt chỉ dành riêng cho người dùng app
      • Theo dõi lịch trình chăm da, nhắc hẹn và cập nhật xu hướng mới nhất dễ dàng

      ⏳ Chỉ còn 10 ngày nữa, app sẽ có mặt trên App Store & Google Play!

      👉 Hãy là người đầu tiên nhận thông báo cài đặt và nhận phần quà độc quyền.

      Đăng ký để nhận link tải ngay khi ra mắt: https://broglow.vercel.app/register

      Cảm ơn bạn đã đồng hành cùng BroGlow ngay từ những ngày đầu.
      Chúng tôi tin rằng bạn sẽ yêu thích trải nghiệm hoàn toàn mới trên app của BroGlow – nhanh hơn, đẹp hơn, và cá nhân hóa hơn bao giờ hết.

      Hẹn gặp bạn trên ứng dụng!

      Thân ái,
      Đội ngũ BroGlow

      © {{currentYear}} BroGlow. All rights reserved.

      Cần hỗ trợ? Vui lòng truy cập https://broglow.vercel.app/support hoặc liên hệ support@broglow.com
    `,
    description: 'Email sent to notify users about app launch',
  };

  // Website Launch Notification template (UNCHANGED)
  const websiteLaunchTemplate = {
    name: 'Website Launch Notification',
    type: EmailTemplateType.WEBSITE_LAUNCH,
    subject:
      'BroGlow sắp ra mắt chính thức – Phiên bản mới đầy đủ tính năng đang đến gần!',
    htmlContent: `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>THÔNG BÁO LAUNCHING</title>
          <style>
            .bg-container {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              color: #333;
              line-height: 1.6;
              background: #f1f0f0;
              padding: 24px;
              margin: 0;
            }
            .container {
              display: table;
              margin: 0 auto;
              width: 100%;
            }
            .content {
              display: table;
              max-width: 640px;
              margin: 0 auto;
              width: 100%;
            }
            .content-body {
              display: block;
              background-color: #fff;
              border-radius: 20px;
              padding: 42px;
            }
            .content-body p {
              color: #4d4948;
              margin-top: 16px;
              margin-bottom: 0px;
              padding: 0px;
              font-family: inherit;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 150%;
              letter-spacing: -0.096px;
            }
            .content-help {
              display: block;
              margin-top: 24px;
              padding: 42px;
              background-color: #02AAEB;
              border-radius: 20px;
              color: #fff;
            }
            .content-help p {
              font-family: inherit;
              font-size: 16px;
              line-height: 150%;
            }
            .support-button {
              border-radius: 999px;
              background: #fff;
              color: #1584F2;
              cursor: pointer;
              display: inline-block;
              padding: 16px 24px;
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              line-height: 100%;
              letter-spacing: -0.16px;
              text-decoration: none;
              font-family: inherit;
            }
            .feature-list {
              margin-top: 24px;
            }
            .feature-item {
              margin-bottom: 16px;
              display: flex;
              align-items: flex-start;
              font-family: inherit;
              font-size: 16px;
            }
            .feature-icon {
              color: #1584F2;
              margin-right: 10px;
              font-weight: bold;
            }
            .countdown {
              display: block;
              margin-top: 24px;
              padding: 16px;
              background-color: #f0f8ff;
              border-radius: 8px;
              color: #1584F2;
              font-weight: 600;
              text-align: center;
              font-family: inherit;
              font-size: 16px;
            }
            .cta-button {
              border-radius: 999px;
              background: linear-gradient(to right, #02AAEB, #1584F2);
              color: white !important;
              cursor: pointer;
              display: inline-block;
              padding: 16px 24px;
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              line-height: 100%;
              letter-spacing: -0.16px;
              text-decoration: none;
              font-family: inherit;
            }
            h1 {
              color: #1584F2;
              font-size: 24px;
              font-weight: 700;
              margin-top: 0;
              margin-bottom: 24px;
              text-align: center;
              font-family: inherit;
            }
            h2 {
              color: #1584F2;
              font-size: 20px;
              font-weight: 600;
              margin-top: 32px;
              margin-bottom: 16px;
              font-family: inherit;
            }
            .broglow-logo {
              margin-bottom: 32px;
              width: 100%;
              text-align: center;
            }
            .broglow-logo img {
              padding-right: 20px;
              max-width: 100%;
              height: auto;
            }
            .footer-text {
              font-size: 12px;
              text-align: left;
              color: #888;
              margin-top: 24px;
              font-family: inherit;
            }
            .footer-text a {
              color: #1584F2;
              text-decoration: none;
            }
            .help-container {
              display: table;
              width: 100%;
            }
            .help-title {
              display: table-cell;
              width: 50%;
              vertical-align: middle;
            }
            .help-button {
              display: table-cell;
              width: 50%;
              text-align: right;
              vertical-align: middle;
            }

            /* Responsive styles */
            @media only screen and (max-width: 640px) {
              .bg-container {
                padding: 12px;
              }
              .content-body {
                padding: 24px;
                border-radius: 12px;
              }
              .content-help {
                padding: 24px;
                border-radius: 12px;
              }
              h1 {
                font-size: 22px;
              }
              h2 {
                font-size: 18px;
              }
              .help-container {
                display: block;
              }
              .help-title, .help-button {
                display: block;
                width: 100%;
                text-align: center;
              }
              .help-button {
                margin-top: 16px;
              }
              .support-button {
                padding: 12px 20px;
                font-size: 14px;
              }
              .cta-button {
                padding: 12px 20px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
        <div class="bg-container">
          <div class="container">
            <div class="content">
              <div class="content-body">
                <div style="margin-bottom: 32px" class="broglow-logo">
                  <img src="https://storage.googleapis.com/hitech-platform.appspot.com/sws/broglow-logo_638884992209688353.png" alt="BroGlow" width="150" />
                </div>
                <h1>BroGlow chính thức ra mắt phiên bản đầy đủ – Sẵn sàng bứt phá làn da nam giới!</h1>
                <div>
                  <p>
                    <strong>Gửi {{fullName}},</strong>
                  </p>
                  <p>Cảm ơn bạn đã đăng ký và đồng hành cùng BroGlow trong giai đoạn phát triển đầu tiên!</p>
                  <p>Chúng tôi rất vui được thông báo:</p>

                  <div class="feature-list">
                    <div class="feature-item">
                      <div class="feature-icon">👉</div>
                      <div><strong>Ngày 15/07</strong>, phiên bản website đầy đủ tính năng như app sẽ chính thức được ra mắt tại <a href="https://broglow.vercel.app" style="color: #1584F2;">broglow.com</a></div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">👉</div>
                      <div><strong>Ngày 20/07</strong>, ứng dụng BroGlow sẽ chính thức có mặt trên CH Play và App Store – bạn sẽ có thể tải về dễ dàng để trải nghiệm:</div>
                    </div>
                  </div>

                  <div class="feature-list">
                    <div class="feature-item">
                      <div class="feature-icon">•</div>
                      <div>Quét gương mặt bằng AI, phân tích da chuyên sâu</div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">•</div>
                      <div>Nhận routine skincare cá nhân hóa mỗi ngày</div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">•</div>
                      <div>Gợi ý sản phẩm phù hợp – tiết kiệm thời gian và tiền bạc</div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">•</div>
                      <div>Nhận nhắc nhở, theo dõi tiến trình làn da</div>
                    </div>
                  </div>

                  <p style="text-align: center; margin-top: 24px;">
                    <a href="https://broglow.vercel.app/" class="cta-button">👉 Nhấn để xem bản demo & nhận thông báo khi app chính thức lên store</a>
                  </p>
                  <p class="footer-text">
                    Made with 🫶 by
                    <a href="https://broglow.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Cần hỗ trợ?</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://broglow.vercel.app/support" class="support-button">Hỗ trợ</a>
                  </div>
                </div>
                <div style="margin-top: 32px">
                  <p style="color: #fff; margin-top: 0">
                    BroGlow – Quét da, quét mọi rào cản
                  </p>
                  <p style="color: #fff; margin-top: 8px">
                    Vui lòng không trả lời email này. Đây là tin nhắn tự động từ địa chỉ không nhận phản hồi. Để được hỗ trợ, vui lòng nhấp vào nút Hỗ trợ ở trên hoặc gửi email cho chúng tôi tại support@broglow.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </body>
      </html>
    `,
    textContent: `
      BroGlow chính thức ra mắt phiên bản đầy đủ – Sẵn sàng bứt phá làn da nam giới!

      Gửi {{fullName}},

      Cảm ơn bạn đã đăng ký và đồng hành cùng BroGlow trong giai đoạn phát triển đầu tiên!

      Chúng tôi rất vui được thông báo:

      👉 Ngày 15/07, phiên bản website đầy đủ tính năng như app sẽ chính thức được ra mắt tại broglow.vercel.app

      👉 Ngày 20/07, ứng dụng BroGlow sẽ chính thức có mặt trên CH Play và App Store – bạn sẽ có thể tải về dễ dàng để trải nghiệm:

      • Quét gương mặt bằng AI, phân tích da chuyên sâu
      • Nhận routine skincare cá nhân hóa mỗi ngày
      • Gợi ý sản phẩm phù hợp – tiết kiệm thời gian và tiền bạc
      • Nhận nhắc nhở, theo dõi tiến trình làn da

      BroGlow – Quét da, quét mọi rào cản

      👉 Nhấn để xem bản demo & nhận thông báo khi app chính thức lên store: https://broglow.vercel.app/demo

      Truy cập website: https://broglow.vercel.app

      © {{currentYear}} BroGlow. All rights reserved.

      Cần hỗ trợ? Vui lòng truy cập https://broglow.vercel.app/support hoặc liên hệ support@broglow.com
    `,
    description: 'Email sent to notify users about website launch',
  };

  // Insert all templates
  await emailTemplateCollection.insertMany([
    welcomeTemplate,
    verifyEmailTemplate,
    forgotPasswordTemplate,
    passwordChangeTemplate,
    appLaunchTemplate,
    websiteLaunchTemplate,
  ]);

  console.log('Email templates seeded successfully');
};
