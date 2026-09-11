import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Syringe,
  UserRound,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHCPatientVaccinations = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, vaccinationResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/vaccinations/${patientId}`),
      ]);

      const patientData = patient?.data?.data || patientResponse?.data;
      const vaccinationData =
        vaccinationResponse?.data?.data || vaccinationResponse?.data;
      setPatient(patientData?.patient || patientData);
      setVaccinations(
        vaccinationData?.vaccinations ||
          (Array.isArray(vaccinationData) ? vaccinationData : []),
      );
    } catch (err) {
      console.error("Failed to fetch vaccinations:", err);
      setError(
        err?.response?.data?.message || "Failed to load vaccination records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, [patientId]);
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (vaccination) => {
    if (vaccination.status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      );
    }

    if (vaccination.status === "overdue") {
      return (
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
          Overdue
        </span>
      );
    }

    return (
      <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
        Pending
      </span>
    );
  };

  const getVaccineName = (vaccination) => {
    return (
      vaccination.vaccine || vaccination.customVaccine || "Unknown Vaccine"
    );
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
      <div className="flex min-0h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>

        <Button
          variant="outline"
          onClick={() => NavigateEvent(`/phc/patients/${patientId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Button>
      </div>
    );
  }

  const completedCount = vaccinations.filter(
    (item) => item.status === "completed",
  ).length;

  const pendingCount = vaccinations.filter(
    (item) => item.status === "pending",
  ).length;

  const overdueCount = vaccinations.filter(
    (item) => item.status === "overdue",
  ).length;

  return (
    <div className="sapce-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/phc/patients/${patientId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vaccination Records
          </h1>

          <p className="text-sm text-muted-foreground">
            {patient?.fullName || "Patient"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={UserRound}
          label="Patient"
          value={patient.fullName || "-"}
        />
        <SummaryCard
          icon={Syringe}
          label="Total Vaccinations"
          value={vaccinations.length}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
        />
        <SummaryCard
          icon={CalendarDays}
          label="Pending / Overdue"
          value={pendingCount + overdueCount}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Vaccination History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {vaccinations.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
              <Syringe className="h-9 w-9 text-muted-foreground" />
              <p className="font-medium">No vaccination records</p>
              <p className="text-sm text-muted-foreground">
                No vaccinations have been recorded for this patient.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vaccinations.map((vaccination) => (
                <div key={vaccination._id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {getVaccineName(vaccination)}
                        </p>
                      </div>
                      {vaccination.doseNumber != null && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Dose {vaccination.doseNumber}
                        </p>
                      )}
                    </div>
                    {getStatus(vaccination)}
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                      label="Vaccination Date"
                      value={formatDate(vaccination.vaccinationDate)}
                    />
                    <InfoItem
                      label="Next Due Date"
                      value={formatDate(vaccination.nextDueDate)}
                    />
                    <InfoItem
                      label="Administered By"
                      value={
                        vaccination.administeredBy?.fullName ||
                        vaccination.administeredBy?.username ||
                        "-"
                      }
                    />
                  </div>

                  {vaccination.notes && (
                    <div className="mt-4 border-t pt-3">
                      <p className="text-sm font-medium">Notes</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {vaccination.notes}
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

const SummaryCard = ({ icon: Icon, label, value }) => (
  <Card>
    <CardContent className="flex items-center gap-4 pt-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium">{value}</p>
  </div>
);

export default PHCPatientVaccinations;
