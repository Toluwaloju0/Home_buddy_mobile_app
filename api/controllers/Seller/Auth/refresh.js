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
