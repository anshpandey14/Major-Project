import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Edit,
  HeartPulse,
  Syringe,
  User,
  Weight,
  Loader2,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ASHAPatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const [patientResponse, timelineResponse] = await Promise.all([
          api.get(`/patietns/${patientId}`),
          api.get(`/patients/${patientId}/timeline`),
        ]);

        const patientData =
          patientResponse?.data?.data?.patient ||
          patientResponse?.data?.patient ||
          patientResponse?.data?.data;

        const timelineData =
          timelineResponse?.data?.data?.timeline ||
          timelineResponse?.data?.timeline ||
          timelineResponse?.data?.data ||
          [];

        setPatient(patientData);
        setTimeline(Array.isArray(timelineData) ? timelineData : []);
      } catch (err) {
        setError(
          err?.reponse?.data?.message || "Failed to load patient information.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
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
    retrun`${age} years`;
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case "visit":
        return <ClipboardList className="h-4 w-4" />;

      case "vaccination":
        return <Syringe className="h-4 w-4" />;

      case "anc":
        return <HeartPulse className="h-4 w-4" />;

      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getTimelineTitle = (item) => {
    switch (item.type) {
      case "visit":
        return "Health Visit";
      case "vaccination":
        return "Vaccination";
      case "anc":
        return "ANC Visit";
      default:
        return "Patient Activity";
    }
  };

  const getTimelinePath = (type) => {
    switch (type) {
      case "visit":
        return `/asha/patients/${patientId}/visits`;
      case "vaccination":
        return `/asha/patients/${patientId}/vaccinations`;
      case "anc":
        return `/asha/patients/${patientId}/anc`;
      default:
        return `/asha/patients/${patientId}`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/asha/patients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/asha/patients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>
        <p className="text-muted-foreground">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/asha/patients")}
          >
            <ArrowLeft className="h-5 w-5" />
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

        <Button
          variant="outline"
          onClick={() => navigate(`/asha/patients/${patientId}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="mt-1 font-medium">{patient.fullName || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="mt-1 font-medium">{patient.phone || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Village</p>
              <p className="mt-1 font-medium">{patient.village || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="mt-1 font-medium">{patient.gender || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="mt-1 font-medium">{formatDate(patient.dob)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="mt-1 font-medium">{calculateAge(patient.dob)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="mt-1 font-medium">
                {patient.bloodGroup || "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Physical Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="mt-1 font-medium">
                {patient.weight != null ? `${patient.weight} kg` : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Height</p>
              <p className="mt-1 font-medium">
                {patient.height != null ? `${patient.height} cm` : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Pregnancy</p>
              <p className="mt-1 font-medium">
                {patient.isPregnant ? "Pregnant" : "Not Pregnant"}
              </p>
            </div>

            {patient.isPregnant && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Last Menstrual Period
                </p>
                <p className="mt-1 font-medium">
                  {formatDate(patient.lmpDate)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate(`/asha/patients/${patientId}/visits`)}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">Health Visits</p>
              <p className="text-sm text-muted-foreground">
                View patient visits
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate(`/asha/patients/${patientId}/vaccinations`)}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3">
              <Syringe className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">Vaccinations</p>
              <p className="text-sm text-muted-foreground">
                View vaccination history
              </p>
            </div>
          </CardContent>
        </Card>

        {patient.isPregnant && (
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/asha/patients/${patientId}/anc`)}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-muted p-3">
                <HeartPulse className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold">ANC</p>
                <p className="text-sm text-muted-foreground">
                  Antenatal care Records
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Timeline</CardTitle>
        </CardHeader>

        <CardContent>
          {timeline.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No health records yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Visits, vaccinations and ANC reocrds will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div
                  key={
                    item._id || item.id || `${item.type}-${item.date}-${index}`
                  }
                  className="flex gap-4"
                >
                  <div className="flex flex-col item-center">
                    <div className="rounded-full border bg-muted p-2">
                      {gettimelineIcon(item.type)}
                    </div>
                    {index !== timeline.length - 1 && (
                      <div className="mt-2 h-full w-px bg-border" />
                    )}
                  </div>
                  <Button
                    type="button"
                    className="flex-1 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                    onClick={() => navigate(getTimelinePath(item.type))}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium">{getTimelineTitle(item)}</p>

                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.date)}
                      </p>
                    </div>

                    {item.type === "vaccination" && item.vaccine && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Vaccine: {item.vaccine}
                      </p>
                    )}

                    {item.type === "visit" && item.notes && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.notes}
                      </p>
                    )}

                    {item.type === "anc" && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Antenatal care record
                      </p>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ASHAPatientDetails;
