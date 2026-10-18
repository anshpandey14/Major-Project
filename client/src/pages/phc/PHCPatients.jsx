import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Baby,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PHCPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patient", {
        params: {
          page,
          limit: 10,
          ...(search.trim() && { search: search.trim() }),
        },
      });

      const data = response?.data?.data || response?.data;
      setPatients(data?.patients || []);

      setPagination(
        data?.pagination || {
          total: 0,
          totalPages: 1,
          currentPage: page,
          limit: 10,
        },
      );
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load patients. Please try again",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getGenderLabel = (gender) => {
    if (!gender) return "-";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const getPregnancyLabel = (patient) => {
    if (!patient.isPregnant) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-1 text-xs font-medium text-pink-700">
          <Baby className="h-3.5 w-3.5" />
          Pregnant
        </span>
      );
    }

    return <span className="text-sm text-muted-foreground">Not Pregnant</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          View and manage patients registered under the PHC.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, phone or village..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Patients</CardTitle>

            <span className="text-sm text-muted-foreground">
              {pagination.total || 0} patients
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchPatients}>
                Try Again
              </Button>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
              <UserRound className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No Patients found</p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Try a different search."
                  : "No patients have been registered yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 font-medium">Patient</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Village</th>
                      <th className="px-4 py-3 font-medium">Gender</th>
                      <th className="px-4 py-3 font-medium">Pregnancy</th>
                      <th className="px-4 py-3 font-medium">Assigned ASHA</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => {
                      return (
                        <tr
                          key={patient._id}
                          className="border-b last:border:0 hover:bg-muted/50"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium">{patient.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {patient._id}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">{patient.phone || "-"}</td>
                          <td className="px-4 py-4">
                            {patient.village || "-"}
                          </td>
                          <td className="px-4 py-4">
                            {getGenderLabel(patient.gender)}
                          </td>
                          <td className="px-4 py-4">
                            {getPregnancyLabel(patient)}
                          </td>
                          <td className="px-4 py-4">
                            {patient.assignedASHA?.fullName ||
                              patient.assignedASHA?.username ||
                              "-"}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/phc/patients/${patient._id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {patients.map((patient) => (
                  <div key={patient._id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{patient.fullName}</p>

                        <p className="text-sm text-muted-foreground">
                          {patient.phone || "No phone"}
                        </p>
                      </div>
                      {patient.isPregnant && (
                        <Baby className="h-5 w-5 text-pink-600" />
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Village</p>
                        <p>{patient.village || "-"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p>{getGenderLabel(patient.gender)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Assigned ASHA
                        </p>
                        <p>
                          {patient.assignedASHA?.fullName ||
                            patient.assignedASHA?.username ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Pregnancy
                        </p>
                        {getPregnancyLabel(patient)}
                      </div>
                    </div>

                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => navigate(`/phc/patients/${patient._id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Patient
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.currentPage || page} of{" "}
                  {pagination.totalPages || 1}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (pagination.totalPages || 1)}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PHCPatients;
