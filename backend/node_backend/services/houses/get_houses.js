/**
 * get the houses in the database
 * get the required house by the user using the applied filter
 * paginate the result and return it to the user using the database query skip and limit functions
 * return the list of houses mathcing the given criteria 
 */

import Models from '../../repository/Models/index.js';

export default async function (sellerId, limit=10, offset=1) {
  let housesList
  if (!sellerId) {
    // get all the houses from the database
    housesList = await Models.HouseModel.find({}).skip(offset).limit(limit);
   } else {
     // get the house from the database for this seller
     housesList = await Models.HouseModel.find({sellerId}).skip(offset).limit(limit)
   }

  return housesList;
}