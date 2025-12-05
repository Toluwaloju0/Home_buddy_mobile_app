import services from '../../services/index.js';

const { UserService, PasswordService, TokenService } = services;

export default async function (request, response) {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(500).json({ error: 'Login failed due to incomplete request components' })
  }
  try {
    const User = await UserService.getUser(email);
    await PasswordService.verifyPassword(password, User.password);

    return response.status(200).cookie('token', TokenService.createToken(User._id), {
      httpOnly: true, secure: true, sameSite: "strict", maxAge: 5 * 60 * 1000,
    }).json({ success: true, msg: 'The login operation is successful' });
  } catch (err) {
    return response.status(500).json({ error: err.message });
  }
}