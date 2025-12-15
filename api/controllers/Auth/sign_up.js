import services from '../../services/index.js';
import utils from '../../utils/index.js';

const { UserService, TokenService, PasswordService, ValidationService } = services;
const { CookieOptions, checkEmail, checkPhoneNumber } = utils

/**
 * a function to create a register a new user if not already in the database
 * @param { } request : the request context containing the body of the request
 * @param {*} response : the response context
 */

export default async function (request, response) {  
  try {
    const { email, firstName, lastName, password, phoneNumber } = request.body;

    if (!email && !phoneNumber) {
      return response.status(500).json({ error: 'The necessary information are not provided for user creation' });
    }

    if (!firstName || !lastName || !password) {
      return response.status(500).json({ error: 'The necessary information are not provided for user creation' });
    }

    let identification;

    if (email) {
      try {
        checkEmail(email);
      } catch (err) {
        return response.status(500).json({
          error: err.message,
        });
      }
      identification = { email };
    }
    else if (phoneNumber) { identification = { phoneNumber }; }

    if (await UserService.getUserId(identification)) {
      return response.status(400).json({ error: "User already registered, login to use the application" });
    }

    if (email) { identification = { email, firstName, lastName, password: await PasswordService.hashPassword(password) }; }
    else if (phoneNumber) { identification = { phoneNumber, firstName, lastName, password: await PasswordService.hashPassword(password) }; }

    const userId = await UserService.addUser(identification);

    response.status(201).cookie('token', TokenService.createToken(userId), CookieOptions).json({
      msg: 'User created successfully',
      TokenExpiresIn: '5 min',
    });

    await ValidationService.userValidator(userId)
  } catch (err) {
    console.log(err)
    // return response.status(500).json({ error: err.message});
  }
}