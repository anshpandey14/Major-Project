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
    systolic > 140 || diastolic > 90 || ancData.heamoglobin < 8;

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

