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

// update vaccination

export const syncUpdateVaccination = async (operation, user, idMap) => {
  const { id, payload, timestamp } = operation;

  const data = replaceTempIds(payload, idMap);

  const { vaccinationId, patientId, ...updateData } = data;

  const vaccination = await Vaccination.findOne({
    _id: vaccinationId,
    patient: patientId,
    administeredBy: user._id,
    isActive: true,
  });

  ensureExists(vaccination, "Vaccination not found or access denied");

  if (!isLatestUpdate(timestamp, vaccination.updatedAt)) {
    return buildSuccessREsult({
      id,
      operation: operation.operation,
      skipped: true,
    });
  }

  if (
    updateData.nextDueDate &&
    updateData.status === VaccinationStatusEnum.PENDING
  ) {
    if (new Date(updateData.nextDueDate) < new Date()) {
      updateData.status = VaccinationStatusEnum.OVERDUE;
    }
  }

  Object.keys(updateData).forEach((key) => {
    if (updateDate[key] !== undefined) {
      vaccination[key] = updateDate[key];
    }
  });

  await vaccination.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: vaccination._id,
  });
};
