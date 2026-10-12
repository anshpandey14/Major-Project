import { dbPromise } from "./db";

const STORES = ["patients", "visits", "vaccinations", "anc"];

export const replaceLocalIdReferences = async (localId, mongoId) => {
  const db = await dbPromise;
  for (const storeName of STORES) {
    const records = await db.getAll(storeName);

    for (const record of records) {
      let changed = false;
      const updatedRecord = { ...record };

      if (record._id === localId) {
        updatedRecord._id = mongoId;
        updatedRecord.isSynced = true;
        changed = true;
      }

      if (record.patientId === localId) {
        updatedRecord.patientId = mongoId;
        changed = true;
      }

      if (changed) {
        await db.put(storeName, updatedRecord);
      }
    }
  }
};
