/** 
 * delete a user from the database
 * 
 * this endpoint do not need admin approval for now 
 * 
 * admin approval applies to sellers only for now
 */
import services from "../../services/index.js";

const { UserService } = services;

export default async function (req, res) {
  const { UserId } = req;

  try {
    await UserService.DeleteMe(UserId);
    return res.status(201).clearCookie('token').json({ status: 'success', msg: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}