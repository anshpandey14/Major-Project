import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2, Plus, Syringe } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const vaccineOptions = [
  "BCG",
  "OPV0",
  "OPV1",
  "OPV2",
  "OPV3",
  "HepB",
  "DPT1",
  "DPT2",
  "DPT3",
  "Measles",
  "Vitamin A",
  "TT1",
  "TT2",
  "Booster",
];

const statusOptions = ["pending", "completed", "overdue"];

const ASHAPatientVaccinations = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vaccine: "",
    customVaccine: "",
    doseNumber: "",
    vaccinationDate: "",
    nextDueDate: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, vaccinationResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/vaccinations/${patientId}`),
      ]);

      const patientData =
        patientResponse?.data?.data?.patient ||
        patientResponse?.data?.patient ||
        patientResponse?.data?.data;

      const vaccinationData =
        vaccinationResponse?.data?.data?.vaccinations ||
        vaccinationResponse?.data?.vaccinations ||
        vaccinationResponse?.data?.data ||
        [];

      setPatient(patientData);
      setVaccinations(Array.isArray(vaccinationData) ? vaccinationData : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load vaccination records.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      vaccine: "",
      customVaccine: "",
      doseNumber: "",
      vaccinationDate: "",
      nextDueDate: "",
      status: "completed",
      notes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        doseNumber: Number(formData.doseNumber),
        vaccinationDate: formData.vaccinationDate,
        status: formData.status,
        notes: formData.notes.trim(),
      };

      if (formData.vaccine) {
        payload.vaccine = formData.vaccine;
      }

      if (formData.customVaccine.trim()) {
        payload.customVaccine = formData.customVaccine.trim();
      }

      if (formData.nextDueDate) {
        payload.nextDueDate = formData.nextDueDate;
      }

      await api.post(`/vaccinations/${patientId}`, payload);

      resetForm();
      setShowForm(false);

      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add vaccination.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getVaccineName = (vaccination) => {
    return vaccination.vaccine || vaccination.customVaccine || "Vaccination";
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/asha/patients/${patientId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient.
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
            onClick={() => navigate(`/asha/patients/${patientId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vaccinations</h1>

            <p className="text-sm text-muted-foreground">{patient.fullName}</p>
          </div>
        </div>

        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Close Form" : "Add Vaccination"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Add Vaccination
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vaccine">Vaccine</Label>

                  <select
                    id="vaccine"
                    name="vaccine"
                    value={formData.vaccine}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select vaccine</option>
                    {vaccineOptions.map((vaccine) => (
                      <option key={vaccine} value={vaccine}>
                        {vaccine}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customVaccine">Custom Vaccine</Label>

                  <Input
                    id="customVaccine"
                    name="customVaccine"
                    value={formData.customVaccine}
                    onChange={handleChange}
                    placeholder="Enter custom vaccine"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doseNumber">Dose Number</Label>

                  <Input
                    id="doseNumber"
                    name="doseNumber"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.doseNumber}
                    onChange={handleChange}
                    placeholder="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccinationDate">Vaccination Date</Label>

                  <Input
                    id="vaccinationDate"
                    name="vaccinationDate"
                    type="date"
                    value={formData.vaccinationDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">Next Due Date</Label>

                  <Input
                    id="nextDueDate"
                    name="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {statusOptions.map((status) => (
                      <option value={status} key={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>

                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add vaccination notes"
                  rows={4}
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Save Vaccination
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vaccination History</CardTitle>
        </CardHeader>

        <CardContent>
          {vaccinations.length === 0 ? (
            <div className="py-10 text-center">
              <Syringe className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

              <p className="font-medium">No vaccinations recorded</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add the patient's vaccination record.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vaccinations.map((vaccination) => (
                <div key={vaccination._id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">
                        {getVaccineName(vaccination)}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Dose {vaccination.doseNumber}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                      {vaccination.status || "-"}
                    </span>
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Vaccination Date
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {formatDate(vaccination.vaccinationDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Next Due</p>

                      <p className="mt-1 text-sm font-medium">
                        {formatDate(vaccination.nextDueDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Administered By
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {vaccination.administeredBy?.fullName ||
                          vaccination.administeredBy?.username ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  {vaccination.notes && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium">Notes</p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {vaccination.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex item-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Recorded on{" "}
                    {formatDate(
                      vaccination.createdAt || vaccination.vaccinationDate,
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ASHAPatientVaccinations;
