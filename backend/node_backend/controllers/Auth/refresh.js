/**
 * use refresh token for authentication refresh to provide a new login refresh
 * create a new refresh token to the user cookie and a new access token for the user
 * get any error and return it to the user for token refresh retry
 */
import utils from '../../utils/index.js';
import services from "../../services/index.js";

export default async function (req, res) {
  const { refresh_token } = req.cookies;

  try {
    const userId = await services.RefreshService.validateRefreshToken(refresh_token);

    return res.status(200)
    .cookie('token', services.TokenService.createToken(userId), utils.CookieOptions)
    .cookie('refresh_token', await services.RefreshService.createRefreshToken(userId), utils.CookieOptions)
    .json({ success: true, msg: 'Your login refreshed successfully' });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
