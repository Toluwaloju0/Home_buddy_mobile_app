/**
 * We need images of your credentials showing things such as your NIN, Voters card, or Driver license to become a approved seller
 * Send an email to the admin group notification center to check the provided credentials and approve the seller this should be done in apply seller function
 */


import services from '../../services/index.js';
import utils from '../../utils/index.js';

const { SellerService, TokenService } = services;
const { CookieOptions } = utils;

export default async function (req, res) {
  const { businessName } = req.body;
  const { UserId } = req;
  
  if (!businessName) {
    return res.status(500).json({ err: 'The business name is not provided for applying for a seller position' });
  }

  try {
    await SellerService.ApplySeller(UserId, businessName);
    return res.status(200).json({
      status: 'Application successful',
      msg: 'Seller has been added awaiting verification from admins',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


