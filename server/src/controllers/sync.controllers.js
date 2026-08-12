import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { processSyncOperation } from "../services/sync/index.js";

export const syncOperations = asyncHandler(async (req, res) => {
  const { operations } = req.body;

  const sortedOperations = [...operations].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  const idMap = new Map();

  const success = [];
  const failed = [];

  for (const operation of sortedOperations) {
    try {
      const result = await processSyncOperation(operation, req.user, idMap);
      success.push(result);
    } catch (error) {
      failed.push({
        id: operation.id,
        operation: operation.operation,
        message: error.message,
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        synced: success.length,
        failed: failed.length,
        success,
        failedOperations: failed,
      },
      "Offline synchronization completed successfully",
    ),
  );
});
