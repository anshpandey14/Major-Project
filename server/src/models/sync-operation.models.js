import mongoose from "mongoose";

const syncOperationsSchema = new mongoose.Schema(
  {
    operationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    operation: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

export const SyncOperation = mongoose.model(
  "SyncOperation",
  syncOperationsSchema,
);

syncOperationSchema.index({ operationId: 1, user: 1 }, { unique: true });
