import Models from "../../repository/Models/index.js";

const { Seller } = Models;

export default async function (UserId, businessName) {
  const seller = new Seller({
    user: UserId,
    businessName,
  });

  await seller.save()
  return seller._id;
}