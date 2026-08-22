import { ApiError } from "./api-error.js";

// replace temporary IDs with MongoDB IDs

export const replaceTempIds = (payload, idMap) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const clonedPayload = { ...payload };

  const idFields = ["patientId", "visitId", "vaccinationId", "ancId"];

  idFields.forEach((field) => {
    if (clonedPayload[field] && idMap.has(clonedPayload[field])) {
      clonedPayload[field] = idMap.get(clonedPayload[field]);
    }
  });

  return clonedPayload;
};

// save mapping between temporary ID and MongoDB ID.

export const saveIdMapping = (localId, mongoId, idMap) => {
  if (localId) {
    idMap.set(localId, mongoId.toString());
  }
};

// conflict resolution => returns true if incoming data is newer

export const isLatestUpdate = (incomingTimestamp, updatedAt) => {
  return new Date(incomingTimestamp) > new Date(updatedAt);
};

// Throws error if document not found

export const ensureExists = (document, message = "Record not found") => {
  if (!document) {
    throw new ApiError(404, message);
  }
};

// Build success response

export const buildSuccessResult = ({
  id,
  operation,
  mongoId,
  skipped = false,
}) => {
  return { id, operation, mongoId, skipped };
};
