import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Baby,
  CalendarCheck,
  ClipboardList,
  Loader2,
  Users,
  Syringe,
  HeartPulse,
} from "lucide-react";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StatCard = ({ title, value, icon: Icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="size-5 text-muted-foreground" />
    </CardHeader>

    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const PHCDashboard = () => {
  const [patientStats, setPatientStats] = useState(null);
  const [vaccinationStats, setVaccinationStats] = useState(null);
  const [ancStats, setAncStats] = useState(null);

  const [overdueVaccinations, setOverdueVaccinations] = useState([]);
  const [highRiskANC, setHighRiskANC] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          patientResponse,
          vaccinationResponse,
          ancResponse,
          overdueResponse,
          highRiskResponse,
        ] = await Promise.all([
          api.get("/patient/stats"),
          api.get("/vaccination/stats"),
          api.get("/anc/stats"),
          api.get("/vaccination/overdue?limit=5"),
          api.get("/anc/high-risk?limit=5"),
        ]);

        setPatientStats(patientResponse.data?.data);
        setVaccinationStats(vaccinationResponse.data?.data);
        setAncStats(ancResponse.data?.data);

        setOverdueVaccinations(overdueResponse.data?.data?.vaccinations || []);

        setHighRiskANC(highRiskResponse.data?.data?.ancRecords || []);
      } catch (err) {
        console.error("Failed to load PHC dashboard:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard statistics.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="flex min-h-60 items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-3 size-8 text-destructive" />
              <p className="font-medium">Unable to load Dashboard</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PHC Dashboard</h1>
        <p className="text-muted-foreground">
          OVerview of patients, maternal care and vaccinations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={patientStats?.totalPatients ?? 0}
          icon={Users}
          description={`${patientStats?.addedThisMonth ?? 0} added this month`}
        />

        <StatCard
          title="Pregnant Patients"
          value={patientStats?.pregnantPatients ?? 0}
          icon={Baby}
          description="Currently registered"
        />

        <StatCard
          title="ANC Visits This Month"
          value={ancStats?.totalANCVisitsThisMonth ?? 0}
          icon={HeartPulse}
          description={`${ancStats?.highRiskPatients ?? 0} high-risk records`}
        />

        <StatCard
          title="Vaccinations This Month"
          value={vaccinationStats?.totalVaccinationsThisMonth ?? 0}
          icon={Syringe}
          description="Completed vaccination records"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Male Patients"
          value={patientStats?.malePatients ?? 0}
          icon={Users}
        />

        <StatCard
          title="female Patients"
          value={patientStats?.femalePatients ?? 0}
          icon={Users}
        />

        <StatCard
          title="Average Hemoglobin"
          value={
            ancStats?.averageHemoglobin
              ? `${ancStats.averageHemoglobin} g/dL`
              : "0 g/dL"
          }
          icon={HeartPulse}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5" />
                High-Risk ANC
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Recent high-risk ANC records
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              render={<Link to="/phc/patients" />}
            >
              View Patients
            </Button>
          </CardHeader>

          <CardContent>
            {highRiskANC.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No high-risk ANC records found.
              </p>
            ) : (
              <div className="space-y-3">
                {highRiskANC.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {record.patient?.fullName || "Unknown patient"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.patient?.village || "Village unavailable"}
                      </p>
                    </div>

                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                      High Risk
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="size-5" />
                Overdue Vaccinations
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Vaccinations requiring attention
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              render={<Link to="/phc/patients" />}
            >
              View Patients
            </Button>
          </CardHeader>

          <CardContent>
            {overdueVaccinations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No overdue vaccinations found.
              </p>
            ) : (
              <div className="space-y-3">
                {overdueVaccinations.map((vaccination) => (
                  <div
                    key={vaccination._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {vaccination.patient?.fullName || "Unknown patient"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {vaccination.vaccine ||
                          vaccination.customVaccine ||
                          "Vaccination"}
                      </p>
                    </div>

                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-sm font-medium text-destructive">
                      Overdue
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Button render={<Link to="/phc/patients" />}>
            <Users className="mr-2 size-4" />
            View Patients
          </Button>

          <Button variant="outline" render={<Link to="/phc/patients" />}>
            <ClipboardList className="mr-2 size-4" />
            Patient Records
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PHCDashboard;
