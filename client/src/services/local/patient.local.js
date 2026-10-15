import { dbPromise } from "@/lib/db";

const STORE_NAME = "patients";

export const savePatientLocally = async (patient) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, patient);

  return patient;
};

export const getPatientLocally = async (patientId) => {
  const db = await dbPromise;
  return db.get(STORE_NAME, patientId);
};

export const getAllPatientsLocally = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const updatePatientLocally = async (patientId, updates) => {
  const db = await dbPromise;
  const patient = await db.get(STORE_NAME, patientId);
  if (!patient) {
    return null;
  }

  const updatedPatient = {
    ...patient,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_NAME, updatedPatient);

  return updatedPatient;
};

export const deletePatientLocally = async (patientId) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, patientId);
};

export const replacePatientLocalId = async (localId, mongoId) => {
  const db = await dbPromise;
  const patient = await db.get(STORE_NAME, localId);

  if (!patient) {
    return null;
  }

  const updatedPatient = {
    ...patient,
    _id: mongoId,
    isSynced: true,
  };

  await db.delete(STORE_NAME, localId);
  await db.put(STORE_NAME, updatedPatient);

  return updatedPatient;
};
