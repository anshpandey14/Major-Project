import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  Loader2,
  UserRound,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHCPatientANC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [ancRecords, setAncRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAncRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, ancResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/anc/${patientId}`),
      ]);

      const patientData = patientResponse?.data?.data || patientResponse?.data;
      const ancData = ancResponse?.data?.data || ancResponse?.data;

      setPatient(patientData?.patient || patientData);

      setAncRecords(
        ancData?.ancRecords ||
          ancData.anc ||
          (Array.isArray(ancData) ? ancData : []),
      );
    } catch (err) {
      console.error("Failed to fetch ANC records:".err);
      setError(err?.response?.data?.message || "Failed to load ANC records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAncRecords();
  }, [patientId]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRiskStatus = (record) => {
    if (record.isHighRisk) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          High Risk
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 x-2.5 py-1 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Normal
      </span>
    );
  };

  const getTrimester = (week) => {
    if (week == null) return "-";
    if (week <= 12) return "1st Trimester";
    if (week <= 27) return "2nd Trimester";

    return "3rd Trimester";
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

  const highRiskCount = ancRecords.filter((record) => record.isHighRisk).length;

  const latestANC = ancRecords[0];

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
          <h1 className="text-2xl font-bold tracking-tight">ANC Records</h1>
          <p className="text-sm text-muted-foreground">
            {patient?.fullName || "Patient"}
          </p>
        </div>
      </div>

      {!patient?.isPregnant && (
        <Card className="border-yellow-300">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />

            <div>
              <p className="font-medium">
                Patient is not currently marked as pregnant
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                ANC Records are intented for pregnant patients.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={UserRound}
          label="Pateint"
          value={patient?.fullName || "-"}
        />
        <SummaryCard
          icon={HeartPulse}
          label="Total ANC Visits"
          value={ancRecords.length}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="High Risk Records"
          value={highRiskCount}
        />
        <SummaryCard
          icon={CalendarDays}
          label="Latest Visit"
          value={
            latestANC
              ? formatDate(latestANC.visitDate || latestANC.createdAt)
              : "-"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Antenatal Care History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {ancRecords.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
              <HeartPulse className="h-9 w-9 text-muted-foreground" />

              <p className="font-medium">No ANC records</p>
              <p className="text-sm text-muted-foreground">
                No antenatal care visits have been recorder for this pateint.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ancRecords.map((record) => (
                <div
                  key={record._id}
                  className={`rounded-lg border p-4 ${
                    record.isHighRisk ? "border-red-200" : ""
                  }`}
                >
                  <div className="felx flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {formatDate(record.visitDate || record.createdAt)}
                        </p>
                      </div>
                      {record.gestationalWeek != null && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Week {record.gestationalWeek} .{" "}
                          {getTrimester(record.gestationalWeek)}
                        </p>
                      )}
                    </div>
                    {getRiskStatus(record)}
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoItem
                      label="Gestational Week"
                      value={
                        record.gestationalWeek != null
                          ? `${record.gestationalWeek} weeks`
                          : "-"
                      }
                    />
                    <InfoItem
                      label="Weight"
                      value={
                        record.weight != null ? `${record.weight} kg` : "-"
                      }
                    />
                    <InfoItem
                      label="Blood Pressure"
                      value={
                        record.bloodPressure
                          ? `${record.bloodPressure.systolic || "-"}/${record.bloodPressure.diastolic || "-"} mmHg`
                          : "-"
                      }
                    />
                    <InfoItem
                      label="Hemoglobin"
                      value={
                        record.hemoglobin != null
                          ? `${record.hemoglobin} g/dL`
                          : "-"
                      }
                    />
                    <InfoItem
                      label="Fetal Heart Rate"
                      value={
                        record.fetalHeartRate != null
                          ? `${record.fetalHeartRate} bpm`
                          : "-"
                      }
                    />
                    <InfoItem
                      label="Next Visit"
                      value={formatDate(record.nextVisitDate)}
                    />

                    <InfoItem
                      label="Recorded By"
                      value={
                        record.conductedBy?.fullName ||
                        record.conductedBy?.username ||
                        "-"
                      }
                    />
                  </div>

                  {record.isHighRisk && (
                    <div className="mt-5 rounded-md bg-red-50 p-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-700">
                            High-risk ANC record
                          </p>
                          <p className="mt-1 text-xs text-red-600">
                            This record was flagged based on the ANC risk
                            criteria.
                          </p>
                        </div>
                      </div>
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

export default PHCPatientANC;
