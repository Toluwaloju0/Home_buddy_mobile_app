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
  objectDict,
) {

  const user = new Models.User(objectDict)

  await user.save()

  return user._id;
}