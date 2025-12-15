import services from '../../services/index.js';
import utils from '../../utils/index.js';

const { SellerService, TokenService } = services;
const { CookieOptions } = utils;

export default async function (req, res) {
  const { businessName } = req.body;
  const { UserId } = req;
  
  if (!businessName) {
    return res.status(500).json({ err: 'The business name is not provided for applying for a seler position' });
  }

  try {
    await SellerService.ApplySeller(UserId, businessName);
    return res.status(200).json({
      status: 'success',
      msg: 'Seller has been added awaiting verification from admins',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}