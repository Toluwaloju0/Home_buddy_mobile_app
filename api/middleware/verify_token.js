/**
 * the middleware to verify if a user is in the database and is registered
 * 
 * remove some routes from the middle ware check
 * use the cookie access token to get the user id
 * pass the gotten id to the request context and use it for all authenticated routes
 * 
 * if any error occurs retry the verification and parse it again
 * 
 */
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
    return res.status(500).json({ error: 'The authentication token is not provided, Log in to get a authentication code' });
  }
  try {
    let userId = TokenService.verifyToken(token);
    req.UserId = new ObjectId(userId);
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
