import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Baby,
  CalendarDays,
  ClipboardList,
  Droplets,
  HeartPulse,
  Loader2,
  Syringe,
  UserRound,
  Weight,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHCPatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, timelineResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/patients/${patientId}/timeline`),
      ]);

      const patientData = patientResponse?.data?.data || patientResponse?.data;
      const timelineData =
        timelineResponse?.data?.data || timelineResponse?.data;
      setPatient(patientData?.patient || patientData);
      setTimeline(timelineData?.timeline || timelineData || []);
    } catch (err) {
      console.error("Failed to fetch patient:", err);
      setError(
        err?.response?.data?.message || "Failed to load patient information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return `${age} years`;
  };

  const getTimelineIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "visit":
        return <ClipboardList className="h-4 w-4" />;
      case "vaccination":
        return <Syringe className="h-4 w-4" />;
      case "anc":
        return <HeartPulse className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTimelineTitle = (item) => {
    switch (item.type?.toLowerCase()) {
      case "visit":
        return "Health Visit";
      case "vaccination":
        return "Vaccination";
      case "anc":
        return "ANC Visit";
      default:
        return "Health Record";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">{error || "Patient not found."}</p>
        <Button variant="outline" onClick={() => navigate("/phc/patients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/phc/patients")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {patient.fullName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Patient details and health history
            </p>
          </div>
        </div>

        {patient.isPregnant && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-pink-100 px-3 py-1.5 text-sm font-medium text-pink-700">
            <Baby className="h-4 w-4" />
            Pregnant
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Full Name" value={patient.fullName} />
            <InfoItem label="Age" value={calculateAge(patient.dob)} />
            <InfoItem label="Date of Birth" value={formatDate(patient.dob)} />
            <InfoItem label="Gender" value={patient.gender || "-"} />
            <InfoItem label="Phone" value={patient.phone || "-"} />
            <InfoItem label="Village" value={patient.village || "-"} />
            <InfoItem
              label="Blood Group"
              value={patient.bloodGroup || "Unknown"}
            />
            <InfoItem
              label="Weight"
              value={patient.weight ? `${patient.weight} kg` : "-"}
            />
            <InfoItem
              label="Height"
              value={patient.height ? `${patient.height} cm` : "-"}
            />
            <InfoItem
              label="AssignedASHA"
              value={
                patient.assignedASHA?.fullName ||
                patient.assignedASHA?.username ||
                "-"
              }
            />
            <InfoItem
              label="Patient Since"
              value={formatDate(patient.createdAt)}
            />
            {patient.isPregnant && (
              <InfoItem label="LMP Date" value={formatDate(patient.lmpDate)} />
            )}
          </div>
        </CardContent>
      </Card>

      {patient.isPregnant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5" />
              Pregnancy Information
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Pregnancy Status" value="Pregnant" />
              <InfoItem label="LMP Date" value={formatDate(patient.lmpDate)} />
              <InfoItem
                label="ANC Records"
                value={
                  timeline.filter((item) => item.type?.toLowerCase() === "anc")
                    .length
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Health Timeline
          </CardTitle>
        </CardHeader>

        <CardContent>
          {timeline.length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No health records yet</p>
              <p className="text-sm text-muted-foreground">
                Visits, vaccinations and ANC records will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div
                  key={item._id || `${item.type}-${item.date}-${index}`}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getTimelineIcon(item.type)}
                    </div>
                    {index !== timeline.length - 1 && (
                      <div className="mt-2 h-full min-h-8 w-px bg-border" />
                    )}
                  </div>

                  <div className="pb-5">
                    <p className="font-medium">{getTimelineTitle(item)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          icon={ClipboardList}
          title="Visits"
          description="View patient visits"
          onClick={() => navigate(`/phc/patients/${patientId}/visits`)}
        />
        <ActionCard
          icon={Syringe}
          title="Vaccinations"
          description="view vaccination records"
          onClick={() => navigate(`/phc/pateints/${patientId}/vaccinations`)}
        />
        <ActionCard
          icon={HeartPulse}
          title="ANC Records"
          description="View Pregnancy records"
          onClick={() => navigate(`/phc/pateints/${patientId}/anc`)}
        />
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>

    <p className="mt-1 text-sm font-medium">{value}</p>
  </div>
);

const ActionCard = ({ icon: Icon, title, description, onClick }) => (
  <Card
    className="cursor-pointer transition hover:bg-muted/50"
    onClick={onClick}
  >
    <CardContent className="flex items-center gap-4 pt-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

export default PHCPatientDetails;
