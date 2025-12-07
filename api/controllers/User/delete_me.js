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