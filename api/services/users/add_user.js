import Models from '../../repository/Models/index.js';
import utils from '../../utils/index.js';

/**
 * A function to add a new user to the mongo database
 * 
 * @param {string} email 
 * @param {string} password
 */
export default async function (email, password) {

  const user = new Models.User({email, password})

  await user.save()

  return utils.FunctionResponse(true, 'User Created', '/OTP_code', {userId: user._id});
}