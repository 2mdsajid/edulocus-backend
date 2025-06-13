"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeMailToUser = exports.sendFeedbackMailToAdmin = exports.sendSubscriptionRequestMailToAdmin = exports.sendSubscriptionRequestMailToUser = void 0;
const sendSubscriptionRequestMailToUser = (email) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thanks for Your Interest in EduLocus!</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', Arial, sans-serif;
              background-color: #f4f7fa;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
          }
          table {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
          }
          td {
              padding: 0;
          }
          img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
          }
          a {
              text-decoration: none;
              color: #2563eb;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              border-radius: 8px;
              background-color: #2563eb;
              color: #ffffff;
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              text-decoration: none;
              -webkit-text-size-adjust: none;
              mso-hide: all;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          .header {
              background-color: #e0f2fe;
              padding: 30px 20px;
              text-align: center;
              border-bottom: 1px solid #d0e7fb;
          }
          .content {
              padding: 30px 40px;
              color: #333333;
              font-size: 16px;
              line-height: 1.6;
          }
          .footer {
              background-color: #f0f0f0;
              padding: 20px 40px;
              text-align: center;
              font-size: 12px;
              color: #777777;
              border-top: 1px solid #e0e0e0;
          }
          /* Responsive adjustments */
          @media only screen and (max-width: 620px) {
              .container {
                  margin: 0 auto;
                  border-radius: 0;
              }
              .content {
                  padding: 20px;
              }
              .header {
                  padding: 20px;
              }
              .footer {
                  padding: 15px 20px;
              }
              .button {
                  display: block;
                  width: calc(100% - 50px);
                  margin: 0 auto;
              }
          }
      </style>
  </head>
  <body>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7fa;">
          <tr>
              <td align="center" valign="top">
                  <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                          <td class="header">
                              <h1 style="color: #1a202c; font-size: 32px; margin: 0; padding: 0;">
                                  Thank You for Your Interest!
                              </h1>
                              <p style="color: #4a5568; font-size: 18px; margin-top: 10px; margin-bottom: 0;">
                                  We've received your request.
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td class="content">
                              <p style="margin-top: 0;">Dear Valued User,</p>
                              <p>
                                  Thank you for showing interest in EduLocus! We appreciate you reaching out to us.
                              </p>
                              <p>
                                  We've successfully received your subscription request at ${email}. Our team is currently reviewing your details and will get in touch with you very soon to discuss how we can best meet your needs.
                              </p>
                              <p>
                                  In the meantime, feel free to learn more about our services and what we offer by visiting our website:
                              </p>
                              <p style="text-align: center; margin: 30px 0;">
                                  <a href="${process.env.FRONTEND}" class="button" target="_blank">
                                      Explore Our Website
                                  </a>
                              </p>
                              <p>
                                  If you have any immediate questions or need assistance, please don't hesitate to reply to this email.
                              </p>
                              <p style="margin-bottom: 0;">Sincerely,</p>
                              <p style="margin-top: 5px;">The EduLocus Team</p>
                          </td>
                      </tr>
                      <tr>
                          <td class="footer">
                              <p style="margin-top: 0; margin-bottom: 10px;">
                                  You received this email because you submitted a subscription request to EduLocus.
                              </p>
                              <p style="margin-bottom: 10px;">
                                  <a href="${process.env.FRONTEND}/privacy" style="color: #2563eb; text-decoration: underline;">Privacy Policy</a>
                              </p>
                              <p style="margin-bottom: 0;">
                                  &copy; ${new Date().getFullYear()} EduLocus. All rights reserved.
                              </p>
                              <p style="margin-top: 15px; margin-bottom: 0;">
                                  <a href="${process.env.FRONTEND}/unsubscribe/${email}" style="color: #2563eb; text-decoration: underline;">Unsubscribe</a>
                              </p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;
};
exports.sendSubscriptionRequestMailToUser = sendSubscriptionRequestMailToUser;
const sendSubscriptionRequestMailToAdmin = (data) => {
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #007bff; text-align: center;">New Subscription Request</h2>
  <p><strong>Name:</strong> ${data.name}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Phone:</strong> ${data.phone}</p>
</div>`;
};
exports.sendSubscriptionRequestMailToAdmin = sendSubscriptionRequestMailToAdmin;
const sendFeedbackMailToAdmin = (data) => {
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #007bff; text-align: center;">New Feedback</h2>
  <p><strong>Name:</strong> ${data.name}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Message:</strong> ${data.message}</p>
</div>`;
};
exports.sendFeedbackMailToAdmin = sendFeedbackMailToAdmin;
const sendWelcomeMailToUser = (data) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to EduLocus!</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', Arial, sans-serif; /* Using Inter as a preferred font */
              background-color: #f4f7fa;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
          }
          table {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
          }
          td {
              padding: 0;
          }
          img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
          }
          a {
              text-decoration: none;
              color: #2563eb; /* A vibrant blue for links */
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              border-radius: 8px;
              background-color: #2563eb; /* Primary button color */
              color: #ffffff;
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              text-decoration: none;
              -webkit-text-size-adjust: none;
              mso-hide: all; /* Hide for Outlook if needed, but display: inline-block is usually enough */
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          .header {
              background-color: #e0f2fe; /* Light blue header background */
              padding: 30px 20px;
              text-align: center;
              border-bottom: 1px solid #d0e7fb;
          }
          .content {
              padding: 30px 40px;
              color: #333333;
              font-size: 16px;
              line-height: 1.6;
          }
          .footer {
              background-color: #f0f0f0;
              padding: 20px 40px;
              text-align: center;
              font-size: 12px;
              color: #777777;
              border-top: 1px solid #e0e0e0;
          }
          .social-icon {
              width: 24px;
              height: 24px;
              vertical-align: middle;
              margin: 0 5px;
          }
          /* Responsive adjustments */
          @media only screen and (max-width: 620px) {
              .container {
                  margin: 0 auto;
                  border-radius: 0;
              }
              .content {
                  padding: 20px;
              }
              .header {
                  padding: 20px;
              }
              .footer {
                  padding: 15px 20px;
              }
              .button {
                  display: block;
                  width: calc(100% - 50px); /* Adjust for padding */
                  margin: 0 auto;
              }
          }
      </style>
  </head>
  <body>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7fa;">
          <tr>
              <td align="center" valign="top">
                  <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                          <td class="header">
                              <h1 style="color: #1a202c; font-size: 32px; margin: 0; padding: 0;">
                                  Welcome to <span style="color: #2563eb;">EduLocus</span>!
                              </h1>
                          </td>
                      </tr>
                      <tr>
                          <td class="content">
                              <p style="margin-top: 0;">Hi ${data.name},</p>
                              <p>
                                  We're absolutely thrilled to have you join our community! Thank you for creating an account with us using the email: <strong>${data.email}</strong>.
                              </p>
                              <p>
                                  At EduLocus, we're dedicated to helping you excel at CEE preparation whether you are UG or PG aspirant.
                              </p>
                              <p>
                                  To get started and explore everything we have to offer, click the button below:
                              </p>
                              <p style="text-align: center; margin: 30px 0;">
                                  <a href="${process.env.FRONTEND}" class="button" target="_blank">
                                      Get Started Now
                                  </a>
                              </p>
                              <p>
                                  If you have any questions or need assistance, our support team is always here to help. Just reply to this email!
                              </p>
                              <p style="margin-bottom: 0;">Best regards,</p>
                              <p style="margin-top: 5px;">The EduLocus Team</p>
                          </td>
                      </tr>
                      <tr>
                          <td class="footer">
                              <p style="margin-top: 0; margin-bottom: 10px;">
                                  You received this email because you created an account with EduLocus.
                              </p>
                              <p style="margin-bottom: 10px;">
                                  <a href="${process.env.FRONTEND}/privacy" style="color: #2563eb; text-decoration: underline;">Privacy Policy</a>
                              </p>
                              <p style="margin-bottom: 0;">
                                  &copy; ${new Date().getFullYear()} EduLocus. All rights reserved.
                              </p>
                              <!--
                              <p style="margin-top: 15px; margin-bottom: 0;">
                                  <a href="[FACEBOOK_URL]" target="_blank"><img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook" class="social-icon"></a>
                                  <a href="[TWITTER_URL]" target="_blank"><img src="https://img.icons8.com/color/48/000000/twitter--v1.png" alt="Twitter" class="social-icon"></a>
                                  <a href="[LINKEDIN_URL]" target="_blank"><img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn" class="social-icon"></a>
                              </p>
                              -->
                              <p style="margin-top: 15px; margin-bottom: 0;">
                                  <a href="${process.env.FRONTEND}/unsubscribe/${data.email}" style="color: #2563eb; text-decoration: underline;">Unsubscribe</a>
                              </p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;
};
exports.sendWelcomeMailToUser = sendWelcomeMailToUser;
