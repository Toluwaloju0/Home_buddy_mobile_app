import Models from '../../repository/Models/index.js';
import services from '../../services/index.js';
import utils from '../../utils/index.js';

const { User } = Models;
const { TokenService, UserService } = services;


export default async function (req, res) {
  const { UserId } = req;

  const user = await UserService.getUser(UserId);

  return res.status(200).cookie('token', TokenService.createToken(UserId), utils.CookieOptions).json(user);
}