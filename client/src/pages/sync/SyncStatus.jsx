import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getPendingSyncItems,
  getSyncQueueCount,
  updateSyncItem,
  removeSyncItem,
} from "@/lib/syncQueue";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

const SyncStatus = () => {
  const { user } = useAuth();

  const [queue, setQueue] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  const loadQueue = useCallback(async () => {
    try {
      const items = await getPendingSyncItems();
      const count = await getSyncQueueCount();

      setQueue(items);
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to load sync queue:", error);
    }
  }, []);

  useEffect(() => {
    loadQueue();

    const onOnline = () => {
      setIsOnline(true);
      loadQueue();
    };

    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [loadQueue]);

  const handleSync = async () => {
    if (!navigator.onLine || syncing) return;

    setIsOnline(true);
    setSyncing(true);
    setResult(null);

    try {
      const pending = await getPendingSyncItems();

      if (pending.length === 0) {
        setResult({
          synced: 0,
          failed: 0,
          message: "Nothing to sync.",
        });
        await loadQueue();
        return;
      }

      // Mark the operations as in progress locally.
      for (const item of pending) {
        await updateSyncItem(item.id, {
          status: "syncing",
        });
      }

      await loadQueue();

      const response = await api.post("/sync", {
        operations: pending,
      });

      const body = response.data?.data ?? response.data ?? {};

      // Expected per-operation result:
      // { results: [{ id, success: true }, { id, success: false }] }
      // Also accept a backend that calls this array "operations".
      const operationResults = Array.isArray(body.results)
        ? body.results
        : Array.isArray(body.operations)
          ? body.operations
          : null;

      if (!operationResults) {
        // Aggregate counts alone cannot identify which items succeeded.
        // Keep all operations rather than accidentally deleting failures.
        for (const item of pending) {
          await updateSyncItem(item.id, {
            status: "pending",
          });
        }

        setResult({
          synced: 0,
          failed: pending.length,
          message:
            "The server response did not include per-operation results. Items were retained; check the /sync response format.",
        });

        return;
      }

      let synced = 0;
      let failed = 0;

      for (const item of pending) {
        const operationResult = operationResults.find(
          (entry) => entry.id === item.id || entry.operationId === item.id,
        );

        const succeeded =
          operationResult?.success === true ||
          operationResult?.status === "success" ||
          operationResult?.status === "synced";

        if (succeeded) {
          await removeSyncItem(item.id);
          synced++;
        } else {
          await updateSyncItem(item.id, {
            status: "pending",
            lastError:
              operationResult?.error ||
              operationResult?.message ||
              "Operation was not confirmed as successful.",
          });

          failed++;
        }
      }

      await loadQueue();

      setResult({
        synced,
        failed,
        message: `${synced} synced, ${failed} failed.`,
      });
    } catch (error) {
      console.error("Sync failed:", error);

      // Preserve operations for retry after a network/API failure.
      try {
        const currentItems = await getPendingSyncItems();

        for (const item of currentItems) {
          if (item.status === "syncing") {
            await updateSyncItem(item.id, {
              status: "pending",
              lastError:
                error.response?.data?.message ||
                error.message ||
                "Sync request failed.",
            });
          }
        }
      } catch (queueError) {
        console.error("Failed to restore pending queue items:", queueError);
      }

      setResult({
        synced: 0,
        failed: -1,
        message:
          error.response?.data?.message ||
          "Sync failed. Check your connection and try again.",
      });

      await loadQueue();
    } finally {
      setSyncing(false);
    }
  };

  const opLabel = (op) => {
    const map = {
      CREATE_PATIENT: "Create patient",
      UPDATE_PATIENT: "Update patient",
      CREATE_VISIT: "Create visit",
      UPDATE_VISIT: "Update visit",
      CREATE_VACCINATION: "Create vaccination",
      UPDATE_VACCINATION: "Update vaccination",
      CREATE_ANC: "Create ANC record",
      UPDATE_ANC: "Update ANC record",
    };

    return map[op] || op;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sync Status</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your offline operation queue
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="size-6 text-primary" />
            ) : (
              <WifiOff className="size-6 text-destructive" />
            )}

            <div>
              <p className="font-semibold">{isOnline ? "Online" : "Offline"}</p>
              <p className="text-sm text-muted-foreground">
                {pendingCount} operation
                {pendingCount !== 1 ? "s" : ""} pending sync
              </p>
            </div>
          </div>

          <Button
            onClick={handleSync}
            disabled={!isOnline || syncing || pendingCount === 0}
            className="gap-2"
          >
            {syncing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card
          className={
            result.failed !== 0 ? "border-destructive/40" : "border-primary/40"
          }
        >
          <CardContent className="flex items-center gap-3 p-4">
            {result.failed !== 0 ? (
              <XCircle className="size-5 text-destructive" />
            ) : (
              <CheckCircle2 className="size-5 text-primary" />
            )}
            <p className="text-sm font-medium">{result.message}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Pending Operations
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <CheckCircle2 className="size-8 opacity-40" />
              <p className="text-sm">All operations synced</p>
            </div>
          ) : (
            queue.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {opLabel(op.operation)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(op.timestamp).toLocaleString()}
                    </p>
                    {op.lastError && (
                      <p className="text-xs text-destructive">{op.lastError}</p>
                    )}
                  </div>
                </div>

                <Badge
                  variant={op.status === "syncing" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {op.status === "syncing" ? "Syncing" : "Pending"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncStatus;
