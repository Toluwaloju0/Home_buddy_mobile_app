import { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export default UserSchema;