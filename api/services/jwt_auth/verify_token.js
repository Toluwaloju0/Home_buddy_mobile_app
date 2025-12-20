/**
 * verify the token passed if it is still valid or invalid
 * 
 * return the user id in the payload if it exists else none
 */

import jwt from 'jsonwebtoken';

export default function (token) {
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'secret';

  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY, { algorithms: 'HS512', });
    return payload?.userId;
  } catch (err) {
    console.log(err);
    return { error: `An error occured ${err}` };
  }
}