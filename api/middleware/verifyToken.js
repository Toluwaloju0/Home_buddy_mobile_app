import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import dbClient from "../utils/mongo_db.js";

dotenv.config()

export const addToken = (id) => {
  // to add a jwt token
   const secret = process.env.JWT_SECRET_KEY;

   const token = jwt.sign({ id }, secret);
   return token;
}

export const verifyToken = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Token must be provided for authentication" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not Valid!" });
    const { id } = payload;
    const user = await dbClient.users.findOne({ "_id": new ObjectId(id.replaceAll('"', "")) });
    if (user) {
      req.user = user;
      next();
    }
    else {return res.status(403).json({
      "error": "No user found for this token"
    })}
  });
}
