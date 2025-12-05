import { Types, Schema } from "mongoose";

const SellerSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
  },
  isSellerAuthenticated: {
    type: Boolean,
    default: false,
  },
  sellerLevel: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
  },
  numberOfHouses: Number,
});

export default SellerSchema;
