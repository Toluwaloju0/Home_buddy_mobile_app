/** 
 * create a new user into the database
 * check if the user exists using the provided email or phonenumber and log the user into the API
 * get the user full name, and their account password for the user database document
 * save the password as a hash in the database
 * generate a JWT token for the user and send it to the user as a cookie
 * send a generated ONE TIME PASSWORD to the user as an email
 * or as a SMS if the email is not provided
 * 
 * if the OTP fails to send delete the user from the database and prompt for another registration to happen
 */

import services from '../../services/index.js';
import utils from '../../utils/index.js';
import GaxiosError from 'mailersend';

const { UserService, TokenService, RefreshService } = services;
const { CookieOptions, checkEmail } = utils

/**
 * a function to create a register a new user if not already in the database
 * @param { } request : the request context containing the body of the request
 * @param {*} response : the response context
 */

export default async function (request, response) {
  try {
    // get the user email and password from the request body  
    const { email, password } = request.body;

    if (!email && !password) {
      return response.status(500).json({ error: 'The necessary information are not provided for user creation' });
    }

      let result = await UserService.getUserId(email, password);
      let userId = result.userId;
      delete result.userId;

      if (result.status) {
        // if the result is true and the user is verified log the user in by returning a json response with the next action url to go to the select page
        return response.status(200)
        .cookie('token', TokenService.createToken(userId), CookieOptions)
        .cookie('refresh_token', await RefreshService.createRefreshToken(userId), CookieOptions)
        .json(result);
      }

      if (result.message === 'Not Verified') {
        // send OTP message to the user and redirect the user to the OTP page
        await services.ValidationService.userValidator(userId);
        return response
        .cookie('token', TokenService.createToken(userId), CookieOptions)
        .cookie('refresh_token', await RefreshService.createRefreshToken(userId), CookieOptions)
        .json(result);
      }

      if (result.message === 'Not Found') {
        // create the user and add to the database
        // check if the email passed is in a valid email address format
        checkEmail(email);

        result = await UserService.addUser(email, await services.PasswordService.hashPassword(password));
      }
      // send the OTP code for user validation

      userId = result.userId;
      delete result.userId;

      await services.ValidationService.userValidator(userId);

      response.status(201)
      .cookie('token', TokenService.createToken(userId), CookieOptions)
      .cookie('refresh_token', await RefreshService.createRefreshToken(userId), CookieOptions)
      .json(result);
  } catch (err) {
    // if the error is gotten from the send email function delete the user and reask for the user login details
    console.log(err);
  }
}
