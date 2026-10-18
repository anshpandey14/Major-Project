import { dbPromise } from "./db";

const STORES = ["patients", "visits", "vaccinations", "anc"];

const STORE_BY_OPERATION = {
  CREATE_PATIENT: "patients",
  CREATE_VISIT: "visits",
  CREATE_VACCINATION: "vaccinations",
  CREATE_ANC: "anc",
};

export const replaceLocalIdReferences = async (localId, mongoId, operation) => {
  if (!localId || !mongoId || localId === mongoId) return;

  const db = await dbPromise;
  const ownStore = STORE_BY_OPERATION[operation];

  for (const storeName of STORES) {
    const records = await db.getAll(storeName);

    for (const record of records) {
      let changed = false;
      const updatedRecord = { ...record };

      if (storeName === ownStore && record._id === localId) {
        updatedRecord._id = mongoId;
        updatedRecord.isSynced = true;
        changed = true;
      }

      // Local records use patientId; online API records may use a populated `patient`.
      if (record.patientId === localId) {
        updatedRecord.patientId = mongoId;
        changed = true;
      }
      if (record.patient === localId) {
        updatedRecord.patient = mongoId;
        changed = true;
      } else if (record.patient && typeof record.patient === "object" && String(record.patient._id) === localId) {
        updatedRecord.patient = { ...record.patient, _id: mongoId };
        changed = true;
      }

      if (changed) {
        if (record._id === localId && storeName === ownStore) {
          await db.delete(storeName, localId);
        }
        await db.put(storeName, updatedRecord);
      }
    }
  }
};
