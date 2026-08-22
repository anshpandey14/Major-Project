import mongoose, { Schema } from "mongoose";

const ancSchema = new Schema(
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
    gestationalWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 42,
    },
    weight: {
      type: Number,
      min: 20,
      max: 200,
    },
    bloodPressure: {
      systolic: {
        type: Number,
        required: true,
      },
      diastolic: {
        type: Number,
        required: true,
      },
    },
    hemoglobin: {
      type: Number,
      min: 0,
      max: 25,
    },
    fetalHeartRate: {
      type: Number,
      min: 60,
      max: 220,
    },
    nextVisitDate: {
      type: Date,
    },
    isHighRisk: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

ancSchema.pre("save", function (next) {
  const systolic = this.bloodPressure?.systolic ?? 0;
  const diastolic = this.bloodPressure?.diastolic ?? 0;
  const hb = this.hemoglobin ?? Infinity;

  this.isHighRisk = systolic > 140 || diastolic > 90 || hb < 8;

  next();
});

export const ANC = mongoose.model("ANC", ancSchema);
