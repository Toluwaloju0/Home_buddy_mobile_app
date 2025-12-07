import Models from '../../repository/Models/index.js';
import services from '../../services/index.js';

const { User } = Models;


/**
 * A function to get a user from the mongo database using the user id
 * @param {*} UserId : the id of the user
 * @returns the user document if found else null
 */

export default async function (UserId) {
  const user = await User.findById(UserId);

  if (user) {
    return { firstName: user.firstName, lastName: user.lastName, email: user.email };
  }
  throw new Error('The User cant be found');
}
