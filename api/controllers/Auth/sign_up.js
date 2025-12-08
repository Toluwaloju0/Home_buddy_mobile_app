import services from '../../services/index.js';
import utils from '../../utils/index.js';

const { UserService, TokenService, PasswordService } = services;
const { CookieOptions } = utils

/**
 * a function to create a register a new user if not already in the database
 * @param { } request : the request context containing the body of the request
 * @param {*} response : the response context
 */

export default async function (request, response) {  
  try {
    const { email, firstName, lastName, password } = request.body;

    if (!email || !firstName || !lastName || !password) {
      return response.status(500).json({ error: 'The necessary information are not provided for user creation' });
    }

    if (await UserService.getUserId(email)) {
      return response.status(400).json({ error: "Email already registered, login to use the application" });
    }

    const userId = await UserService.addUser(email, await PasswordService.hashPassword(password), firstName, lastName);

    return response.status(201).cookie('token', TokenService.createToken(userId), CookieOptions).json({
      msg: 'User created successfully',
      TokenExpiresIn: '5 min',
    });
  } catch (err) {
    return response.status(500).json({ error: err.message});
  }
}