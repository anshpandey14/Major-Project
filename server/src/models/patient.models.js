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
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    village: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
      deafult: null,
    },
    assignedASHA: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Prevent LMP date for non-pregnant patients
patientSchema.pre("save", function (next) {
  if (!this.isPregnant) {
    this.lmpDate = null;
  }

  next();
});

export const Patient = mongoose.model("Patient", patientSchema);
