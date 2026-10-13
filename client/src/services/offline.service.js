import api from "@/api/axios";
import { addToSyncQueue } from "@/lib/syncQueue";

export const performOfflineMutation = async ({
  operation,
  payload,
  onlineRequest,
}) => {
  if (navigator.onLine) {
    return onlineRequest();
  }

  const queueItem = await addToSyncQueue({
    operation,
    payload,
  });

  return { offline: true, operation: queueItem };
};
