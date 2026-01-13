import bcrypt from 'bcrypt';
import validatePassword from './validate_password.js';

export default async function (password) {
  if (!validatePassword(password)) throw new Error('the password is not strong enough');

  const hashedPassword = await bcrypt.hash(password, 2);
  return hashedPassword;
}