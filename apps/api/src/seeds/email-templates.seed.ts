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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #02AAEB, #1584F2); padding: 20px; text-align: center; }
          .logo { max-width: 200px; }
          .content { background-color: #ffffff; padding: 30px; border-radius: 8px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: linear-gradient(to right, #02AAEB, #1584F2); color: white; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: bold; margin-top: 15px; }
          .footer { text-align: center; font-size: 12px; color: #777; padding: 20px; }
          h1 { color: #ffffff; margin: 15px 0; }
          .app-icon { width: 60px; height: 60px; border-radius: 12px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to BroGlow!</h1>
          </div>
          <div class="content">
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>Thank you for joining BroGlow. We're excited to have you as a new member!</p>
            <p>Your account has been successfully created with the email address: <strong>{{email}}</strong></p>
            <p>You can now sign in to your account and start using our platform to discover your skin's true potential.</p>
          </div>
          <div class="footer">
            <p>&copy; {{currentYear}} BroGlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Welcome to BroGlow!

      Hello {{firstName}} {{lastName}},

      Thank you for joining BroGlow. We're excited to have you as a new member!

      Your account has been successfully created with the email address: {{email}}

      You can now sign in to your account and start using our platform to discover your skin's true potential.

      Sign in here: {{loginUrl}}

      © {{currentYear}} BroGlow. All rights reserved.
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #02AAEB, #1584F2); padding: 20px; text-align: center; }
          .logo { max-width: 200px; }
          .content { background-color: #ffffff; padding: 30px; border-radius: 8px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .verification-link { display: inline-block; background: linear-gradient(to right, #02AAEB, #1584F2); color: white; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: bold; margin-top: 15px; }
          .verification-code { font-size: 24px; text-align: center; font-weight: bold; letter-spacing: 6px; margin: 25px 0; color: #02AAEB; background-color: #f0f8ff; padding: 15px; border-radius: 8px; }
          .footer { text-align: center; font-size: 12px; color: #777; padding: 20px; }
          h1 { color: #ffffff; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>Thank you for creating an account with BroGlow. To complete your registration and start your skincare journey, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="{{verificationLink}}" class="verification-link">Verify Email Address</a>
            </p>
            <p>Or use this verification code:</p>
            <div class="verification-code">{{verificationCode}}</div>
            <p>This verification code will expire in {{expirationMinutes}} minutes.</p>
            <p>If you did not create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; {{currentYear}} BroGlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Verify Your Email Address

      Hello {{firstName}} {{lastName}},

      Thank you for creating an account with BroGlow. To complete your registration, please verify your email address by visiting the link below:

      {{verificationLink}}

      Or use this verification code: {{verificationCode}}

      This verification code will expire in {{expirationMinutes}} minutes.

      If you did not create an account with us, please ignore this email.

      © {{currentYear}} BroGlow. All rights reserved.
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #02AAEB, #1584F2); padding: 20px; text-align: center; }
          .logo { max-width: 200px; }
          .content { background-color: #ffffff; padding: 30px; border-radius: 8px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .reset-code { font-size: 28px; text-align: center; font-weight: bold; letter-spacing: 8px; margin: 25px 0; color: #02AAEB; background-color: #f0f8ff; padding: 15px; border-radius: 8px; }
          .footer { text-align: center; font-size: 12px; color: #777; padding: 20px; }
          h1 { color: #ffffff; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Code</h1>
          </div>
          <div class="content">
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>We received a request to reset your password for your BroGlow account. Use the code below to reset your password:</p>
            <div class="reset-code">{{otp}}</div>
            <p>This code will expire in {{expirationMinutes}} minutes.</p>
            <p>If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.</p>
          </div>
          <div class="footer">
            <p>&copy; {{currentYear}} BroGlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Password Reset Code

      Hello {{firstName}} {{lastName}},

      We received a request to reset your password for your BroGlow account. Use the code below to reset your password:

      {{otp}}

      This code will expire in {{expirationMinutes}} minutes.

      If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.

      © {{currentYear}} BroGlow. All rights reserved.
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #02AAEB, #1584F2); padding: 20px; text-align: center; }
          .logo { max-width: 200px; }
          .content { background-color: #ffffff; padding: 30px; border-radius: 8px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .alert-icon { font-size: 48px; color: #02AAEB; text-align: center; margin: 10px 0; }
          .footer { text-align: center; font-size: 12px; color: #777; padding: 20px; }
          h1 { color: #ffffff; margin: 15px 0; }
          .contact-button { display: inline-block; background: linear-gradient(to right, #02AAEB, #1584F2); color: white; text-decoration: none; padding: 10px 20px; border-radius: 30px; font-weight: bold; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          <div class="content">
            <div class="alert-icon">✓</div>
            <p>Hello {{firstName}} {{lastName}},</p>
            <p>Your password for BroGlow has been changed successfully.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p style="text-align: center;">
              <a href="mailto:{{supportEmail}}" class="contact-button">Contact Support</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; {{currentYear}} BroGlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Password Changed Successfully

      Hello {{firstName}} {{lastName}},

      Your password for BroGlow has been changed successfully.

      If you did not make this change, please contact our support team immediately at {{supportEmail}}.

      © {{currentYear}} BroGlow. All rights reserved.
    `,
    description: 'Email sent to confirm password has been changed',
  };

  // App Launch Notification template
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
                  <img src="https://stepnavilabs-broglow-production.up.railway.app/uploads/50fc6831-dc72-420c-853d-9747f49030ba.png" alt="BroGlow" width="150" />
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
                    <a href="https://stepnavilabs-broglow-portal.vercel.app/register" class="cta-button">Đăng ký để nhận link tải ngay khi ra mắt</a>
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
                    <a href="https://stepnavilabs-broglow-portal.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Cần hỗ trợ?</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://stepnavilabs-broglow-portal.vercel.app/support" class="support-button">Hỗ trợ</a>
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

      Đăng ký để nhận link tải ngay khi ra mắt: https://stepnavilabs-broglow-portal.vercel.app/register

      Cảm ơn bạn đã đồng hành cùng BroGlow ngay từ những ngày đầu.
      Chúng tôi tin rằng bạn sẽ yêu thích trải nghiệm hoàn toàn mới trên app của BroGlow – nhanh hơn, đẹp hơn, và cá nhân hóa hơn bao giờ hết.

      Hẹn gặp bạn trên ứng dụng!

      Thân ái,
      Đội ngũ BroGlow

      © {{currentYear}} BroGlow. All rights reserved.

      Cần hỗ trợ? Vui lòng truy cập https://stepnavilabs-broglow-portal.vercel.app/support hoặc liên hệ support@broglow.com
    `,
    description: 'Email sent to notify users about app launch',
  };

  // Website Launch Notification template
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
                  <img src="https://stepnavilabs-broglow-production.up.railway.app/uploads/50fc6831-dc72-420c-853d-9747f49030ba.png" alt="BroGlow" width="150" />
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
                      <div><strong>Ngày 15/07</strong>, phiên bản website đầy đủ tính năng như app sẽ chính thức được ra mắt tại <a href="https://stepnavilabs-broglow-portal.vercel.app" style="color: #1584F2;">broglow.com</a></div>
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
                    <a href="https://stepnavilabs-broglow-portal.vercel.app/" class="cta-button">👉 Nhấn để xem bản demo & nhận thông báo khi app chính thức lên store</a>
                  </p>
                  <p class="footer-text">
                    Made with 🫶 by
                    <a href="https://stepnavilabs-broglow-portal.vercel.app/">broglow.com</a>
                  </p>
                </div>
              </div>
              <div class="content-help">
                <div class="help-container">
                  <div class="help-title">
                    <h2 style="margin: 0; padding: 0; color: #fff;">Cần hỗ trợ?</h2>
                  </div>
                  <div class="help-button">
                    <a href="https://stepnavilabs-broglow-portal.vercel.app/support" class="support-button">Hỗ trợ</a>
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

      👉 Ngày 15/07, phiên bản website đầy đủ tính năng như app sẽ chính thức được ra mắt tại stepnavilabs-broglow-portal.vercel.app

      👉 Ngày 20/07, ứng dụng BroGlow sẽ chính thức có mặt trên CH Play và App Store – bạn sẽ có thể tải về dễ dàng để trải nghiệm:

      • Quét gương mặt bằng AI, phân tích da chuyên sâu
      • Nhận routine skincare cá nhân hóa mỗi ngày
      • Gợi ý sản phẩm phù hợp – tiết kiệm thời gian và tiền bạc
      • Nhận nhắc nhở, theo dõi tiến trình làn da

      BroGlow – Quét da, quét mọi rào cản

      👉 Nhấn để xem bản demo & nhận thông báo khi app chính thức lên store: https://stepnavilabs-broglow-portal.vercel.app/demo

      Truy cập website: https://stepnavilabs-broglow-portal.vercel.app

      © {{currentYear}} BroGlow. All rights reserved.

      Cần hỗ trợ? Vui lòng truy cập https://stepnavilabs-broglow-portal.vercel.app/support hoặc liên hệ support@broglow.com
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
