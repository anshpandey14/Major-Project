import { Patient } from "../../models/patient.models.js";
import { ANC } from "../../models/anc.models.js";
import {
  buildSuccessResult,
  ensureExists,
  isLatestUpdate,
  replaceTempIds,
  saveIdMapping,
} from "../../utils/sync.helpers.js";

// create ANC

export const syncCreateANC = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const { patientId, ...ancData } = data;

  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
    isPregnant: true,
    assignedASHA: req._id,
  });

  ensureExists(
    patient,
    "Patient not found or access denied or patient not pregnant",
  );

  const systolic = ancData.bloodPressure?.systolic ?? 0;
  const diastolic = ancData.bloodPressure?.diastolic ?? 0;

  ancData.isHighRisk =
    systolic > 140 || diastolic > 90 || ancData.hemoglobin < 8;

  const anc = await ANC.create({
    ...ancData,
    patient: patientId,
    conductedBy: user._id,
  });

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: anc._id,
  });
};

// update ANC

export const syncUpdateANC = async (operation, user, idMap) => {
  const { id, payload, timestamp } = operation;

  const data = replaceTempIds(payload, idMap);

  const { ancId, patientId, ...updateData } = data;

  const anc = await ANC.findOne({
    _id: ancId,
    patient: patientId,
    conductedBy: user._id,
    isActive: true,
  });

  ensureExists(anc, "ANC record not found or access denied");

  if (!isLatestUpdate(timestamp, anc.updatedAt)) {
    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: anc._id,
      skipped: true,
    });
  }

  const systolic =
    updateData.bloodPressure?.systolic ?? anc.bloodPressure?.systolic ?? 0;

  const diastolic =
    updateData.bloodPressure?.diastolic ?? anc.bloodPressure?.diastolic ?? 0;

  const hb = updateData.hemoglobin ?? anc.hemoglobin;

  updateData.isHighRisk = systolic > 140 || diastolic > 90 || hb < 8;

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      anc[key] = updateData[key];
    }
  });

  await anc.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: anc._id,
  });
};
