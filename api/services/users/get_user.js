import Models from '../../repository/Models/index.js';
const User = { Models };



/**
 * A function to get a user from the mongo database
 * @param {*} email : the email address of the user
 * @returns the user document if found else null
 */

export default async function (email) {
  if (!email && !password) { return null; }
  return await Models.User.findOne({ email });
}
