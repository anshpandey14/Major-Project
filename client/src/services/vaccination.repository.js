import api from "@/api/axios";
import {
  saveVaccinationLocally,
  getVaccinationLocally,
  getVaccinationsLocally,
  updateVaccinationLocally,
} from "./local/vaccination.local";
import { addToSyncQueue } from "@/lib/syncQueue";
import { createLocalId } from "@/lib/localId";
import { SyncOperationEnum } from "@/utils/constants";

export const getVaccinations = async (patientId, params = {}) => {
  if (!navigator.onLine) {
    const vaccinations = await getVaccinationsLocally(patientId);

    return {
      vaccinations,
      pagination: {
        page: 1,
        limit: vaccinations.length,
        totalVaccinations: vaccinations.length,
        totalPages: 1,
      },
      offline: true,
    };
  }

  const response = await api.get(`/vaccination/${patientId}`, { params });

  const data = response.data?.data || response.data;
  const vaccinations = data?.vaccinations || [];

  for (const vaccination of vaccinations) {
    const patientIdValue = typeof vaccination.patient === "object" ? vaccination.patient?._id : vaccination.patient;
    await saveVaccinationLocally({ ...vaccination, patientId: vaccination.patientId ?? patientIdValue, isSynced: true });
  }

  return {
    ...data,
    offline: false,
  };
};


export const getVaccination = async (patientId, vaccinationId) => {
  if (!navigator.onLine) {
    const vaccination = await getVaccinationLocally(vaccinationId);
    if (!vaccination || String(vaccination.patientId) !== String(patientId)) throw new Error("Vaccination not found locally");
    return { vaccination, offline: true };
  }
  const response = await api.get(`/vaccination/${patientId}/${vaccinationId}`);
  const data = response.data?.data ?? response.data;
  const vaccination = data.vaccination ?? data;
  if (vaccination?._id) {
    const patientRef = typeof vaccination.patient === "object" ? vaccination.patient?._id : vaccination.patient;
    await saveVaccinationLocally({ ...vaccination, patientId: vaccination.patientId ?? patientRef ?? patientId, isSynced: true });
  }
  return { vaccination, offline: false };
};

export const createVaccination = async (patientId, vaccinationData) => {
  if (!navigator.onLine) {
    const localId = createLocalId("vaccination");

    const vaccination = {
      _id: localId,
      localId,
      patientId,
      ...vaccinationData,
      status: "completed",
      isSynced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveVaccinationLocally(vaccination);
    await addToSyncQueue({
      operation: SyncOperationEnum.CREATE_VACCINATION,
      payload: {
        localId,
        patientId,
        vaccine: vaccinationData.vaccine,
        customVaccine: vaccinationData.customVaccine,
        doseNumber: vaccinationData.doseNumber,
        vaccinationDate: vaccinationData.vaccinationDate,
        nextDueDate: vaccinationData.nextDueDate,
        notes: vaccinationData.notes,
      },
    });

    return {
      vaccination,
      offline: true,
    };
  }

  const response = await api.post(
    `/vaccination/${patientId}`,
    vaccinationData,
  );

  const data = response.data?.data || response.data;
  const vaccination = data.vaccination ?? data;
  if (vaccination?._id) {
    const patientRef = typeof vaccination.patient === "object" ? vaccination.patient?._id : vaccination.patient;
    await saveVaccinationLocally({ ...vaccination, patientId: vaccination.patientId ?? patientRef ?? patientId, isSynced: true });
  }

  return { vaccination, offline: false };
};

export const updateVaccination = async (patientId, vaccinationId, updates) => {
  if (!navigator.onLine) {
    const vaccination = await updateVaccinationLocally(vaccinationId, updates);

    if (!vaccination) {
      throw new Error("vaccination not found locally");
    }

    await addToSyncQueue({
      operation: SyncOperationEnum.UPDATE_VACCINATION,
      payload: {
        vaccinationId,
        patientId,
        ...updates,
      },
    });

    return { vaccination, offline: true };
  }
  const response = await api.put(
    `/vaccination/${patientId}/${vaccinationId}`,
    updates,
  );

  const data = response.data?.data || response.data;
  const vaccination = data.vaccination ?? data;
  if (vaccination?._id) {
    const patientRef = typeof vaccination.patient === "object" ? vaccination.patient?._id : vaccination.patient;
    await saveVaccinationLocally({ ...vaccination, patientId: vaccination.patientId ?? patientRef ?? patientId, isSynced: true });
  }

  return { vaccination, offline: false };
};
