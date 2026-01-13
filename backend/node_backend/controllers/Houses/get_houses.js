/** 
 * get houses from the database
 * paginate the houses gotten from the database for the user
 * apply the given filters before sending to the frontend
 */

import services from '../../services/index.js';

export default async function (req, res) {
  const seller_id = req.params.seller_id; // the seller id found in the req context

  const houseList = await services.HouseService.getHouses(seller_id);
  // get all the houses of the seller and return them to the user

  return res.json(houseList);
}