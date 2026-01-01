import JWTService from '../jwt_auth/index.js';
import Models from '../../repository/Models/index.js';

export default async function (userId) {
  const refreshToken = JWTService.createToken();

  const refresh = new Models.RefreshTokenModel({userId, refreshToken, expiresAt: new Date(Date.now() + 30 * 60 * 1000)});

  await refresh.save();
  return refreshToken;
}
