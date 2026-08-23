import { Patient } from "../../models/patient.models.js";
import { Vaccination } from "../../models/vaccination.models.js";
import { VaccinationStatusEnum } from "../../utils/constants.js";
import { ApiError } from "../../utils/api-error.js";
import {
  buildSuccessResult,
  ensureExists,
  isLatestUpdate,
  replaceTempIds,
  saveIdMapping,
  assertPatientAccess,
} from "../../utils/sync.helpers.js";

// CREATE VACCINATION
export const syncCreateVaccination = async (operation, user, idMap) => {
  const { id, payload } = operation;

  const data = replaceTempIds(payload, idMap);

  const { patientId, ...vaccinationData } = data;

  /*
   * Verify that the patient belongs to
   * the logged-in ASHA.
   */
  const patient = await Patient.findOne({
    _id: patientId,
    isActive: true,
  });

  assertPatientAccess(patient, user);

  /*
   * Only allow client-controlled vaccination fields.
   *
   * status, patient and administeredBy are
   * controlled by the server.
   */
  const allowedFields = [
    "vaccine",
    "customVaccine",
    "doseNumber",
    "vaccinationDate",
    "nextDueDate",
    "notes",
  ];

  const safeVaccinationData = {};

  for (const key of allowedFields) {
    if (vaccinationData[key] !== undefined) {
      safeVaccinationData[key] = vaccinationData[key];
    }
  }

  /*
   * A CREATE vaccination represents an
   * administered vaccination.
   */
  safeVaccinationData.status = VaccinationStatusEnum.COMPLETED;

  /*
   * Prevent recording the same vaccine dose
   * twice for the same active patient.
   *
   * For example:
   * BCG + doseNumber 1
   * BCG + doseNumber 1  <-- reject
   */
  const duplicateQuery = {
    patient: patientId,
    doseNumber: safeVaccinationData.doseNumber,
    isActive: true,
  };

  if (safeVaccinationData.vaccine) {
    duplicateQuery.vaccine = safeVaccinationData.vaccine;
  } else if (safeVaccinationData.customVaccine) {
    duplicateQuery.customVaccine = safeVaccinationData.customVaccine.trim();
  }

  const existingVaccination = await Vaccination.findOne(duplicateQuery);

  if (existingVaccination) {
    throw new ApiError(409, "This vaccine dose has already been recorded");
  }

  const localId = data.localId;
  const vaccination = await Vaccination.create({
    ...safeVaccinationData,
    patient: patientId,
    administeredBy: user._id,
  });

  saveIdMapping(localId, vaccination._id, idMap);

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: vaccination._id,
  });
};

// UPDATE VACCINATION
export const syncUpdateVaccination = async (operation, user, idMap) => {
  const { id, payload, timestamp } = operation;

  const data = replaceTempIds(payload, idMap);

  const { vaccinationId, patientId, ...updateData } = data;

  const vaccination = await Vaccination.findOne({
    _id: vaccinationId,
    patient: patientId,
    isActive: true,
  });

  ensureExists(vaccination, "Vaccination not found or access denied");

  if (user?.role !== "phc" && !vaccination.administeredBy.equals(user._id)) {
    throw new ApiError(403, "Vaccination not found or access denied");
  }

  /*
   * Last-write-wins conflict resolution.
   */
  if (!isLatestUpdate(timestamp, vaccination.updatedAt)) {
    return buildSuccessResult({
      id,
      operation: operation.operation,
      mongoId: vaccination._id,
      skipped: true,
    });
  }

  const allowedFields = [
    "vaccine",
    "customVaccine",
    "doseNumber",
    "vaccinationDate",
    "nextDueDate",
    "status",
    "notes",
  ];

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      vaccination[key] = updateData[key];
    }
  }

  if (updateData.vaccine !== undefined) {
    vaccination.customVaccine = "";
  } else if (updateData.customVaccine !== undefined) {
    vaccination.vaccine = undefined;
  }

  /*
   * Automatically calculate overdue status
   * when a pending vaccination's due date has passed.
   */
  if (
    vaccination.status === VaccinationStatusEnum.PENDING &&
    vaccination.nextDueDate
  ) {
    if (new Date(vaccination.nextDueDate) < new Date()) {
      vaccination.status = VaccinationStatusEnum.OVERDUE;
    }
  }

  /*
   * Prevent changing this vaccination into
   * a duplicate dose.
   */
  if (
    updateData.vaccine !== undefined ||
    updateData.customVaccine !== undefined ||
    updateData.doseNumber !== undefined
  ) {
    const duplicateQuery = {
      patient: vaccination.patient,
      doseNumber: vaccination.doseNumber,
      isActive: true,
      _id: {
        $ne: vaccination._id,
      },
    };

    if (vaccination.vaccine) {
      duplicateQuery.vaccine = vaccination.vaccine;
    }

    if (vaccination.customVaccine) {
      duplicateQuery.customVaccine = vaccination.customVaccine;
    }

    const existingVaccination = await Vaccination.findOne(duplicateQuery);

    if (existingVaccination) {
      throw new ApiError(
        409,
        "Another vaccination with the same vaccine dose already exists",
      );
    }
  }

  await vaccination.save();

  return buildSuccessResult({
    id,
    operation: operation.operation,
    mongoId: vaccination._id,
  });
};
