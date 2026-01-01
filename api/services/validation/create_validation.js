/**
 * get a validation OTP string and send it to the users email for validation of the email
 * if a validation exists return to the user to check mail for OTP string and use it or request a new OTP
 */

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
      // check if an OTP has not been sent to the user
      // add a way to check if the user has requested more than threee OTP CODES
      // 

      // const otpDocument = await OTP.get(userId) // the otp document in the database
      await sendEmail(user.email, otpString);

    

    // save validation otp code in database
    const validator = new Validation({
      userId,
      otpHash: await PasswordServices.hashOtp(otpString),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    validator.save()
    }
  } catch (err) {
    throw err;
  }
}