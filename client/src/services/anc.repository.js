import api from "@/api/axios";
import {
  saveANCLocally,
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
  const anc = data?.anc || [];

  for (const record of anc) {
    await saveANCLocally({
      ...record,
      isSynced: true,
    });
  }

  return { ...data, offline: false };
};

export const createANC = async (patientId, ancData) => {
  if (!navigator.onLine) {
    const localId = createLocalId("anc");
    const anc = {
      _id: localId,
      localId,
      patientId,
      ...ancData,
      isHighRisk: false,
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
  if (data?.anc) {
    await saveANCLocally({
      ...data.anc,
      isSynced: true,
    });
  }

  return {
    ...data,
    offline: false,
  };
};

export const updateANC = async (patientId, ancId, updates) => {
  if (!navigator.onLine) {
    const anc = await updateANCLocally(ancId, updates);

    if (!anc) {
      throw new Error("ANC record not found locally");
    }

    await addToSyncQueue({
      operation: SyncOperationEnum.UPDATE_ANC,
      payload: { ancId, patientId, ...updates },
    });

    return { anc, offline: true };
  }

  const response = await api.put(`/anc/${patientId}/${ancId}`, updates);

  const data = response.data?.data || response.data;

  if (data?.anc) {
    await saveANCLocally({
      ...data.anc,
      isSynced: true,
    });
  }

  return { ...data, offline: false };
};
