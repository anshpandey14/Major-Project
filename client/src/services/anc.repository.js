import api from "@/api/axios";
import {
  saveANCLocally,
  getANCLocally,
  getANCsLocally,
  updateANCLocally,
} from "./local/anc.local";
import { addToSyncQueue } from "@/lib/syncQueue";
import { createLocalId } from "@/lib/localId";
import { SyncOperationEnum } from "@/utils/constants";

export const getANCs = async (patientId, params = {}) => {
  if (!navigator.onLine) {
    const anc = await getANCsLocally(patientId);

    return {
      anc,
      pagination: {
        page: 1,
        limit: anc.length,
        totalANC: anc.length,
        totalPages: 1,
      },
      offline: true,
    };
  }

  const response = await api.get(`/anc/${patientId}`, { params });

  const data = response.data?.data || response.data;
  const anc = data?.ancRecords || data?.anc || [];

  for (const record of anc) {
    const patientIdValue = typeof record.patient === "object" ? record.patient?._id : record.patient;
    await saveANCLocally({ ...record, patientId: record.patientId ?? patientIdValue, isSynced: true });
  }

  return { ...data, offline: false };
};


export const getANC = async (patientId, ancId) => {
  if (!navigator.onLine) {
    const anc = await getANCLocally(ancId);
    if (!anc || String(anc.patientId) !== String(patientId)) throw new Error("ANC record not found locally");
    return { anc, offline: true };
  }
  const response = await api.get(`/anc/${patientId}/${ancId}`);
  const data = response.data?.data ?? response.data;
  const anc = data.anc ?? data;
  if (anc?._id) {
    const patientRef = typeof anc.patient === "object" ? anc.patient?._id : anc.patient;
    await saveANCLocally({ ...anc, patientId: anc.patientId ?? patientRef ?? patientId, isSynced: true });
  }
  return { anc, offline: false };
};

export const createANC = async (patientId, ancData) => {
  if (!navigator.onLine) {
    const localId = createLocalId("anc");
    const anc = {
      _id: localId,
      localId,
      patientId,
      ...ancData,
      isHighRisk:
        Number(ancData.bloodPressure?.systolic ?? 0) > 140 ||
        Number(ancData.bloodPressure?.diastolic ?? 0) > 90 ||
        Number(ancData.hemoglobin ?? 0) < 8,
      isSynced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveANCLocally(anc);

    await addToSyncQueue({
      operation: SyncOperationEnum.CREATE_ANC,
      payload: {
        localId,
        patientId,
        visitDate: ancData.visitDate,
        gestationalWeek: ancData.gestationalWeek,
        weight: ancData.weight,
        bloodPressure: ancData.bloodPressure,
        hemoglobin: ancData.hemoglobin,
        fetalHeartRate: ancData.fetalHeartRate,
        nextVisitDate: ancData.nextVisitDate,
        notes: ancData.notes,
      },
    });

    return { anc, offline: true };
  }

  const response = await api.post(`/anc/${patientId}`, ancData);

  const data = response.data?.data || response.data;
  const anc = data.anc ?? data;
  if (anc?._id) {
    const patientRef = typeof anc.patient === "object" ? anc.patient?._id : anc.patient;
    await saveANCLocally({ ...anc, patientId: anc.patientId ?? patientRef ?? patientId, isSynced: true });
  }

  return { anc, offline: false };
};

export const updateANC = async (patientId, ancId, updates) => {
  if (!navigator.onLine) {
    const anc = await updateANCLocally(ancId, updates);

    if (!anc) {
      throw new Error("ANC record not found locally");
    }

    anc.isHighRisk =
      Number(anc.bloodPressure?.systolic ?? 0) > 140 ||
      Number(anc.bloodPressure?.diastolic ?? 0) > 90 ||
      Number(anc.hemoglobin ?? 0) < 8;
    await saveANCLocally(anc);

    await addToSyncQueue({
      operation: SyncOperationEnum.UPDATE_ANC,
      payload: { ancId, patientId, ...updates },
    });

    return { anc, offline: true };
  }

  const response = await api.put(`/anc/${patientId}/${ancId}`, updates);

  const data = response.data?.data || response.data;

  const anc = data.anc ?? data;
  if (anc?._id) {
    const patientRef = typeof anc.patient === "object" ? anc.patient?._id : anc.patient;
    await saveANCLocally({ ...anc, patientId: anc.patientId ?? patientRef ?? patientId, isSynced: true });
  }

  return { anc, offline: false };
};
