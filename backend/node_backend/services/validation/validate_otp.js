import Models from '../../repository/Models/index.js';
import PassowordServices from '../Password/index.js';
import UserService from '../users/index.js'

const { Validation } = Models;

export default async function (userId, otpCode) {
  const validationObject = await Validation.findOne({ userId });

  if (!validationObject) { throw new Error('The validation otp cannot be found'); }

  await PassowordServices.verifyPassword(otpCode, validationObject.otpHash);
  await UserService.UpdateUser(userId, { isEmailVerified: true })
}