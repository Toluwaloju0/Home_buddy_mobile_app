import Models from '../../repository/Models/index.js';
import Password from '../../utils/password_hash.js';

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
  userName,
  otherObjects={},
) {

  const user = new Models.User({
    email,
    userName,
    // firstName,
    // lastName,
    // Nationality,
    // gender,
    // age,
    // city,
  })

  console.log(user);
  await user.save()

  return user._id;
}