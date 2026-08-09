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


// Update visit

export const syncUpdateVisit = async (operation, user, idMap) => {
  const { id, payload, timestamp } = operation;

  const data = replaceTempIds(payload, idMap);

  const { visitId, patientId, ...updateData } = data;

  const visit = await Visit.findOne({
    _id: visitId,
    patient: patientId,
    conductedBy: user._id,
    isACtive: true,
  });

  ensureExists(visit, "Visit not found or or access denied");

  if (!isLatestUpdate(timestamp, visit.updatedAt)) {
    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: visit._id,
      skipped: true,
    });
  }

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      visit[key] = updateDate[key];
    }
  });

  await visit.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: visit._id,
  });
};