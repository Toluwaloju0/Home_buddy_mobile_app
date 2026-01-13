import { Types, Schema } from "mongoose";

const SellerSchema = new Schema(
  {
    fullName: { type: String, required: true },

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
    dateOfBirth: Date,
    Gender: {
      type: String,
      enum: ["Male", "Female", "Not Listed"],
      default: "Not Listed",
    },
    Address: String,
    Description: String,
    BusinessAddress: String,
    YearsOfExperience: Number,
    CompanyName: String,
    CACRegistrationNumber: String,
    CompanyWebsite: String,
    CACCertificateUrl: String,
    ProofOfAddress: String,
    BankName: String,
    BankNumber: String,
    BankAcctName: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


export default SellerSchema;
