import Models from "../../repository/Models/index.js";

const { Seller } = Models;

export default async function (UserId) {
  const seller = await Seller.find({ user: UserId });

  const { businessName, status } = seller[0];

  return { businessName, status };
}
