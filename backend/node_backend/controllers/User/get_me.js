/**
 * this endpoint returns the user information as stored in our database
 * 
 * the get user function in the user service is used to get the user information and return it to the clients
 * 
 */

import services from '../../services/index.js';

const { UserService } = services;


export default async function (req, res) {
  const { UserId } = req;

  const user = await UserService.getUser(UserId);

  return res.status(200).json(user);
}