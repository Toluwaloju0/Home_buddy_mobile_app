import utils from '../utils/index.js';
import services from '../services/index.js';
import mongoose from 'mongoose';

const { PublicRoutes } = utils;
const { TokenService } = services;
const { ObjectId } =  mongoose.Types;

export default async function (req, res, next) {
  if (PublicRoutes.includes(req.path)) return next();

  const { token } = req.cookies;
  if (!token) {
    return res.status(500).json({ error: 'The authentication token is not provided' });
  }
  try {
    let userId = TokenService.verifyToken(token);
    req.UserId = new ObjectId(userId);
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}