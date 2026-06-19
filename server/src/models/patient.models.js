import mongoose, { Schema } from "mongoose";
import {
  AvailablePatientGender,
  AvailableBloodGroups,
} from "../utils/constants.js";

const patientSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    village: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: AvailablePatientGender,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    bloodGroup: {
      type: String,
      enum: AvailableBloodGroups,
      default: "Unknown",
    },
    isPregnant: {
      type: Boolean,
      default: false,
    },
    lmpDate: {
      type: Date,
    },
    assignedASHA: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Patient = mongoose.model("Patient", patientSchema);
