import { Resend } from 'resend';

export const sendOtpEmail = async (email: string, otp: string, username: string): Promise<boolean> => {
  console.log('====================================================');
  console.log(`[OTP VERIFICATION] To: ${email} (${username}) | CODE: ${otp}`);
  console.log('====================================================');

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@valqore.pro';

  if (!resendApiKey) {
    console.log('[RESEND] No RESEND_API_KEY found in .env, logged OTP to console above.');
    return true;
  }

  const resend = new Resend(resendApiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: `Valqore Security <${fromEmail}>`,
      to: [email],
      subject: `[${otp}] Your Valqore Verification Code`,

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { background-color: #0d0f12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: #14171d; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            .logo { text-align: center; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #ffffff; text-align: center; letter-spacing: 1px; margin: 0 0 10px 0; }
            .subtitle { font-size: 14px; color: #94a3b8; text-align: center; margin-bottom: 30px; }
            .otp-box { background: rgba(220, 248, 54, 0.06); border: 2px dashed #dcf836; border-radius: 16px; padding: 24px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #dcf836; font-family: monospace; display: inline-block; }
            .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; line-height: 1.6; }
            .alert { color: #f59e0b; font-size: 12px; margin-top: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 style="color: #dcf836; margin: 0; font-size: 28px; letter-spacing: 2px;">VALQORE</h1>
            </div>
            <div class="title">ACCOUNT VERIFICATION</div>
            <div class="subtitle">Hello <strong style="color: #ffffff;">${username}</strong>, use the one-time code below to verify your email and complete your registration.</div>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>

            <div class="alert">⚠️ This code expires in 10 minutes. Do not share it with anyone.</div>

            <div class="footer">
              If you didn't request this code, you can safely ignore this email.<br>
              &copy; ${new Date().getFullYear()} VALQORE.PRO - All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return false;
    }

    console.log('[RESEND SUCCESS] Email sent successfully with ID:', data?.id);
    return true;
  } catch (err) {
    console.error('[SEND EMAIL EXCEPTION]', err);
    return false;
  }
};
