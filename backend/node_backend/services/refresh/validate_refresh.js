import Models from "../../repository/Models/index.js";

export default async function (refreshToken) {
  const refresh = await Models.RefreshTokenModel.findOne({ refreshToken });

  if (!refresh) { throw new Error('The token has not been registered'); }

  const { userId } = refresh;
  await refresh.deleteOne();
  return userId;
}
