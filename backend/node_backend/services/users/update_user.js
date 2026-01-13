import Models from '../../repository/Models/index.js';

const { User } = Models;

export default async function (userId, values={}) {
  try {
    const user = await User.findByIdAndUpdate(userId, {$set: values});
  } catch (err) {
    throw err;
  }
}
