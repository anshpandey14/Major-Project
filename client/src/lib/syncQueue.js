import { dbPromise } from "./db";
import { getAccessToken } from "@/api/axios";

export const getCurrentTokenUserId = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized))._id ?? null;
  } catch {
    return null;
  }
};

const generateId = () => {
  return `${Date.now()}-${crypto.randomUUID()}`;
};

export const addToSyncQueue = async ({ operation, payload }) => {
  const db = await dbPromise;

  const ownerId = getCurrentTokenUserId();
  if (!ownerId) {
    throw new Error("Cannot queue an offline operation without an authenticated user session");
  }

  const queueItem = {
    id: generateId(),
    ownerId,
    operation,
    timestamp: new Date().toISOString(),
    payload,
    status: "pending",
  };

  await db.put("syncQueue", queueItem);

  return queueItem;
};

export const getPendingSyncItems = async (ownerId = getCurrentTokenUserId()) => {
  if (!ownerId) return [];
  const db = await dbPromise;
  const items = await db.getAll("syncQueue");

  return items
    .filter((item) => item.status === "pending" && item.ownerId === ownerId)
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
