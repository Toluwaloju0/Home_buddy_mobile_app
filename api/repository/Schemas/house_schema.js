import { Schema, Types } from 'mongoose';

export default new Schema(
  {
    sellerId: {
      type: Types.ObjectId,
      required: true,
    },
    houseType: {
      type: String,
      enum: ['Bungalow', 'Self-con', 'Land Space', 'Duplex'],
      required: true,
    },
    imageLocation: Array,
    About: String,
    yearBuilt: Number,
    furnishing: Boolean,
    paymentPlan: String,
    ServiceCharge: Number,
    PropertyType: String,
    Listed: Number,
    Amenities: Array,
    Features: Array,
    Description: String,
    NumberOfBedrooms: Number,
    NumberOfBathrooms: Number,
    Size: Number,
    SellingPrice: Number,
    isNegotiable: Boolean,
    Location: String,
    fullAddress: String,
    OwnerName: String,
    OwnerNumber: String,
  },
  { timestamps: true, }
);
