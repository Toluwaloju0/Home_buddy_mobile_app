import { Schema, Types } from 'mongoose';

export default new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  { timestamps: true }
);