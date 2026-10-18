import api from "@/api/axios";
import {
  getAllPatientsLocally,
  getPatientLocally,
  savePatientLocally,
  updatePatientLocally,
} from "./local/patient.local";
import { getVisitsLocally } from "./local/visit.local";
import { getVaccinationsLocally } from "./local/vaccination.local";
import { getANCsLocally } from "./local/anc.local";
import { addToSyncQueue } from "@/lib/syncQueue";
import { createLocalId } from "@/lib/localId";
import { SyncOperationEnum } from "@/utils/constants";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const getPatients = async (params = {}) => {
  if (!navigator.onLine) {
    const patients = await getAllPatientsLocally();
    const search = params.search?.trim().toLowerCase();
    const filtered = search
      ? patients.filter((patient) =>
          [patient.fullName, patient.phone, patient.village].some((value) =>
            String(value ?? "").toLowerCase().includes(search),
          ),
        )
      : patients;
    const limit = Number(params.limit) || Math.max(filtered.length, 1);
    const page = Number(params.page) || 1;
    const start = (page - 1) * limit;
    return {
      patients: filtered.slice(start, start + limit),
      pagination: { page, currentPage: page, limit, totalPatients: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / limit)) },
      offline: true,
    };
  }

  const data = unwrap(await api.get("/patient", { params }));
  const patients = Array.isArray(data.patients) ? data.patients : [];
  for (const patient of patients) await savePatientLocally({ ...patient, isSynced: true });
  return { ...data, offline: false };
};

export const getPatient = async (patientId) => {
  if (!navigator.onLine) {
    const patient = await getPatientLocally(patientId);
    if (!patient) throw new Error("Patient not found locally");
    return { patient, offline: true };
  }
  const data = unwrap(await api.get(`/patient/${patientId}`));
  const patient = data.patient ?? data;
  if (patient?._id) await savePatientLocally({ ...patient, isSynced: true });
  return { patient, offline: false };
};

export const createPatient = async (patientData) => {
  if (!navigator.onLine) {
    const localId = createLocalId("patient");
    const patient = {
      _id: localId, localId, ...patientData, isSynced: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await savePatientLocally(patient);
    await addToSyncQueue({ operation: SyncOperationEnum.CREATE_PATIENT, payload: { localId, ...patientData } });
    return { patient, offline: true };
  }
  const data = unwrap(await api.post("/patient", patientData));
  const patient = data.patient ?? data;
  if (patient?._id) await savePatientLocally({ ...patient, isSynced: true });
  return { patient, offline: false };
};

export const updatePatient = async (patientId, updates) => {
  if (!navigator.onLine) {
    const patient = await updatePatientLocally(patientId, updates);
    if (!patient) throw new Error("Patient not found locally");
    await addToSyncQueue({ operation: SyncOperationEnum.UPDATE_PATIENT, payload: { patientId, ...updates } });
    return { patient, offline: true };
  }
  const data = unwrap(await api.patch(`/patient/${patientId}`, updates));
  const patient = data.patient ?? data;
  if (patient?._id) await savePatientLocally({ ...patient, isSynced: true });
  return { patient, offline: false };
};

export const getPatientTimeline = async (patientId) => {
  if (navigator.onLine) {
    const data = unwrap(await api.get(`/patient/${patientId}/timeline`));
    const timeline = data.timeline ?? data;
    return { timeline: Array.isArray(timeline) ? timeline : [], offline: false };
  }
  const [visits, vaccinations, anc] = await Promise.all([
    getVisitsLocally(patientId),
    getVaccinationsLocally(patientId),
    getANCsLocally(patientId),
  ]);
  const timeline = [
    ...visits.map((record) => ({ ...record, type: "visit", date: record.visitDate ?? record.createdAt })),
    ...vaccinations.map((record) => ({ ...record, type: "vaccination", date: record.vaccinationDate ?? record.createdAt })),
    ...anc.map((record) => ({ ...record, type: "anc", date: record.visitDate ?? record.createdAt })),
  ].sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));
  return { timeline, offline: true };
};
