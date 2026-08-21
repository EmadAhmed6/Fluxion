import nodemailer from "nodemailer";
const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
        },
    });
    await transporter.sendMail({
        from: `"Fluxion App" <${process.env.USER_EMAIL}>`,
        to,
        subject,
        html,
    });
};
const generateOtpEmailHtml = (username, otp) => {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" max-width="560" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
            <!-- Header Banner -->
            <tr>
              <td align="center" style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15)); border-bottom: 1px solid #334155;">
                <div style="display: inline-block; padding: 10px 18px; background: #6366f1; border-radius: 12px; font-weight: 800; font-size: 20px; color: #ffffff; letter-spacing: 1px;">
                  FLUXION 
                </div>
                <h1 style="margin: 16px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">Email Verification Code</h1>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px; text-align: center;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                  Hello <strong style="color: #ffffff;">${username}</strong> 👋, welcome to Fluxion!
                </p>
                <p style="margin: 0 0 28px 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                  Use the 6-digit verification code below to complete your account registration:
                </p>

                <!-- OTP Code Display Card -->
                <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 16px; padding: 20px; margin: 0 auto 28px auto; max-width: 320px;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #818cf8; letter-spacing: 10px; display: inline-block; margin-left: 10px;">${otp}</span>
                </div>

                <p style="margin: 0 0 8px 0; font-size: 13px; color: #e2e8f0; font-weight: 600;">
                  ⏱️ Code expires in <strong>10 minutes</strong>.
                </p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">
                  If you didn't create an account with Fluxion, please safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 20px; background-color: #0f172a; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} Fluxion Engineering Platform. All rights reserved.
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
const generateResetPasswordEmailHtml = (username, resetLink) => {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" max-width="560" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
            <!-- Header Banner -->
            <tr>
              <td align="center" style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(147, 51, 234, 0.15)); border-bottom: 1px solid #334155;">
                <div style="display: inline-block; padding: 10px 18px; background: #6366f1; border-radius: 12px; font-weight: 800; font-size: 20px; color: #ffffff; letter-spacing: 1px;">
                  FLUXION
                </div>
                <h1 style="margin: 16px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">Reset Your Password</h1>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px; text-align: center;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                  Hello <strong style="color: #ffffff;">${username}</strong>,
                </p>
                <p style="margin: 0 0 28px 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                  We received a request to reset the password for your Fluxion account. Click the button below to choose a new password:
                </p>

                <!-- Reset Password CTA Button -->
                <div style="margin: 0 0 28px 0;">
                  <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                    Reset Password
                  </a>
                </div>

                <p style="margin: 0 0 16px 0; font-size: 13px; color: #e2e8f0; font-weight: 600;">
                  ⏱️ Link expires in <strong>10 minutes</strong>.
                </p>
                <div style="background-color: #0f172a; border-radius: 10px; padding: 12px; font-size: 11px; color: #64748b; word-break: break-all;">
                  If the button above doesn't work, copy and paste this URL into your browser:<br>
                  <a href="${resetLink}" style="color: #818cf8; text-decoration: underline;">${resetLink}</a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 20px; background-color: #0f172a; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
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
export { sendEmail, generateOtpEmailHtml, generateResetPasswordEmailHtml };
//# sourceMappingURL=Email.js.map