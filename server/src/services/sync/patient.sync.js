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


