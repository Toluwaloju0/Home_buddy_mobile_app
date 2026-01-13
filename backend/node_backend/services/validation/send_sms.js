import { MailerSend, SMSParams, SMSPersonalization } from "mailersend";

// NOTE: THIS HAS NOT BEEN TESTED

export default async function () {
  const mailersend = new MailerSend({
  apiKey: process.env.API_KEY,
  });

  const recipients = [
  "+18332647501",
  "+18332647502"
  ];

  const personalization = [
  new SMSPersonalization("+18332647501", {
      "name": "Dummy"
  }),
  new SMSPersonalization("+18332647502", {
      "name": "Not Dummy"
  }),
  ];

  const smsParams = new SMSParams()
  .setFrom("+18332647501")
  .setTo(recipients)
  .setPersonalization(personalization)
  .setText("Hey {{name}} welcome to our organization");

  await mailersend.sms.send(smsParams);

  return "done";
}