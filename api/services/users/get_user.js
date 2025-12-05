import Models from '../../repository/Models/index.js';
const User = { Models };



/**
 * A function to get a user from the mongo database
 * @param {*} email : the email address of the user
 * @param {*} password: the hashed password of the current user
 * @returns the user document if found else null
 */

export default async function (email) {
  if (!email && !password) { return null; }
  const user = await Models.User.findOne({ email });

  if (user) return user;
  throw new Error('The User cant be found');
}
