import { addToken } from '../middleware/verifyToken.js';
import dbClient from '../utils/mongo_db.js';
import Password from '../utils/password_hash.js';
import services from '../services/index.js'
const { userService } = services

export default class AuthController {
  // a class to define all auth processes on the API such as register, login and logout

  static async register (req, res) {
    // the register a new user part

    const { email, username } = req.body;
    if (!email || !username ) {return res.status(405).json({
      "error": "The email and username must be provided when creating an account"
    })}

    const user = await userService.getUser(email);
    if (user) {
      return res.status(403).json({ "error": "User already exists" }).end();
    }
    const userId = await userService.addUser( 
      email,
      username
    );
    const token = addToken(JSON.stringify(userId));
    res.status(201).cookie("secure-token", token, {
     httpOnly: true,
     secure: true, // use only with HTTPS
     sameSite: "strict"
   }).send("User created sucessfully\n");
  }

  static async login(req, res) {
    // a method to log a new user in
    const { email, password } = req.body;
    if (!email || !password) {return res.status(412).json(
      {"error": "email and password must be provided for login"}).end();
    }

    const user = await dbClient.users.findOne({ email });
    if (!user) {return res.status(203).send("No user found with this email\n")}
    if (!Password.checker(password, user.password)) {
      return res.status(401).json({
        "error": "Password is incorrect"
      });
    }
    const token = addToken(JSON.stringify(user._id))
    res.status(202).cookie("secure-token", token, {
     httpOnly: true,
     secure: true, // use only with HTTPS
     sameSite: "strict"
   }).send(`User with email ${user.email} logged in successfully`);
  }

  static async logout(req, res) {
    // a function to log a user out
    res.clearCookie("secure-token").status(200).json({ message: "Logout Successful" });
  }
}
