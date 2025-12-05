import Models from '../../repository/Models/index.js';

export default async function (userId, reqBody) {
  if (!userId) { return null; }

  // get the important details from the request body

  const user = Models.User.findByIdAndUpdate(userId, reqBody);

}