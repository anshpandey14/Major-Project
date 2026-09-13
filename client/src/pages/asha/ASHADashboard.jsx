import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Baby,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Loader2,
  Syringe,
  Users,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ASHADashboard = () => {
  const [patientStats, setPatientStats] = useState(null);
  const [vaccinationStats, setVaccinationsStats] = useState(null);
  const [ancStats, setAncStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [pateintResponse, vaccinationResponse, ancResponse] =
        await Promise.all([
          api.get("/patients/stats"),
          api.get("/vaccinations/stats"),
          api.get("/anc/stats"),
        ]);

      const patientData = pateintResponse?.data?.data || pateintResponse?.data;
      const vaccinationData =
        vaccinationResponse?.data?.data || vaccinationResponse?.data;
      const ancData = ancResponse?.data?.data || ancResponse?.data;
      setPatientStats(patientData);
      setVaccinationsStats(vaccinationData);
      setAncStats(ancData);
    } catch (err) {
      console.error("Failed to load ASHA dashboard:", err);
      setError(
        err?.response?.data?.message || "Failed to laod dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

        <Button variant="outline" onClick={fetchDashboardData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ASHA Dashboard</h1>

        <p className="text-muted-foreground">
          Overview of your patients and healthcare activities.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="My Patients"
          value={patientStats?.totalPatients ?? 0}
        />
        <StatCard
          icon={Baby}
          title="Pregnant Patients"
          value={patientStats?.pregnantPatients ?? 0}
        />
        <StatCard
          icon={Users}
          title="Male Patients"
          value={patientStats?.malePatients ?? 0}
        />
        <StatCard
          icon={Users}
          title="Female Patients"
          value={patientStats?.femalePatients ?? 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          title="Added This Month"
          value={patientStats?.addedThisMonth ?? 0}
        />
        <StatCard
          icon={Syringe}
          title="Vaccinations This Month"
          value={vaccinationStats?.totalVaccinationsThisMonth ?? 0}
        />
        <StatCard
          icon={HeartPulse}
          title="ANC Visits This Month"
          value={ancStats?.totalANCVisitsThisMonth ?? 0}
        />
        <StatCard
          icon={Activity}
          title="High-Risk ANC"
          value={ancStats?.highRiskPatients ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols">
        <Card>
          <CardHeader>
            <CardTitle>Blood Group Distribution</CardTitle>
          </CardHeader>

          <CardContent>
            {patientStats?.bloodGroupStats?.length > 0 ? (
              <div className="space-y-3">
                {patientStats.bloodGroupStats.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-center rounded-lg border p-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.count} patients
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No blood group data available." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ANC Trimester Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {ancStats?.trimesterCounts?.length > 0 ? (
              <div className="space-y-3">
                {ancStats.trimesterCounts.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="font-medium">{item._id || "Unknown"}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} Visits
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No ANC data available." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              icon={Users}
              title="My Patients"
              description="View and manage your patients"
              to="/asha/patients"
            />
            <QuickAction
              icon={ClipboardList}
              title="Record Visit"
              description="Add a health visit"
              to="/asha/patients"
            />
            <QuickAction
              icon={Syringe}
              title="Vaccination"
              description="Record vaccination"
              to="/asha/patients"
            />
            <QuickAction
              icon={HeartPulse}
              title="ANC Visit"
              description="Record antenatal care"
              to="/asha/patients"
            />
            <QuickAction
              icon={Baby}
              title="Pregnancy Care"
              description="View pregnant patients"
              to="/asha/patients"
            />
            <QuickAction
              icon={Activity}
              title="Health Records"
              description="View patient history"
              to="/asha/patients"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value }) => (
  <Card>
    <CardContent className="flex items-center gap-4 pt-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const QuickAction = ({ icon: Icon, title, description, to }) => (
  <Button asChild variant="outline" className="h-auto justify-start p-4">
    <Link to={to}>
      <Icon className="mr-3 h-5 w-5 shrink-0" />
      <span className="text-left">
        <span className="block font-medium">{title}</span>
        <span className="block text-xs font-normal text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  </Button>
);

const EmptyState = ({ text }) => (
  <div className="py-8 text-center text-sm text-muted-foreground">{text}</div>
);

export default ASHADashboard;
