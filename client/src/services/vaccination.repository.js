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

  const resposne = await api.get(`/vaccinations/${patientId}`, { params });

  const data = resposne.data?.data || resposne.data;
  const vaccinations = data?.vaccinations || [];

  for (const vaccination of vaccinations) {
    await saveVaccinationLocally({
      ...vaccination,
      isSynced: true,
    });
  }

  return {
    ...data,
    offline: false,
  };
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
    `/vaccinations/${patientId}`,
    vaccinationData,
  );

  const data = response.data?.data || response.data;
  if (data?.vaccination) {
    await saveVaccinationLocally({
      ...data.vaccination,
      isSynced: true,
    });
  }

  return {
    ...data,
    offline: false,
  };
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
    `/vaccinations/${patientId}/${vaccinationId}`,
    updates,
  );

  const data = response.data?.data || response.data;
  if (data?.vaccination) {
    await saveVaccinationLocally({
      ...data.vaccination,
      isSynced: true,
    });
  }

  return { ...data, offline: false };
};
