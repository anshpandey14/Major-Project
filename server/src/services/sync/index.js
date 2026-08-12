import { SyncOperationEnum } from "../../utils/constants.js";
import { syncCreatePatient, syncUpdatePatient } from "./patient.sync.js";
import { syncCreateANC, syncUpdateANC } from "./anc.sync.js";
import {
  syncCreateVaccination,
  syncUpdateVaccination,
} from "./vaccination.sync.js";
import { syncCreateVisit, syncUpdateVisit } from "./visit.sync.js";

export const processSyncOperation = async (operation, user, idMap) => {
  switch (operation.operation) {
    case SyncOperationEnum.CREATE_PATIENT:
      return await syncCreatePatient(operation, user, idMap);

    case SyncOperationEnum.UPDATE_PATIENT:
      return await syncUpdatePatient(operation, user, idMap);

    case SyncOperationEnum.CREATE_VISIT:
      return await syncCreateVisit(operation, user, idMap);

    case SyncOperationEnum.UPDATE_VISIT:
      return await syncUpdateVisit(operation, user, idMap);

    case SyncOperationEnum.CREATE_VACCINATION:
      return await syncCreateVaccination(operation, user, idMap);

    case SyncOperationEnum.UPDATE_VACCINATION:
      return await syncUpdateVaccination(operation, user, idMap);

    case SyncOperationEnum.CREATE_ANC:
      return await syncCreateANC(operation, user, idMap);

    case SyncOperationEnum.UPDATE_ANC:
      return await syncUpdateANC(operation, user, idMap);

    default:
      throw new Error(`Unsupportedsync  operation : ${operation.operation}`);
  }
};
