import dbClient from '../utils/mongo_db.js';
import Password from '../utils/password_hash.js';

export default class UserController {
  // a class to define all users processes on the API such as
  // creating, updating, deleting a user

  static async getme (req, res) {
    // A method to get a users information without the id of the user

    const userInfo = {}
    for (const userAttribute in req.user) {
      if (userAttribute == "_id") {continue}
      userInfo[userAttribute] = req.user[userAttribute];
    }
    return res.status(200).cookie("secure-token", req.cookies.token, {
     httpOnly: true,
     secure: true,
     sameSite: "strict"
   }).json(userInfo);
  }

  static async updateMe(req, res) {
    // A method to update the info of a user
    
    const valuesDict = {};

    for (const value in req.body) {
      if (value == "email") {
        if (await dbClient.users.findOne({ "email": req.body[value] })) {
          return res.status(200).send("This email already exists so provide another to change your email\n");
        }
      }
      if (value == "password") {
        valuesDict[value] = await Password.hasher(req.body[value]);
        continue;
      }
      valuesDict[value] = req.body[value];
    }

    // update the information of the user accordingly in the database
    await dbClient.users.updateOne({_id: req.user._id}, {$set: valuesDict});
    return res.status(201).cookie("secure-token", req.cookies.token, {
     httpOnly: true,
     secure: true,
     sameSite: "strict"
   }).send("User updated successfully\n");
  }

  static async deleteMe(req, res) {
    // a function to delete a user based on his token authentication

    await dbClient.users.deleteOne(req.users);
    return res.send("User deleted successfully\n");
  }
}
