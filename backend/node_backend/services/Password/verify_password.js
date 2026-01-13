import bcrypt from 'bcrypt';

export default async function (password, hashedPassword) {
  const value = await bcrypt.compare(password, hashedPassword);
  if (value === false) throw new Error('The passwords do not match');
}