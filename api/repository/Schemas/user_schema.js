import { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { 
      type: String, 
      default: '',
    },
    lastName: { 
      type: String,
      default: '',
     },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      default: null,
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
    role: {
      type: String,
      enum: ['user', 'seller'],
      default: 'user',
    },
    googleId: {
      type: String,
      allowNull: true, // This field will only be populated for OAuth users
    },
  },
  { timestamps: true }
);

export default UserSchema;