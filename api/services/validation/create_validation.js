import utils from '../../utils/index.js';
import UserService from '../users/index.js';
import Models from '../../repository/Models/index.js';
import PasswordServices from '../Password/index.js';
import sendEmail from './send_email.js';

const { Validation } = Models;
export default async function (userId) {
  if (!userId) throw new Error("User id not provided");

  try {
    const user = await UserService.getUser(userId)

    const otpString = utils.OTP_generator();
    // send validation message

    if (user.email && !user.isEmailVerified) {
      await sendEmail(user.email, otpString);
    }
    if (user.phoneNumber && !user.isPhoneNumberVerified) {
      console.log("phone number found");
      // create a function to send a message to the user phone number
    }

    

    // save validation otp code in database
    const validator = new Validation({
      userId,
      otpHash: await PasswordServices.hashOtp(otpString),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    validator.save()
  } catch (err) {
    throw err;
  }
}