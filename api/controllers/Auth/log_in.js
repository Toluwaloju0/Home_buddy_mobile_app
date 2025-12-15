import services from '../../services/index.js';
import utils from '../../utils/index.js';

const { UserService, PasswordService, TokenService } = services;

export default async function (request, response) {
  const { email, password, phoneNumber } = request.body;

  if (!email && !phoneNumber) {
      return response.status(500).json({ error: 'The necessary information are not provided for user login' });
    }

  if (!password) {
    return response.status(500).json({ error: 'Login failed due to incomplete request components' })
  }

  let identification;

  if (email) identification = { email };
  else if (phoneNumber) identification = { phoneNumber };

  try {
    const UserId = await UserService.getUserId(identification, password);

    return response.status(200).cookie('token', TokenService.createToken(UserId), utils.CookieOptions).json({ success: true, msg: 'The login operation is successful' });
  } catch (err) {
    return response.status(500).json({ error: err.message });
  }
}