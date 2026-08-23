import { ApiError } from "./api-error.js";

// Replace temporary IDs with MongoDB IDs
export const replaceTempIds = (payload, idMap) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  const clonedPayload = { ...payload };

  const idFields = ["patientId", "visitId", "vaccinationId", "ancId"];

  for (const field of idFields) {
    const value = clonedPayload[field];

    if (value && idMap.has(value)) {
      clonedPayload[field] = idMap.get(value);
    }
  }

  return clonedPayload;
};

// Save mapping between temporary ID and MongoDB ID
export const saveIdMapping = (localId, mongoId, idMap) => {
  if (!localId || !mongoId) {
    return;
  }

  idMap.set(localId.toString(), mongoId.toString());
};

// Conflict resolution
// Returns true if incoming data is newer
// than existing data
export const isLatestUpdate = (incomingTimestamp, updatedAt) => {
  const incomingDate = new Date(incomingTimestamp);

  const existingDate = new Date(updatedAt);

  if (isNaN(incomingDate.getTime()) || isNaN(existingDate.getTime())) {
    return false;
  }

  return incomingDate > existingDate;
};

// Throw error if document does not exist
export const ensureExists = (document, message = "Record not found") => {
  if (!document) {
    throw new ApiError(404, message);
  }

  return document;
};

// Build success response
export const buildSuccessResult = ({
  id,
  operation,
  mongoId,
  skipped = false,
}) => {
  return {
    id,
    operation,
    mongoId: mongoId?.toString(),
    skipped,
  };
};
