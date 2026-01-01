import Models from '../../repository/Models/index.js';
import PasswordService from '../Password/index.js';
import utils from '../../utils/index.js';

const { User } = Models;


/**
 * A function to get a user from the mongo database
 * 
 * @param {*} email : the email address of the user
 * @param {*} password: the hashed password of the current user
 * @returns the user document if found else null
 */

export default async function (email, password=null) {
  // if (!email) { throw new Error('The information for login is not complete'); }
  const user = await User.findOne({ email });


  if (user) {
    if (password) {
      // if the password is not correct throw a error
      await PasswordService.verifyPassword(password, user.password);
    }
    // if the password is correct and the user is verified return a dict with the user id inputed inside
    if (user.isEmailVerified) return utils.FunctionResponse(true, 'User Found', '/select_role', {userId: user._id});
    return utils.FunctionResponse(false, 'Not Verified', '/OTP_code', {userId: user._id});
  }
  return utils.FunctionResponse(false, 'Not Found', null);
}
