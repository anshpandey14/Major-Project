import { dbPromise } from "@/lib/db";

const STORE_NAME = "visits";

export const saveVisitLocally = async (visit) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, visit);
  return visit;
};

export const getVisitsLocally = async (patientId) => {
  const db = await dbPromise;

  const visits = await db.getAll(STORE_NAME);

  return visits.filter((visit) => visit.patientId === patientId);
};

export const updateVisitLocally = async (visitId, updates) => {
  const db = await dbPromise;
  const visit = await db.get(STORE_NAME, visitId);

  if (!visit) {
    return null;
  }

  const updatedVisit = {
    ...visit,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_NAME, updatedVisit);
  return updatedVisit;
};

export const deleteVisitLocally = async (visitId) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, visitId);
};
