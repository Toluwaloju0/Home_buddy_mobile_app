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

// send an email to the admin notification group to notify the admin of a new seller