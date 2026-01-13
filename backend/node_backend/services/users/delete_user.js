import Models from "../../repository/Models/index.js";

const { User } = Models;

export default async function (userId) {
  await User.findByIdAndDelete(userId);
}