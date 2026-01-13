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
        self.__smtp_server = smtplib.SMTP("smtp.gmail.com", 587)
        self.__smtp_server.starttls()
        password = getenv("GOOGLE_PASSWORD")
        email = getenv("GOOGLE_ACCOUNT")
        self.__smtp_server.login(email, password)

    def send_otp_mail(self, email_address: str):
        """ a method to send otp codes to the provided email address
        Args:
            email_address (str): the email address to send the code to 
        """

        code = get_otp_code()

        otp_code_obj = OtpCode(email_address, code)
        save_otp_response = storage.save_otp_code(otp_code_obj.to_dict())
        if not save_otp_response.status:
            return function_response(False)
        
        # create the message and add the html content for sending to the users email address
        msg = EmailMessage()
        msg["To"] = email_address
        msg["From"] = getenv("GOOGLE_ADDRESS")
        msg["Subject"] = "The OTP Code for Your Home buddy limited account"
        msg.set_content(f"""
Your OTP code is {otp_code_obj.code}\n\n
This code expires in 10 minuites
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
                {otp_code_obj.code}
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
            © {{2026}} Home Buddy. All rights reserved.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
""", subtype="html")

        self.__smtp_server.send_message(msg)

        return function_response(True)
    

email_sender = EmailSender()