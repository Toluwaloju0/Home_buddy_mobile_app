import { Schema } from "mongoose";

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: null,
    required: false,
  },
  Nationality: {
    type: String,
    enum: ['Nigeria', 'Ghana'],
    default: 'Nigeria',
  },
  city: {
    type: String,
    default: null,
  },
  Age: {
    type: Number,
    default: null,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non binary'],
    required: true,
  },
  isEmailAuthenticated: {
    type: Boolean,
    default: false,
  },
  isPhoneNumberAuthenticated: {
    type: Boolean,
    default: false,
  },
  isPasswordAuthenticated: {
    type: Boolean,
    default: false,
  },
  isSellerAuthenticated: {
    type: Boolean,
    default: false,
  },
  phoneNumber: String,
  userName: String,
});

export default UserSchema;