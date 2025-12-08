import services from "../../services/index.js";
import utils from '../../utils/index.js';

const { CookieOptions } = utils;
const { SellerService, TokenService } = services;

export default async function (req, res) {
    try {
      const sellerStatus = await SellerService.SellerStatus(req.UserId);

      return res.status(200).cookie('token', TokenService.createToken(req.UserId), CookieOptions).json(sellerStatus);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

}