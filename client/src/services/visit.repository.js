import api from "@/api/axios";
import {
  getVisitsLocally,
  saveVisitLocally,
  updateVisitLocally,
} from "./local/visit.local";
import { addToSyncQueue } from "@/lib/syncQueue";
import { SyncOperationEnum } from "@/utils/constants";
import { createLocalId } from "@/lib/localId";

export const getVisits = async (patientId, params = {}) => {
  if (!navigator.onLine) {
    const visits = await getVisitsLocally(patientId);

    return {
      visits,
      pagination: {
        page: 1,
        limit: visits.length,
        totalVisits: visits.length,
        totalPages: 1,
      },
      offline: true,
    };
  }

  const response = await api.get(`/visits/${patientId}`, {
    params,
  });

  const data = response.data?.data || response.data;
  const visits = data?.visits || [];

  for (const visit of visits) {
    await saveVisitLocally({
      ...visit,
      isSynced: true,
    });
  }

  return { ...data, offline: false };
};

export const updateVisit = async (patientId, visitId, updates) => {
  if (!navigator.onLine) {
    const visit = await updateVisitLocally(visitId, updates);

    if (!visit) {
      throw new ErrorEvent("Visit not found locally");
    }

    await addToSyncQueue({
      operation: SyncOperationEnum.UPDATE_VISIT,
      payload: {
        visitId,
        patientId,
        ...updates,
      },
    });

    return {
      visit,
      offline: true,
    };
  }

  const response = await api.put(`/visits/${patientId}/${visitId}`, updates);

  const data = response.data?.data || response.data;

  if (data?.visit) {
    await saveVisitLocally({
      ...data.visit,
      isSynced: true,
    });
  }

  return { ...data, offline: false };
};

export const createVisit = async (patientId, visitData) => {
  if (!navigator.onLine) {
    const localId = createLocalId("visit");

    const visit = {
      _id: localId,
      localId,
      patientId,
      ...visitData,

      isSynced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveVisitLocally(visit);

    await addToSyncQueue({
      operation: SyncOperationEnum.CREATE_VISIT,
      payload: {
        localId,
        patientId,
        ...visitData,
      },
    });

    return {
      visit,
      offline: true,
    };
  }

  const response = await api.post(`/visits/${patientId}`, visitData);

  const data = response.data?.data || response.data;

  if (data?.visit) {
    await saveVisitLocally({
      ...data.visit,
      isSynced: true,
    });
  }

  return { ...data, offline: false };
};
