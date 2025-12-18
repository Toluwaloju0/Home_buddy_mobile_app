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
