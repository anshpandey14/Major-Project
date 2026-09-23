import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Loader2,
  Plus,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const symptomOptions = [
  "fever",
  "cough",
  "vomiting",
  "headache",
  "fatigue",
  "dizziness",
  "chest pain",
  "abdominal pain",
  "swelling",
  "breathlessnes",
  "bleeding",
];

const ASHAPatientVisits = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    visitDate: "",
    weight: "",
    symptoms: [],
    additionalSymptoms: "",
    notes: "",
    followUpDate: "",
  });

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, visitsResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/visits/${patientId}`),
      ]);

      const patientData =
        patientResponse?.data?.data?.patient ||
        patientResponse?.data?.patient ||
        patientResponse?.data?.data;

      const visitsData =
        visitsResponse?.data?.data?.visits ||
        visitsResponse?.data?.visits ||
        visitsResponse?.data?.data ||
        [];

      setPatient(patientData);
      setVisits(Array.isArray(visitsData) ? visitsData : []);
    } catch (err) {
      setError(
        err?.reposnse?.data?.message || "Failed to load patient visits.",
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

  const handleSymptomChange = (symptom) => {
    setFormData((prev) => {
      const alreadySelected = prev.symptoms.includes(symptom);

      return {
        ...prev,
        symptoms: alreadySelected
          ? prev.symptoms.filter((item) => item !== symptom)
          : [...prev.symptoms, symptom],
      };
    });
  };

  const resetForm = () => {
    setFormData({
      visitDate: "",
      weight: "",
      symptom: [],
      additionalSymptoms: "",
      notes: "",
      followUpDate: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        visitDate: formData.visitDate,
        symptoms: formData.symptoms,
        additionalSymptoms: formData.additionalSymptoms.trim(),
        notes: formData.notes.trim(),
      };

      if (formData.weight !== "") {
        payload.weight = Number(formData.weight);
      }

      if (formData.followUpDate) {
        payload.followUpDate = formData.followUpDate;
      }

      await api.post(`/visits/${patientId}`, payload);

      resetForm();
      setShowForm(false);

      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0].msg ||
          "Failed to add visit.",
      );
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
          Back to Patient
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
            <h1 className="text-2xl font-bold tracking-tight">Health Visits</h1>

            <p className="text-sm text-muted-foreground">{patient.fullName}</p>
          </div>
        </div>

        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Close Form" : "Add Visit"}
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
            <CardTitle>Add Health Visit</CardTitle>
          </CardHeader>

          <CardContent>
            <form onsubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Visit Date</Label>

                  <Input
                    id="visitDate"
                    name="visitDate"
                    type="date"
                    value={formData.visitDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>

                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 55.5"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Symptoms</Label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {symptomOptions.map((symptom) => (
                    <Label
                      key={symptom}
                      className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted/50"
                    >
                      <Input
                        type="checkbox"
                        checked={formData.symptoms.includes(symptom)}
                        onChange={() => handleSymptomChange(symptom)}
                        className="h-4 w-4"
                      />

                      <span className="capitalize">{symptom}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalSymptoms">Additional Symptoms</Label>
                <Input
                  id="additionalSymptoms"
                  name="additionalSymptoms"
                  value={formData.additionalSymptoms}
                  onChange={handleChange}
                  placeholder="Enter any other symptoms"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add observtions or notes"
                  rows={4}
                  className="flx min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="max-w-md space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>

                <Input
                  id="followUpDate"
                  name="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={handleChange}
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
                      Save Visit
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
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Visit History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {visits.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No visits recorded</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add the patient's first health visit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div key={visit._id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">Health Visit</p>

                      <p className="text-sm text-muted-foreground">
                        {formatDate(visit.visitDate)}
                      </p>
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
                        {visit.symptoms.map((symptom) => (
                          <span
                            key={symptom}
                            className="rounded-full bg-muted px-3 py-1 text-xs capitalize"
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

                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                        {visit.notes}
                      </p>
                    </div>
                  )}

                  {visit.followUpDate && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4" />
                      <span className="font-medium">Follow-up:</span>
                      <span className="text-muted-foreground">
                        {formatDate(visit.followUpDate)}
                      </span>
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

export default ASHAPatientVisits;
