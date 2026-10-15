import api from "@/api/axios";
import {
  getAllPatientsLocally,
  getPatientLocally,
  savePatientLocally,
  updatePatientLocally,
} from "./local/patient.local";
import { performOfflineMutation } from "./offline.service";
import { SyncOperationEnum } from "@/utils/constants";

export const getPatients = async (params = {}) => {
  if (!navigator.onLine) {
    const patients = await getAllPatientsLocally();
    const search = params.search?.trim().toLowerCase();

    const filteredPatients = search
      ? patients.filter(
          (patient) =>
            patient.fullName?.toLowerCase().includes(search) ||
            patient.phone?.toLowerCase().includes(search) ||
            patient.village?.toLowerCase().includes(search),
        )
      : patients;

    return {
      patients: filteredPatients,
      pagination: {
        page: 1,
        limit: filteredPatients.length,
        totalPatients: filteredPatients.length,
        totalPages: 1,
      },
      offline: true,
    };
  }

  const response = await api.get("/patients", {
    params,
  });

  const data = response.data?.data || response.data;
  const patients = data?.patients || [];

  for (const patient of patients) {
    await savePatientLocally({
      ...patient,
      isSynced: true,
    });
  }

  return {
    ...data,
    offline: false,
  };
};

export const getPatient = async (pateintId) => {
  if (!navigator.onLine) {
    const patient = await getPatientLocally(pateintId);

    if (!patient) {
      throw new Error("patient not found locally");
    }

    return {
      patient,
      offline: true,
    };
  }

  const response = await api.get(`/patients/${pateintId}`);
  const data = response.data?.data || response.data;
  if (data?.patient) {
    await savePatientLocally({
      ...data.patient,
      isSynced: true,
    });
  }

  return {
    ...data,
    offline: false,
  };
};

export const updatePatient = async (patientId, updates) => {
  return performOfflineMutation({
    operation: SyncOperationEnum.UPDATE_PATIENT,
    payload: { patientId, ...updates },

    onlineRequest: async () => {
      const response = await api.patch(`/patients/${patientId}`, updates);

      const data = response.data?.data || response.data;
      if (data?.patient) {
        await savePatientLocally({
          ...data.patient,
          isSynced: true,
        });
      }
      return data;
    },
  });
};
