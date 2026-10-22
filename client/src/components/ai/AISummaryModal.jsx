import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, Loader2, AlertCircle, X,
  CheckCircle2, Clock,
} from "lucide-react";

const AISummaryModal = ({ patientId, patientName, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/ai/summary", { patientId });
      const data = res.data?.data;
      setSummary(data?.summary || data?.aiSummary);
      setStale(data?.stale || false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate summary. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="text-base">AI Patient Summary</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {stale && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Clock className="size-3" /> Cached
              </Badge>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Patient: <span className="font-medium text-foreground">{patientName}</span>
          </p>

          {!summary && !loading && !error && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Sparkles className="size-10 text-primary/30" />
              <p className="text-center text-sm text-muted-foreground">
                Generate an AI-powered summary of this patient's health history
              </p>
              <Button onClick={fetchSummary} className="gap-2">
                <Sparkles className="size-4" />
                Generate Summary
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analysing patient records...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-6">
              <AlertCircle className="size-8 text-destructive/60" />
              <p className="text-center text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchSummary} size="sm">
                Try Again
              </Button>
            </div>
          )}

          {summary && !loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-primary">
                <CheckCircle2 className="size-3.5" />
                {stale ? "Showing cached summary (last 24h)" : "Generated just now"}
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {summary}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSummary}
                className="gap-2"
              >
                <Sparkles className="size-3.5" />
                Regenerate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AISummaryModal;
