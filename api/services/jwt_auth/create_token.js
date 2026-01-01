/**
 * create a jwt token using the provided user id from the database to signify a registered user
 * set token expiration to 5minuites if the token is an access token
 * set token expiration to 15 if the needed token is the refresh token
 */

import jwt from 'jsonwebtoken';

export default function (userId=null) {
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'secret';
  
  if (userId) {
    return jwt.sign({ userId }, JWT_SECRET_KEY, {
      algorithm: 'HS512', expiresIn: 300,
    });
  }
  return jwt.sign({}, JWT_SECRET_KEY, {
    algorithm: 'HS512', expiresIn: 15 * 60,
  })
}
