import mongoose from "mongoose";

const flatDetailsSchema = new mongoose.Schema({
  flat_no: {
    type: String,
    required: true,
    unique: true,
  },
  owner_name: {
    type: String,
    required: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
  number_of_occupants: {
    type: Number,
    required: true,
  },
  parking_slot: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const FlatDetails = mongoose.model("FlatDetails", flatDetailsSchema, "flatDetails");
