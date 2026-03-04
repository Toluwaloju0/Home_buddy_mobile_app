""" a module to define all the functions to send email to users of the application"""

import smtplib
from os import getenv
from email.message import EmailMessage
from database.db_engine import storage
from models.otp_code_model import OtpCode
from utils.get_otp_code import get_otp_code
from utils.responses import function_response


class EmailSender:
    """ the class to send emails to different users"""

    def __init__(self):
        """Initialize EmailSender - check credentials only, don't connect yet"""
        self.__email = getenv("GOOGLE_ACCOUNT")
        self.__password = getenv("GOOGLE_PASSWORD")
        
        # Check if credentials are configured
        self.__credentials_configured = (
            self.__email and 
            self.__password and 
            self.__email != "your-email@gmail.com" and
            self.__password != "your-app-specific-password"
        )
        
        if not self.__credentials_configured:
            # log all this to a file
            print("⚠️  Email credentials not configured. OTP emails will be printed to console instead.")
            print("   To enable email sending, update GOOGLE_ACCOUNT and GOOGLE_PASSWORD in .env")
        else:
            print(f"✅ Email service configured for: {self.__email}")

    def send_otp_mail(self, email_address: str):
        """ a method to send otp codes to the provided email address
        Args:
            email_address (str): the email address to send the code to 
        """

        code = get_otp_code()

        # otp_code_obj = OtpCode(email_address, code)
        # save_otp_response = storage.save_otp_code(otp_code_obj.to_dict())
        # if not save_otp_response.status:
        #     return function_response(False)
        
        # If email is not configured, print OTP to console
        if not self.__credentials_configured:
            print("\n" + "="*60)
            print("📧 OTP CODE (Email not configured - showing in console)")
            print("="*60)
            print(f"   Email: {email_address}")
            print(f"   OTP Code: {otp_code_obj.code}")
            print(f"   Valid for: 10 minutes")
            print("="*60 + "\n")
            return function_response(True)
        
        # Create fresh SMTP connection for EACH email
        smtp_server = None
        try:
            # Connect to SMTP server (new connection every time)
            print(f"🔌 Connecting to SMTP server for {email_address}...")
            smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
            smtp_server.login(self.__email, self.__password)
            print(f"✅ SMTP connected successfully")
            
            # Create the email message
            msg = EmailMessage()
            msg["To"] = email_address
            msg["From"] = f"Home Buddy <{self.__email}>"
            msg["Subject"] = "The OTP Code for Your Home Buddy account"
            msg.set_content(f"""
Your OTP code is {code}

This code expires in 10 minutes
""")
            
            msg.add_alternative(f"""
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
                {code}
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
            © 2026 Home Buddy. All rights reserved.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
""", subtype="html")

            # Send the email
            smtp_server.send_message(msg)
            print(f"✅ OTP email sent successfully to {email_address}")

            otp_code_obj = OtpCode(email_address, code)
            save_otp_response = storage.save_otp_code(otp_code_obj.to_dict())
            if not save_otp_response.status:
              return function_response(False)
            
            # Close connection properly
            smtp_server.quit()
            print(f"🔌 SMTP connection closed")
            
            return function_response(True)
            
        except smtplib.SMTPAuthenticationError as e:
            print(f"❌ Email authentication failed: {e}")
            print("   Check GOOGLE_ACCOUNT and GOOGLE_PASSWORD in .env")
            print("   Get app password from: https://myaccount.google.com/apppasswords")
            
            # Fallback to console
            print("\n" + "="*60)
            print("📧 OTP CODE (Auth failed - showing in console)")
            print("="*60)
            print(f"   Email: {email_address}")
            print(f"   OTP Code: {otp_code_obj.code}")
            print(f"   Valid for: 10 minutes")
            print("="*60 + "\n")
            return function_response(True)
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            
            # Fallback to console
            print("\n" + "="*60)
            print("📧 OTP CODE (Email send failed - showing in console)")
            print("="*60)
            print(f"   Email: {email_address}")
            print(f"   OTP Code: {otp_code_obj.code}")
            print(f"   Valid for: 10 minutes")
            print("="*60 + "\n")
            return function_response(True)
            
        finally:
            # Always close connection if it exists
            if smtp_server is not None:
                try:
                    smtp_server.quit()
                except:
                    pass


email_sender = EmailSender()