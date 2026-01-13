import dotenv
dotenv.load_dotenv()

from services.email_sender import EmailSender


sender = EmailSender()

sender.send_otp_mail("toluwalojukayode7@gmail.com")
