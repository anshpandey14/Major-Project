import { Patient } from "../../models/patient.models.js";
import {
  replaceTempIds,
  saveIdMapping,
  isLatestUpdate,
  ensureExists,
  buildSuccessResult,
} from "../../utils/sync.helpers.js";

// CREATE PATIENT
export const syncCreatePatient = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const localId = data.localId;

  /*
   * Only allow fields that the ASHA client is allowed
   * to create.
   */
  const allowedFields = [
    "fullName",
    "phone",
    "village",
    "gender",
    "dob",
    "weight",
    "height",
    "bloodGroup",
    "isPregnant",
    "lmpDate",
  ];

  const patientData = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      patientData[key] = data[key];
    }
  }

  /*
   * Business-level duplicate check.
   *
   * The same phone number for the same ASHA should
   * not create another active patient.
   */
  const existingPatient = await Patient.findOne({
    phone: patientData.phone,
    assignedASHA: user._id,
    isActive: true,
  });

  if (existingPatient) {
    saveIdMapping(localId, existingPatient._id, idMap);

    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: existingPatient._id,
      skipped: true,
    });
  }

  const patient = await Patient.create({
    ...patientData,
    assignedASHA: user._id,
  });

  /*
   * Map:
   *
   * temp-patient-id
   *        ↓
   * MongoDB patient _id
   */
  saveIdMapping(localId, patient._id, idMap);

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: patient._id,
  });
};

// UPDATE PATIENT
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

  /*
   * Last-write-wins conflict resolution.
   */
  if (!isLatestUpdate(timestamp, patient.updatedAt)) {
    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: patient._id,
      skipped: true,
    });
  }

  const allowedFields = [
    "fullName",
    "phone",
    "village",
    "gender",
    "dob",
    "weight",
    "height",
    "bloodGroup",
    "isPregnant",
    "lmpDate",
  ];

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      patient[key] = updateData[key];
    }
  }

  await patient.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: patient._id,
  });
};
