import { model } from "mongoose";
import Schemas from "../Schemas/index.js";

const Seller = model('sellers', Schemas.SellerSchema); 

export default Seller;