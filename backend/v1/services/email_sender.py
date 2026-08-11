""" a module to define all the functions to send email to users of the application"""

import logging
from mailersend import MailerSendClient, EmailBuilder

from models.otp_code_model import OtpCode
from utils.get_otp_code import get_otp_code
from utils.responses import function_response
from utils.settings import settings

logger = logging.getLogger("home_buddy.email")


class EmailSender:
    """ the class to send emails to different users"""

    def __init__(self):
        """Initialize EmailSender - check credentials only, don't connect yet"""

        
        self.ms = MailerSendClient(api_key=settings.mailersend_key)

    async def send_otp_mail(self, email_address: str):
        """ a method to send otp codes to the provided email address
        Args:
            email_address (str): the email address to send the code to 
        """

        from database.db_engine import DBStorage

        code = get_otp_code()
        storage = DBStorage()

        otp_code_obj = OtpCode(email_address.lower(), code)
        save_otp_response = await storage.save_otp_code(otp_code_obj.to_dict())
        if not save_otp_response.status:
            return function_response(False)
        
        # use mailer send to create a email message object using EmailBuilder
        
        try:
            email = (EmailBuilder()
                    .from_email(settings.email_domain, settings.email_name)
                    .to_many([{"email": email_address, "name": "Recipient"}])
                    .subject(" OTP Code for Your Home Buddy Connect Limited account")
                    .html(f"""
                        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

                        <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center" style="padding: 40px 10px;">
                            
                            <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                                
                                <!-- Header -->
                                <tr>
                                <td style="background:#1e88e5; padding:20px; text-align:center; color:#ffffff;">
                                    <h1 style="margin:0; font-size:24px;">Home Buddy Connect Limited</h1>
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
                                        {code}
                                    </span>
                                    </div>

                                    <p>
                                    If you did not request this code, please ignore this email.
                                    </p>

                                    <p style="margin-top:30px;">
                                    Thanks,<br />
                                    <strong>Home Buddy Connect Limited Team</strong>
                                    </p>
                                </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                <td style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#777;">
                                    © 2026 Home Buddy Connect Limited. All rights reserved.
                                </td>
                                </tr>

                            </table>

                            </td>
                        </tr>
                        </table>

                        </body>
            """)
                    .text(f"""
                        Your OTP code is {code}
                        This code expires in 10 minutes
                        """)
                    .build()
                )

            self.ms.emails.send(email)

            logger.info("OTP email sent successfully to %s", email_address)

            return function_response(True)

        except Exception as e:
            logger.exception("Email authentication failed: %s", e)
            # Fallback to console

            print(e)
            print("\n" + "=" * 60)
            print("📧 OTP CODE (Auth failed - showing in console)")
            print("=" * 60)
            print(f"   Email: {email_address}")
            print(f"   OTP Code: {otp_code_obj.code}")
            print(f"   Valid for: 10 minutes")
            print("=" * 60 + "\n")
            return function_response(True)

    async def send_reset_password_mail(self, user_id: str, email_address: str):
        """ a function to send a resend password link to a user
        Args:
            email_address: the email address to send the otp code to
        """

        from .reset_token import ResetPassword

        # get the token using the reset token class
        # create the frontend link for the user to use to update the token
        # send the token link to the user using the user email address

        token = await ResetPassword.create_reset_token(user_id)
        if not token:
            return function_response(False, "Reset token request limit exceeded. Please try again later.")
        try:
            email = (EmailBuilder()
                    .from_email(settings.email_domain, settings.email_name)
                    .to_many([{"email": email_address, "name": "Recipient"}])
                    .subject(" Reset Password Link for Your Home Buddy Connect Limited account")
                    .html(f"""
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Reset Your Home Buddy Password</title>
                        </head>

                        <body style="
                            margin: 0;
                            padding: 0;
                            background-color: #f5f7fa;
                            font-family: Arial, Helvetica, sans-serif;
                            color: #333333;
                        ">

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="background-color: #f5f7fa; padding: 40px 20px;"
                            >
                                <tr>
                                    <td align="center">

                                        <!-- Main Container -->
                                        <table
                                            width="100%"
                                            cellpadding="0"
                                            cellspacing="0"
                                            border="0"
                                            style="
                                                max-width: 600px;
                                                background-color: #ffffff;
                                                border-radius: 10px;
                                                overflow: hidden;
                                            "
                                        >

                                            <!-- Header -->
                                            <tr>
                                                <td
                                                    align="center"
                                                    style="
                                                        padding: 30px 20px;
                                                        background-color: #1a73e8;
                                                    "
                                                >
                                                    <h1 style="
                                                        margin: 0;
                                                        color: #ffffff;
                                                        font-size: 28px;
                                                        font-weight: 700;
                                                    ">
                                                        Home Buddy
                                                    </h1>

                                                    <p style="
                                                        margin: 8px 0 0;
                                                        color: #e8f0fe;
                                                        font-size: 14px;
                                                    ">
                                                        Find a place you'll love to call home
                                                    </p>
                                                </td>
                                            </tr>

                                            <!-- Content -->
                                            <tr>
                                                <td style="padding: 40px 35px;">

                                                    <h2 style="
                                                        margin: 0 0 20px;
                                                        color: #222222;
                                                        font-size: 24px;
                                                    ">
                                                        Reset Your Password
                                                    </h2>

                                                    <p style="
                                                        margin: 0 0 18px;
                                                        font-size: 16px;
                                                        line-height: 1.6;
                                                    ">
                                                        Hello,
                                                    </p>

                                                    <p style="
                                                        margin: 0 0 18px;
                                                        font-size: 16px;
                                                        line-height: 1.6;
                                                    ">
                                                        We received a request to reset the password
                                                        associated with your Home Buddy account.
                                                    </p>

                                                    <p style="
                                                        margin: 0 0 28px;
                                                        font-size: 16px;
                                                        line-height: 1.6;
                                                    ">
                                                        Click the button below to create a new password
                                                        and regain access to your account.
                                                    </p>

                                                    <!-- Reset Button -->
                                                    <table
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                        border="0"
                                                        width="100%"
                                                    >
                                                        <tr>
                                                            <td align="center">

                                                                <a
                                                                    href="{settings.frontend_url}/password/reset?token={token}"
                                                                    style="
                                                                        display: inline-block;
                                                                        padding: 14px 30px;
                                                                        background-color: #1a73e8;
                                                                        color: #ffffff;
                                                                        text-decoration: none;
                                                                        font-size: 16px;
                                                                        font-weight: bold;
                                                                        border-radius: 6px;
                                                                    "
                                                                >
                                                                    Reset My Password
                                                                </a>

                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <p style="
                                                        margin: 30px 0 10px;
                                                        font-size: 14px;
                                                        line-height: 1.6;
                                                        color: #666666;
                                                    ">
                                                        This password reset link will expire in
                                                        <strong>30 minutes</strong>.
                                                    </p>

                                                    <p style="
                                                        margin: 0 0 10px;
                                                        font-size: 14px;
                                                        line-height: 1.6;
                                                        color: #666666;
                                                    ">
                                                        If the button above doesn't work, copy and paste
                                                        the following link into your browser:
                                                    </p>

                                                    <p style="
                                                        margin: 0 0 25px;
                                                        padding: 12px;
                                                        background-color: #f5f7fa;
                                                        border-radius: 5px;
                                                        font-size: 13px;
                                                        line-height: 1.5;
                                                        word-break: break-all;
                                                    ">
                                                        <a
                                                            href="{settings.frontend_url}/password/reset?token={token}"
                                                            style="
                                                                color: #1a73e8;
                                                                text-decoration: none;
                                                            "
                                                        >
                                                            {settings.frontend_url}/password/reset?token={token}
                                                        </a>
                                                    </p>

                                                    <p style="
                                                        margin: 0;
                                                        font-size: 14px;
                                                        line-height: 1.6;
                                                        color: #666666;
                                                    ">
                                                        If you did not request a password reset,
                                                        you can safely ignore this email. Your password
                                                        will remain unchanged.
                                                    </p>

                                                </td>
                                            </tr>

                                            <!-- Footer -->
                                            <tr>
                                                <td
                                                    align="center"
                                                    style="
                                                        padding: 25px 30px;
                                                        background-color: #f5f7fa;
                                                        border-top: 1px solid #eeeeee;
                                                    "
                                                >

                                                    <p style="
                                                        margin: 0 0 8px;
                                                        font-size: 13px;
                                                        color: #777777;
                                                    ">
                                                        © 2026 Home Buddy. All rights reserved.
                                                    </p>

                                                    <p style="
                                                        margin: 0;
                                                        font-size: 12px;
                                                        color: #999999;
                                                    ">
                                                        This is an automated message. Please do not
                                                        reply to this email.
                                                    </p>

                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </body>
                        </html>
                        """)
                    .text(f"""
                        Your Reset Password Link: {settings.frontend_url}/password/reset?token={token}
                        """)
                    .build()
                )

            self.ms.emails.send(email)

            logger.info("Password reset email sent successfully to %s", email_address)

            return function_response(True)

        except Exception as e:
                    logger.exception("Email authentication failed: %s", e)
                    # Fallback to console
        
                    print(e)
                    print("\n" + "=" * 60)
                    print("📧 RESET PASSWORD LINK (Auth failed - showing in console)")
                    print("=" * 60)
                    print(f"   Email: {email_address}")
                    print(f"   Reset Password Link: {settings.frontend_url}/password/reset?token={token}")
                    print("=" * 60 + "\n")
                    return function_response(True)
            
        pass

email_sender = EmailSender()