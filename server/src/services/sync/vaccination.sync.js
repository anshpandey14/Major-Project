import { Patient } from "../../models/patient.models.js";
import { Vaccination } from "../../models/vaccination.models.js";
import { VaccinationStatusEnum } from "../../utils/constants.js";
import {
  buildSuccessResult,
  ensureExists,
  isLatestUpdate,
  replaceTempIds,
  saveIdMapping,
} from "../../utils/sync.helpers.js";

// create vaccination

export const syncCreateVaccination = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const { patientId, ...vaccinationData } = data;

  const patient = await Patient.findOne({
    _id: patientId,
    assignedASHA: user._id,
    isActive: true,
  });

  ensureExists(patient, "Patient not found or access denied");

  vaccinationData.status = VaccinationStatusEnum.COMPLETED;

  const vaccination = await Vaccination.create({
    ...vaccinationData,
    patient: patientId,
    administeredBy: user._id,
  });

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: vaccination._id,
  });
};


