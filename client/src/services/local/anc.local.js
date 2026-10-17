import { dbPromise } from "@/lib/db";

const STORE_NAME = "anc";

export const saveANCLocally = async (anc) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, anc);
  return anc;
};

export const getANCLocally = async (ancId) => {
  const db = await dbPromise;
  return db.get(STORE_NAME, ancId);
};

export const getANCsLocally = async (patientId) => {
  const db = await dbPromise;
  const records = await db.getAll(STORE_NAME);

  return records.filter((anc) => anc.patientId === patientId);
};

export const updateANCLocally = async (ancId, updates) => {
  const db = await dbPromise;
  const anc = await db.get(STORE_NAME, ancId);

  if (!anc) {
    return null;
  }

  const updatedANC = {
    ...anc,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_NAME, updatedANC);

  return updatedANC;
};

export const deleteANCLocally = async (ancId) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, ancId);
};
