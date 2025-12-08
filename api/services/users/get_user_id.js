import Models from '../../repository/Models/index.js';
import PasswordService from '../Password/index.js';

const { User } = Models;


/**
 * A function to get a user from the mongo database
 * @param {*} email : the email address of the user
 * @param {*} password: the hashed password of the current user
 * @returns the user document if found else null
 */

export default async function (email, password=null) {
  if (!email && !password) { throw new Error('The information for login is not complete'); }
  const user = await User.findOne({ email });

  if (user) {
    if (password) {
      await PasswordService.verifyPassword(password, user.password);
    }
    if (user.isEmailVerified) return user._id;
    throw new Error('Please verify the Email address before logging into the app');
  }
  if (!password) return false;
  throw new Error('The User cant be found');
}
