import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/reset-password/${resetToken}`;

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Reset Your Password - Acliptic',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #828282 0%, #95A281 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 0.5px;">Password Reset</h1>
            </div>

            <!-- Main Content -->
            <div style="background-color: #f9fafb; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">Hello,</p>

              <p style="font-size: 16px; margin-bottom: 24px; color: #374151; line-height: 1.6;">
                We received a request to reset your password for your <strong>Acliptic</strong> account.
                Click the button below to create a new password:
              </p>

              <!-- CTA Button with gradient -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}"
                   style="background: linear-gradient(135deg, #828282 0%, #95A281 100%);
                          color: white;
                          padding: 16px 40px;
                          text-decoration: none;
                          border-radius: 50px;
                          display: inline-block;
                          font-weight: 600;
                          font-size: 16px;
                          box-shadow: 0 4px 12px rgba(130, 130, 130, 0.3);
                          transition: all 0.3s ease;">
                  Reset Password
                </a>
              </div>

              <!-- Alternative link -->
              <div style="margin-top: 32px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 13px; color: #4b5563; word-break: break-all; margin: 0;">
                  ${resetUrl}
                </p>
              </div>

              <!-- Important notice -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
                  <p style="font-size: 14px; color: #92400e; margin: 0; font-weight: 600;">
                    ⚠️ Important: This link expires in 1 hour
                  </p>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  If you didn't request this password reset, please ignore this email or contact support if you have concerns about your account security.
                </p>
              </div>

              <!-- Footer -->
              <div style="margin-top: 40px; text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Acliptic. All rights reserved.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                  Clip your streams, grow your audience.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Resend API response:', result);

    if (result.error) {
      console.error('Resend error:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordChangedEmail(email: string, username: string) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Password Changed Successfully - Acliptic',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #828282 0%, #95A281 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 0.5px;">Password Changed</h1>
            </div>

            <!-- Main Content -->
            <div style="background-color: #f9fafb; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px; margin-bottom: 24px; color: #374151;">Hello <strong>${username}</strong>,</p>

              <p style="font-size: 16px; margin-bottom: 24px; color: #374151; line-height: 1.6;">
                This email confirms that your password was successfully changed for your <strong>Acliptic</strong> account.
              </p>

              <!-- Success message -->
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 32px 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">✓</div>
                <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">
                  Your account is now secured with your new password
                </p>
              </div>

              <!-- Security notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="font-size: 14px; color: #92400e; margin: 0; font-weight: 600;">
                  🔐 Didn't make this change?
                </p>
                <p style="font-size: 14px; color: #92400e; margin: 8px 0 0 0;">
                  If you didn't change your password, please contact our support team immediately to secure your account.
                </p>
              </div>

              <!-- Quick tips -->
              <div style="margin-top: 32px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="font-size: 14px; color: #4b5563; margin: 0 0 12px 0; font-weight: 600;">
                  Password Security Tips:
                </p>
                <ul style="font-size: 13px; color: #6b7280; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">Use a unique password for each account</li>
                  <li style="margin-bottom: 6px;">Enable two-factor authentication when available</li>
                  <li style="margin-bottom: 0;">Never share your password with anyone</li>
                </ul>
              </div>

              <!-- Footer -->
              <div style="margin-top: 40px; text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Acliptic. All rights reserved.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                  Clip your streams, grow your audience.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
