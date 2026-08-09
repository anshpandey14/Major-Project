import { Patient } from "../../models/patient.models.js";
import { Visit } from "../../models/visit.models.js";

import {
  buildSuccessResult,
  ensureExists,
  isLatestUpdate,
  replaceTempIds,
  saveIdMapping,
} from "../../utils/sync.helpers.js";

// create visit

export const syncCreateVisit = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const { patientId, ...visitData } = data;

  const patient = await Patient.findOne({
    _id: patientId,
    assignedASHA: user._id,
    isActive: true,
  });

  ensureExists(Patient, "Patient not found or access denied");

  const visit = await Visit.findOne({
    ...visitData,
    patient: patientId,
    conductedBy: user._id,
  });

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: visit._id,
  });
};

