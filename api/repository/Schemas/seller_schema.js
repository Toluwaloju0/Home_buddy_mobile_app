import { Types, Schema } from "mongoose";

const SellerSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    businessName: {
      type: String,
      unique: true,
    },
    documents: [{
      type: String
    }], // optional documents
  },
  { timestamps: true },
);


export default SellerSchema;
