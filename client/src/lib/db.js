import { openDB } from "idb";

const DB_NAME = "asha-phc-db";
const DB_VERSION = 2;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, tx) {
    if (!db.objectStoreNames.contains("syncQueue")) {
      const store = db.createObjectStore("syncQueue", { keyPath: "id" });
      store.createIndex("timestamp", "timestamp");
      store.createIndex("status", "status");
    }
    // Migrate the previous capitalized store name without dropping queued operations.
    if (db.objectStoreNames.contains("SyncQueue") && db.objectStoreNames.contains("syncQueue")) {
      
      const oldStore = tx.objectStore("SyncQueue");
      const newStore = tx.objectStore("syncQueue");
      oldStore.getAll().onsuccess = (event) => {
        for (const item of event.target.result || []) newStore.put(item);
        db.deleteObjectStore("SyncQueue");
      };
    }

    if (!db.objectStoreNames.contains("patients")) {
      db.createObjectStore("patients", {
        keyPath: "_id",
      });
    }

    if (!db.objectStoreNames.contains("visits")) {
      db.createObjectStore("visits", {
        keyPath: "_id",
      });
    }
    if (!db.objectStoreNames.contains("vaccinations")) {
      db.createObjectStore("vaccinations", {
        keyPath: "_id",
      });
    }
    if (!db.objectStoreNames.contains("anc")) {
      db.createObjectStore("anc", {
        keyPath: "_id",
      });
    }
  },
});
