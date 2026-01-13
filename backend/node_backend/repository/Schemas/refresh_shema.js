import { Schema, Types } from "mongoose";

export default new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    refreshToken: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index
    },

    revoked: {
        type: Boolean,
        default: false
    },
  },
  { timestamps: true }
);
