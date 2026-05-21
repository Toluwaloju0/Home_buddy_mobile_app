"""
Quick test script to verify email configuration
Run this in your backend directory: python test_email.py
"""

from dotenv import load_dotenv
load_dotenv()

from os import getenv
import sys

print("\n" + "="*60)
print("  EMAIL CONFIGURATION TEST")
print("="*60 + "\n")

# Check environment variables
google_account = getenv("GOOGLE_ACCOUNT")
google_password = getenv("GOOGLE_PASSWORD")
google_address = getenv("GOOGLE_ADDRESS")

print("1. Checking .env configuration...")
print(f"   GOOGLE_ACCOUNT: {google_account}")
print(f"   GOOGLE_PASSWORD: {'*' * len(google_password) if google_password else 'NOT SET'} ({len(google_password) if google_password else 0} chars)")
print(f"   GOOGLE_ADDRESS: {google_address}")

# Validate configuration
issues = []

if not google_account or google_account == "your-email@gmail.com":
    issues.append("❌ GOOGLE_ACCOUNT not set or has placeholder value")
else:
    print("   ✅ GOOGLE_ACCOUNT configured")

if not google_password or google_password == "your-app-specific-password":
    issues.append("❌ GOOGLE_PASSWORD not set or has placeholder value")
elif len(google_password) != 16:
    issues.append(f"⚠️  GOOGLE_PASSWORD should be 16 characters, found {len(google_password)}")
else:
    print("   ✅ GOOGLE_PASSWORD configured (16 characters)")

if not google_address:
    issues.append("❌ GOOGLE_ADDRESS not set")
else:
    print("   ✅ GOOGLE_ADDRESS configured")

if issues:
    print("\n❌ Configuration Issues Found:")
    for issue in issues:
        print(f"   {issue}")
    print("\n")
    sys.exit(1)

# Test SMTP connection
print("\n2. Testing SMTP connection...")
try:
    import smtplib
    
    smtp_server = smtplib.SMTP("smtp.gmail.com", 587)
    print("   ✅ Connected to smtp.gmail.com:587")
    
    smtp_server.starttls()
    print("   ✅ TLS encryption enabled")
    
    smtp_server.login(google_account, google_password)
    print("   ✅ Authentication successful!")
    
    smtp_server.quit()
    print("   ✅ Connection closed properly")
    
except smtplib.SMTPAuthenticationError as e:
    print(f"\n❌ Authentication Failed!")
    print(f"   Error: {e}")
    print("\n   Possible causes:")
    print("   1. App password is incorrect")
    print("   2. 2-Factor Authentication not enabled on Gmail")
    print("   3. App password has spaces (should be 16 chars, no spaces)")
    print("\n   Solution:")
    print("   - Go to: https://myaccount.google.com/apppasswords")
    print("   - Generate a NEW app password")
    print("   - Copy it carefully (no spaces!)")
    print("   - Update GOOGLE_PASSWORD in .env")
    sys.exit(1)
    
except Exception as e:
    print(f"\n❌ Connection Failed!")
    print(f"   Error: {e}")
    print("\n   Possible causes:")
    print("   1. No internet connection")
    print("   2. Firewall blocking port 587")
    print("   3. SMTP server temporarily unavailable")
    sys.exit(1)

# Test email sending
print("\n3. Testing email sending...")
try:
    from services.email_sender import email_sender
    
    print(f"   Sending test OTP to: {google_account}")
    response = email_sender.send_otp_mail(google_account)
    
    if response.status:
        print("   ✅ Email sent successfully!")
        print("\n" + "="*60)
        print("  SUCCESS! Email configuration is working!")
        print("="*60)
        print("\n📧 CHECK YOUR INBOX!")
        print(f"   Email: {google_account}")
        print("   Subject: The OTP Code for Your Home Buddy account")
        print("\n   If you don't see it:")
        print("   - Check spam/junk folder")
        print("   - Wait 1-2 minutes")
        print("   - Check Gmail 'Sent' folder to confirm it was sent")
        print("\n")
    else:
        print("   ❌ Email send failed")
        print("   Check backend logs for details")
        sys.exit(1)
        
except Exception as e:
    print(f"\n❌ Email send failed!")
    print(f"   Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)