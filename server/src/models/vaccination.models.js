import mongoose, { Schema } from "mongoose";
import {
  AvailableVaccinationStatus,
  AvailableVaccines,
  VaccinationStatusEnum,
} from "../utils/constants.js";

const vaccinationSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    administeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vaccine: {
      type: String,
      enum: AvailableVaccines,
    },
    customVaccine: {
      type: String,
      trim: true,
      default: "",
      maxLength: 100,
    },
    doseNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    vaccinationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: AvailableVaccinationStatus,
      default: VaccinationStatusEnum.COMPLETED,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxLength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Either predefined vaccine or custom vaccine
vaccinationSchema.pre("validate", function (next) {
  const hasVaccine = Boolean(this.vaccine);
  const hasCustomVaccine = Boolean(this.customVaccine?.trim());

  if (!hasVaccine && !hasCustomVaccine) {
    return next(new Error("Either vaccine or customVaccine is required"));
  }

  if (hasVaccine && hasCustomVaccine) {
    return next(new Error("Provide either vaccine or customVaccine, not both"));
  }

  next();
});

// Indexes
vaccinationSchema.index({
  patient: 1,
  vaccine: 1,
  doseNumber: 1,
  isActive: 1,
});

vaccinationSchema.index({
  patient: 1,
  vaccinationDate: -1,
});

vaccinationSchema.index({
  patient: 1,
  status: 1,
});

export const Vaccination = mongoose.model("Vaccination", vaccinationSchema);
