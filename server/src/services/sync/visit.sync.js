import { Patient } from "../../models/patient.models.js";
import { Visit } from "../../models/visit.models.js";
import {
  buildSuccessResult,
  ensureExists,
  isLatestUpdate,
  replaceTempIds,
} from "../../utils/sync.helpers.js";

// CREATE VISIT
export const syncCreateVisit = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const { patientId, ...visitData } = data;

  const patient = await Patient.findOne({
    _id: patientId,
    assignedASHA: user._id,
    isActive: true,
  });

  ensureExists(patient, "Patient not found or access denied");

  /*
   * Only allow fields that an ASHA is allowed
   * to create for a visit.
   */
  const allowedFields = [
    "visitDate",
    "weight",
    "symptoms",
    "additionalSymptoms",
    "notes",
    "followUpDate",
  ];

  const safeVisitData = {};

  for (const key of allowedFields) {
    if (visitData[key] !== undefined) {
      safeVisitData[key] = visitData[key];
    }
  }

  const visit = await Visit.create({
    ...safeVisitData,
    patient: patientId,
    conductedBy: user._id,
  });

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: visit._id,
  });
};

// UPDATE VISIT
export const syncUpdateVisit = async (operation, user, idMap) => {
  const { id, payload, timestamp } = operation;

  const data = replaceTempIds(payload, idMap);

  const { visitId, patientId, ...updateData } = data;

  const visit = await Visit.findOne({
    _id: visitId,
    patient: patientId,
    conductedBy: user._id,
    isActive: true,
  });

  ensureExists(visit, "Visit not found or access denied");

  /*
   * Last-write-wins conflict resolution.
   */
  if (!isLatestUpdate(timestamp, visit.updatedAt)) {
    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: visit._id,
      skipped: true,
    });
  }

  const allowedFields = [
    "visitDate",
    "weight",
    "symptoms",
    "additionalSymptoms",
    "notes",
    "followUpDate",
  ];

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      visit[key] = updateData[key];
    }
  }

  await visit.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: visit._id,
  });
};
