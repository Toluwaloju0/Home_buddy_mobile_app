import Models from '../../repository/Models/index.js';

/**
 * A function to add a new user to the mongo database
 * 
 * @param {string} email 
 * @param {string} userName 
 * @param {string} firstName 
 * @param {string} lastName 
 */
export default async function (
  email,
  password,
  firstName,
  lastName
) {

  const user = new Models.User({
    email,
    password,
    firstName,
    lastName,
  })

  await user.save()

  return user._id;
}