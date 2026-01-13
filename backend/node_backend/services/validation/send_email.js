import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export default async function (email, otpString) {;

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILSENDER_API_KEY,
  });

  const sentFrom = new Sender("MS_YwqdqF@test-pzkmgq78172l059v.mlsender.net", "Your name");

  const recipients = [
  new Recipient(email, "Your Client")
  ];

  const emailParams = new EmailParams()
  .setFrom(sentFrom)
  .setTo(recipients)
  .setReplyTo(sentFrom)
  .setSubject("Home Buddy Verification Code")
  .setHtml(`
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding: 40px 10px;">
      
      <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background:#1e88e5; padding:20px; text-align:center; color:#ffffff;">
            <h1 style="margin:0; font-size:24px;">Home Buddy</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px; color:#333333;">
            <h2 style="margin-top:0;">Verify Your Email</h2>

            <p>
              Hello,
            </p>

            <p>
              Use the verification code below to complete your sign-up or login.
              This code is valid for <strong>10 minutes</strong>.
            </p>

            <!-- OTP Box -->
            <div style="text-align:center; margin:30px 0;">
              <span style="
                display:inline-block;
                padding:15px 30px;
                font-size:28px;
                letter-spacing:4px;
                background:#f1f5f9;
                color:#1e88e5;
                border-radius:6px;
                font-weight:bold;
              ">
                ${otpString}
              </span>
            </div>

            <p>
              If you did not request this code, please ignore this email.
            </p>

            <p style="margin-top:30px;">
              Thanks,<br />
              <strong>Home Buddy Team</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#777;">
            © {{YEAR}} Home Buddy. All rights reserved.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
  `)
  // .setText("This is the text content");

  await mailerSend.email.send(emailParams);
}