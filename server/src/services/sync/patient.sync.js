import { Patient } from "../../models/patient.models.js";
import { ApiError } from "../../utils/api-error.js";
import {
  replaceTempIds,
  saveIdMapping,
  isLatestUpdate,
  ensureExists,
  buildSuccessResult,
} from "../../utils/sync.helpers.js";

// create patient

export const syncCreatePatient = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const existingPatient = await Patient.findOne({
    phone: data.phone,
    isActive: true,
  });

  if (existingPatient) {
    saveIdMapping(data.localId, existingPatient._id, idMap);

    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: existingPatient._id,
      skipped: true,
    });
  }

  //   remove local id before saving
  delete data.localId;

  const patient = await Patient.create({
    ...data,
    assignedASHA: user._id,
  });

  //  save temp -> mongo mapping
  saveIdMapping(payload.localId, patient._id, idMap);

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: patient._id,
  });
};

// update patient

export const syncUpdatePatient = async (operation, user, idMap) => {
  const { id, payload, timestamp } = operation;

  const data = replaceTempIds(payload, idMap);

  const { patientId, ...updateData } = data;

  const patient = await Patient.findOne({
    _id: patientId,
    assignedASHA: user._id,
    isActive: true,
  });

  ensureExists(patient, "Patient not found or access denied");

  if (!isLatestUpdate(timestamp, patient.updatedAt)) {
    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: patient._id,
      skipped: true,
    });
  }

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      patient[key] = updateDate[key];
    }
  });

  await Patient.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: patient._id,
  });
};
