import { syncPendingOperations } from "./sync.service";

let isSyncing = false;

export const syncNow = async () => {
  if (isSyncing) return;

  if (!navigator.onLine) {
    return;
  }

  isSyncing = true;

  try {
    const result = await syncPendingOperations();

    if (result.synced > 0) {
      console.log(
        `Offline sync completed: ${result.synced} operation(s) synced`,
      );
    }

    if (result.failed > 0) {
      console.warn(`Offline sync: ${result.failed} operation(s) failed`);
    }

    return result;
  } catch (err) {
    console.error("Offline sync error:", err);
  } finally {
    isSyncing = false;
  }
};

export const startSyncManager = () => {
  const handleOnline = () => {
    console.log("Internet connection restored. Starting sync...");
    syncNow();
  };

  window.addEventListener("online", handleOnline);

  if (navigator.onLine) {
    syncNow();
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
};
