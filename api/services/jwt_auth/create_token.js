import jwt from 'jsonwebtoken';

export default function (userId) {
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'secret';

  return jwt.sign({ userId }, JWT_SECRET_KEY, {
    algorithm: 'HS512', expiresIn: 300,
  });
}
