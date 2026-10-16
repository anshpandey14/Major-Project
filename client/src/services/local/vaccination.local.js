import { dbPromise } from "@/lib/db";
const STORE_NAME = "vaccinations";

export const saveVaccinationLocally = async (vaccination) => {
  const db = await dbPromise;

  await db.put(STORE_NAME, vaccination);
  return vaccination;
};

export const getVaccinationsLocally = async (patientId) => {
  const db = await dbPromise;
  const vaccinations = await db.getAll(STORE_NAME);
  return vaccinations.filter(
    (vaccination) => vaccination.patientId === patientId,
  );
};

export const getVaccinationLocally = async (vaccinationId) => {
  const db = await dbPromise;
  return db.get(STORE_NAME, vaccinationId);
};

export const updateVaccinationLocally = async (vaccinationId, updates) => {
  const db = await dbPromise;
  const vaccination = await db.get(STORE_NAME, vaccinationId);

  if (!vaccination) return null;
  const updatedVaccination = {
    ...vaccination,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_NAME, updatedVaccination);

  return updatedVaccination;
};

export const deleteVaccinationLocally = async (vaccinationId) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, vaccinationId);
};
