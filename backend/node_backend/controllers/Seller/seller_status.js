/**
 * get a seller status from the database along with other necessary information for our sellers
 * to know their approval status and the reason behind its failure or approval
 * 
 * neccesary informations include: [Seller Name, reason behind seller cancel or approval]
 * the neccesary info are provided by the seller status function in the seller services object
 * 
 * if error occurs prompt the user to retry the service
 */

import services from "../../services/index.js";
import utils from '../../utils/index.js';

const { CookieOptions } = utils;
const { SellerService, TokenService } = services;

export default async function (req, res) {
    try {
      const sellerStatus = await SellerService.SellerStatus(req.UserId);

      return res.status(200).json(sellerStatus);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

}