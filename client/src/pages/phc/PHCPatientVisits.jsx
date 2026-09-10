import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Loader2,
  UserRound,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHCPatientVisits = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, visitsResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/visits/${patientId}`),
      ]);

      const patientData = patientResponse?.data?.data || patientResponse?.data;
      const visitsData = visitsResponse?.data?.data || visitsResponse?.data;
      setPatient(patientData?.patient || patientData);
      setVisits(
        visitsData?.visits || (Array.isArray(visitsData) ? visitsData : []),
      );
    } catch (err) {
      console.error("Failed to fetch visits:", err);

      setError(err?.response?.data?.message || "Failed to load visit records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [patientId]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          onClick={() => navigate(`/phc/patients/${patientId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/phc/patients/${patientId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visits Records</h1>

          <p className="text-sm text-muted-foreground">
            {patient?.fullName || "Patient"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-semibold">{patient?.fullName || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="font-semibold">{visits.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Visits</CardTitle>
        </CardHeader>

        <CardContent>
          {visits.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
              <ClipboardList className="h-9 w-9 text-muted-foreground" />
              <p className="font-medium">No visit records</p>
              <p className="text-sm text-muted-foreground">
                No health visits have been recorder for this patient
              </p>
            </div>
          ) : (
            <div className="sapce-y-4">
              {visits.map((visit) => (
                <div key={visit._id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="h-4 w-4 text-muted-foreground">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {formatDate(visit.visitDate)}
                        </p>
                      </div>
                      {visit.conductedBy && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Conducted by:{" "}
                          {visit.conductedBy.fullName ||
                            visit.conductedBy.username ||
                            "-"}
                        </p>
                      )}
                    </div>
                    {visit.weight != null && (
                      <p className="text-sm font-medium">
                        Weight: {visit.weight} kg
                      </p>
                    )}
                  </div>

                  {visit.symptoms?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Symptoms</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {visit.symptoms.map((symptom, index) => (
                          <span
                            key={`${symptom}-${index}`}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {visit.additionalSymptoms && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Additional Symptoms</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {visit.additionalSymptoms}
                      </p>
                    </div>
                  )}
                  {visit.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Notes</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {visit.notes}
                      </p>
                    </div>
                  )}
                  {visit.followUpDate && (
                    <div className="mt-4 border-t pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Follow-up
                      </p>
                      <p className="mt-1 text-sm ">
                        {formatDate(visit.followUpDate)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PHCPatientVisits;
