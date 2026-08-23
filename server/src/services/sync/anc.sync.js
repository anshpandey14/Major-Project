import { Patient } from "../../models/patient.models.js";
import { ANC } from "../../models/anc.models.js";
import {
  buildSuccessResult,
  ensureExists,
  isLatestUpdate,
  replaceTempIds,
} from "../../utils/sync.helpers.js";

// CREATE ANC
export const syncCreateANC = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const { patientId, ...ancData } = data;

  /*
   * Only an active pregnant patient belonging
   * to this ASHA can have an ANC record.
   */
  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
    isPregnant: true,
    assignedASHA: user._id,
  });

  ensureExists(
    patient,
    "Patient not found or access denied or patient not pregnant",
  );

  /*
   * Only allow fields that the client is allowed
   * to provide.
   *
   * isHighRisk is NOT included because it is
   * calculated by the server.
   */
  const allowedFields = [
    "visitDate",
    "gestationalWeek",
    "weight",
    "bloodPressure",
    "hemoglobin",
    "fetalHeartRate",
    "nextVisitDate",
    "notes",
  ];

  const safeANCData = {};

  for (const key of allowedFields) {
    if (ancData[key] !== undefined) {
      safeANCData[key] = ancData[key];
    }
  }

  /*
   * Calculate high-risk status on the server.
   */
  const systolic = safeANCData.bloodPressure?.systolic ?? 0;

  const diastolic = safeANCData.bloodPressure?.diastolic ?? 0;

  const hemoglobin = safeANCData.hemoglobin ?? 0;

  safeANCData.isHighRisk = systolic > 140 || diastolic > 90 || hemoglobin < 8;

  const anc = await ANC.create({
    ...safeANCData,
    patient: patientId,
    conductedBy: user._id,
  });

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: anc._id,
  });
};

// UPDATE ANC
export const syncUpdateANC = async (operation, user, idMap) => {
  const { id, payload, timestamp } = operation;

  const data = replaceTempIds(payload, idMap);

  const { ancId, patientId, ...updateData } = data;

  /*
   * Verify the ANC record belongs to this
   * patient and was conducted by this ASHA.
   */
  const anc = await ANC.findOne({
    _id: ancId,
    patient: patientId,
    conductedBy: user._id,
    isActive: true,
  });

  ensureExists(anc, "ANC record not found or access denied");

  /*
   * Make sure the patient still exists,
   * is active and is pregnant.
   */
  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
    isPregnant: true,
    assignedASHA: user._id,
  });

  ensureExists(
    patient,
    "Patient not found or access denied or patient not pregnant",
  );

  /*
   * Last-write-wins conflict resolution.
   */
  if (!isLatestUpdate(timestamp, anc.updatedAt)) {
    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: anc._id,
      skipped: true,
    });
  }

  /*
   * Update nested blood pressure safely.
   *
   * This supports partial updates:
   *
   * {
   *   bloodPressure: {
   *      systolic: 145
   *   }
   * }
   *
   * without destroying diastolic.
   */
  if (updateData.bloodPressure !== undefined) {
    anc.bloodPressure = {
      systolic: updateData.bloodPressure.systolic ?? anc.bloodPressure.systolic,

      diastolic:
        updateData.bloodPressure.diastolic ?? anc.bloodPressure.diastolic,
    };
  }

  /*
   * Fields that can be updated by the ASHA.
   */
  const allowedFields = [
    "visitDate",
    "gestationalWeek",
    "weight",
    "hemoglobin",
    "fetalHeartRate",
    "nextVisitDate",
    "notes",
  ];

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      anc[key] = updateData[key];
    }
  }

  /*
   * Recalculate high-risk status from the
   * FINAL values after applying the update.
   */
  const systolic = anc.bloodPressure?.systolic ?? 0;

  const diastolic = anc.bloodPressure?.diastolic ?? 0;

  const hemoglobin = anc.hemoglobin ?? 0;

  anc.isHighRisk = systolic > 140 || diastolic > 90 || hemoglobin < 8;

  await anc.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: anc._id,
  });
};
