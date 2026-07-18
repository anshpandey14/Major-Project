import mongoosee, { Schema } from "mongoose";
import { AvailableVisitSymptoms } from "../utils/constants.js";

const visitSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    conductedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    visitDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    weight: {
      type: Number,
      min: 0,
      max: 300,
    },
    symptoms: [
      {
        type: string,
        enum: AvailableVisitSymptoms,
      },
    ],
    additionalSymptoms: {
      type: String,
      trim: true,
      maxLength: 500,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

visitSchema.index({ patient: 1, visitDate: -1 });
visitSchema.index({ conductedBy: 1, visitDate: -1 });

export const Visit = mongoose.model("Visit", visitSchema);
