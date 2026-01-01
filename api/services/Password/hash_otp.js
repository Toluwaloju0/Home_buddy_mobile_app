import bcrypt from 'bcrypt';

export default async function (otp_string) {
  return await bcrypt.hash(otp_string, 2);
}