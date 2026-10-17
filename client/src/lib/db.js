import { openDB } from "idb";

const DB_NAME = "asha-phc-db";
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("syncQueue")) {
      const store = db.createObjectStore("syncQueue", {
        keyPath: "id",
      });

      store.createIndex("timestamp", "timestamp");
      store.createIndex("status", "status");
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
