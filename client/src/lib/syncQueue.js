import { dbPromise } from "./db";

const generateId = () => {
  return `${Date.now()}-${crypto.randomUUID()}`;
};

export const addToSyncQueue = async ({ operation, payload }) => {
  const db = await dbPromise;

  const queueItem = {
    id: generateId(),
    operation,
    timestamp: new Date().toISOString(),
    payload,
    status: "pending",
  };

  await db.put("syncQueue", queueItem);

  return queueItem;
};

export const getPendingSyncItems = async () => {
  const db = await dbPromise;
  const items = await db.getAll("syncQueue");

  return items
    .filter((item) => item.status === "pending")
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

export const updateSyncItem = async (id, updates) => {
  const db = await dbPromise;
  const item = await db.get("syncQueue", id);

  if (!item) return;

  await db.put("syncQueue", {
    ...item,
    ...updates,
  });
};

export const removeSyncItem = async (id) => {
  const db = await dbPromise;
  await db.delete("syncQueue", id);
};

export const getSyncQueueCount = async () => {
  const items = await getPendingSyncItems();
  return items.length;
};
