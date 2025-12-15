import { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default UserSchema;