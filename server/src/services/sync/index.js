import { SyncOperationEnum } from "../../utils/constants.js";
import { syncCreatePatient, syncUpdatePatient } from "./patient.sync.js";
import { syncCreateVisit, syncUpdateVisit } from "./visit.sync.js";
import {
  syncCreateVaccination,
  syncUpdateVaccination,
} from "./vaccination.sync.js";
import { syncCreateANC, syncUpdateANC } from "./anc.sync.js";

export const processSyncOperation = async (operation, user, idMap) => {
  switch (operation.operation) {
    case SyncOperationEnum.CREATE_PATIENT:
      return syncCreatePatient(operation, user, idMap);

    case SyncOperationEnum.UPDATE_PATIENT:
      return syncUpdatePatient(operation, user, idMap);

    case SyncOperationEnum.CREATE_VISIT:
      return syncCreateVisit(operation, user, idMap);

    case SyncOperationEnum.UPDATE_VISIT:
      return syncUpdateVisit(operation, user, idMap);

    case SyncOperationEnum.CREATE_VACCINATION:
      return syncCreateVaccination(operation, user, idMap);

    case SyncOperationEnum.UPDATE_VACCINATION:
      return syncUpdateVaccination(operation, user, idMap);

    case SyncOperationEnum.CREATE_ANC:
      return syncCreateANC(operation, user, idMap);

    case SyncOperationEnum.UPDATE_ANC:
      return syncUpdateANC(operation, user, idMap);

    default:
      throw new Error(`Unsupported sync operation: ${operation.operation}`);
  }
};
