/**
 * this endpoint is used to update the user information in the database
 * if an email or phone number is passed a otp verification is sent to the changed value for verification
 * for password change the hash is stored in the database
 * 
 * if an error is encountered a retry is processed
 */

import services from '../../services/index.js';

const { PasswordService, UserService } = services;

export default async function (req, res) {
  const updateValues = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (key === 'email') {
      updateValues[key] = value;
      updateValues.isEmailAuthenticated = false;
    } else if (key === 'password') {
      updateValues[key] = await PasswordService.hashPassword(value);
    } else {
      updateValues[key] = value;
    }
  }

  try {
    await UserService.UpdateUser(req.UserId, updateValues)
    const user = await UserService.getUser(req.UserId);

    return res.status(200).json({ status: 'success', message: 'The user information has been updated accordingly', user: user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}