import dotenv from 'dotenv';
import send_sms from "./services/validation/send_sms.js";

dotenv.config();

send_sms().then(result => {
  console.log(result);
}).catch ((err) => {
  console.log("\n\n\nAn error occured\n\n\n");

  console.log(err);
});