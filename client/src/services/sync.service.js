import api from "@/api/axios";
import {
  getPendingSyncItems,
  removeSyncItem,
  updateSyncItem,
} from "@/lib/syncQueue";
import { replaceLocalIdReferences } from "@/lib/idMapping";

export const syncPendingOperations = async () => {
  const operations = await getPendingSyncItems();

  if (operations.length === 0) {
    return {
      synced: 0,
      failed: 0,
      success: [],
      failedOperations: [],
    };
  }

  try {
    const response = await api.post("/sync", {
      operations,
    });

    const result = response?.data?.data || response?.data;
    const success = result?.success || [];
    const failedOperations = result?.failedOperations || [];

    for (const successful of success) {
      const queuedOperation = operations.find(
        (operation) => operation.id === successful.id,
      );

      if (!queuedOperation) continue;

      const localId = queuedOperation.payload?.localId;
      const mongoId = successful.mongoId;

      if (localId && mongoId) {
        await replaceLocalIdReferences(localId, mongoId);
      }

      await removeSyncItem(successful.id);
    }

    for (const failed of failedOperations) {
      await updateSyncItem(failed.id, {
        status: "pending",
        lastError: failed.message,
        lastAttemptAt: new Date().toISOString(),
      });
    }

    return {
      synced: success.length,
      failed: failedOperations.length,
      success,
      failedOperations,
    };
  } catch (err) {
    console.error("Sync failed:", err);
    return {
      synced: 0,
      failed: operations.length,
      success: [],
      failedOperations: operations.map((operation) => ({
        id: operation.id,
        operation: operation,
        message:
          err?.response?.data?.message || err?.message || "Network error",
      })),
    };
  }
};
