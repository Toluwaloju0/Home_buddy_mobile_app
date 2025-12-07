import services from '../../services/index.js';
import utils from '../../utils/index.js';

const { UserService, PasswordService, TokenService } = services;

export default async function (request, response) {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(500).json({ error: 'Login failed due to incomplete request components' })
  }
  try {
    const UserId = await UserService.getUserId(email, password);

    return response.status(200).cookie('token', TokenService.createToken(UserId), utils.CookieOptions).json({ success: true, msg: 'The login operation is successful' });
  } catch (err) {
    return response.status(500).json({ error: err.message });
  }
}