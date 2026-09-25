import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  HeartPulse,
  Loader2,
  Plus,
  TriangleAlert,
} from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ASHAPatientANC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [ancRecords, setAncRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    visitDate: "",
    gestationalWeek: "",
    trimester: "",
    weight: "",
    systolic: "",
    diastolic: "",
    hemoglobin: "",
    fetalHeartRate: "",
    nextVisitDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, ancResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/anc/${patientId}`),
      ]);

      const patientData =
        patientResponse?.data?.data?.patient ||
        patientResponse?.data?.patient ||
        patientResponse?.data?.data;

      const ancData =
        ancResponse?.data?.data?.anc ||
        ancResponse?.data?.data?.ancRecords ||
        ancResponse?.data?.anc ||
        ancResponse?.data?.ancRecords ||
        ancResponse?.data?.data ||
        [];

      setPatient(patientData);
      setAncRecords(Array.isArray(ancData) ? ancData : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load ANC records.");
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
      visitDate: "",
      gestationalWeek: "",
      trimester: "",
      weight: "",
      systolic: "",
      diastolic: "",
      hemoglobin: "",
      fetalHeartRate: "",
      nextVisitDate: "",
      notes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        visitDate: formData.visitDate,
        gestationalWeek: Number(formData.gestationalWeek),
        trimester: Number(formData.trimester),
        bloodPressure: {
          systolic: Number(formData.systolic),
          diastolic: Number(formData.diastolic),
        },
        hemoglobin: Number(formData.hemoglobin),
        notes: formData.notes.trim(),
      };

      if (formData.weight !== "") {
        payload.weight = Number(formData.weight);
      }

      if (formData.fetalHeartRate !== "") {
        payload.fetalHeartRate = Number(formData.fetalHeartRate);
      }

      if (formData.nextVisitDate) {
        payload.nextVisitDate = formData.nextVisitDate;
      }

      await api.post(`/anc/${patientId}`, payload);

      resetForm();
      setShowForm(false);

      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.msg ||
          "Failed to add ANC  record.",
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

  const getBloodPressure = (record) => {
    if (!record.bloodPressure) return "-";

    return `${record.bloodPressure.systolic ?? "-"}/${record.bloodPressure.diastolic ?? "-"} mmHg`;
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

  if (!patient.isPregnant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/asha/patients/${patientId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">ANC</h1>
            <p className="text-sm text-muted-foreground">{patient.fullName}</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <TriangleAlert className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">ANC is not available</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This patient is not currently marked as pregnant. ANC records can
              only be recorded for pregnant patients.
            </p>

            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate(`/asha/patients/${patientId}`)}
            >
              Back to Patient
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const highRiskCount = ancRecords.filter((record) => record.isHighRisk).length;

  const latestRecord = ancRecords[0];

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
            <h1 className="text-2xl font-bold tracking-tight">ANC</h1>
            <p className="text-sm text-muted-foreground">{patient.fullName}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Close Form" : "Add ANC Visit"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">LMP</p>

            <p className="mt-1 font-semibold">{formatDate(patient.lmpDate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">ANC Visits</p>
            <p className="mt-1 text-2xl font-bold">{ancRecords.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">High-Risk Records</p>

            <p className="mt-1 text-2xl font-bold">{highRiskCount}</p>
          </CardContent>
        </Card>
      </div>

      {latestRecord?.isHighRisk && (
        <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

          <div>
            <p className="font-semibold text-destructive">
              High-Risk ANC Record
            </p>

            <p className="mt-1 text-sm text-destructive/80">
              The latest ANC record has been classified as high-risk based on
              the recorded clinical values.
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5" />
              Add ANC Visit
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Visit Details</h3>

                <div className="grid gap-4 md:grid-cols-3">
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
                    <Label htmlFor="gestationalWeek">Gestational Week</Label>

                    <Input
                      id="gestationalWeek"
                      name="gestationalWeek"
                      type="Number"
                      min="0"
                      value={formData.gestationalWeek}
                      onChange={handleChange}
                      placeholder="e.g. 20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trimester">Trimester</Label>

                    <select
                      id="trimester"
                      name="trimester"
                      value={formData.trimester}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Select trimester</option>
                      <option value="1">First trimester</option>
                      <option value="2">Second trimester</option>
                      <option value="3">Third trimester</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Measurements</h3>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (Kg)</Label>

                    <Input
                      id="weight"
                      name="weight"
                      type="Number"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="e.g. 58.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systolic">Systolic BP</Label>

                    <Input
                      id="systolic"
                      name="systolic"
                      type="Number"
                      min="0"
                      value={formData.systolic}
                      onChange={handleChange}
                      placeholder="e.g. 120"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diastolic">Diastolic BP</Label>

                    <Input
                      id="diastolic"
                      name="diastolic"
                      type="Number"
                      min="0"
                      value={formData.diastolic}
                      onChange={handleChange}
                      placeholder="e.g. 80"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>

                    <Input
                      id="hemoglobin"
                      name="hemoglobin"
                      type="Number"
                      min="0"
                      value={formData.hemoglobin}
                      onChange={handleChange}
                      placeholder="e.g. 11.5"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Fetal Information</h3>

                <div className="max-w-md space-y-2">
                  <Label htmlFor="fetalHeartRate">Fetal Heart Rate (bpm)</Label>

                  <Input
                    id="fetalHeartRate"
                    name="fetalHeartRate"
                    type="Number"
                    min="0"
                    value={formData.fetalHeartRate}
                    onChange={handleChange}
                    placeholder="e.g. 140"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Follow-up</h3>

                <div className="max-w-md space-y-2">
                  <Label htmlFor="nextVisitDate">Next Visit Date</Label>
                  <Input
                    id="nextVisitDate"
                    name="nextVisitDate"
                    type="date"
                    value={formData.nextVisitDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add ANC observations or notes"
                  rows={4}
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
                      Save ANC Visit
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
            <HeartPulse className="h-5 w-5" />
            ANC History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {ancRecords.length === 0 ? (
            <div className="py-10 text-center">
              <HeartPulse className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No ANC Visits recorder</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add the patient's first ANC Visit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ancRecords.map((record) => (
                <div key={record._id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">ANC Visit</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.visitDate)}
                      </p>
                    </div>

                    {record.isHighRisk && (
                      <span className="flex w-fit items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                        <TriangleAlert className="h-3 w-3" />
                        High Risk
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Gestational Week
                      </p>

                      <p className="mt-1 font-medium">
                        {record.gestationalWeek != null
                          ? `${record.gestationalWeek} Weeks`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Trimester</p>

                      <p className="mt-1 font-medium">
                        {record.trimester
                          ? `Trimester ${record.gestationalWeek}`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Blood Pressure
                      </p>
                      <p className="mt-1 font-medium">
                        {getBloodPressure(record)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Hemoglobin
                      </p>
                      <p className="mt-1 font-medium">
                        {record.hemoglobin != null
                          ? `${record.hemoglobin} g/dL`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="mt-1 font-medium">
                        {record.weight != null ? `${record.weight} kg` : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fetal Heart Rate
                      </p>
                      <p className="mt-1 font-medium">
                        {record.fetalHeartRate != null
                          ? `${record.fetalHeartRate} bpm`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Next Visit
                      </p>
                      <p className="mt-1 font-medium">
                        {formatDate(record.nextVisitDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Recorder By
                      </p>
                      <p className="mt-1 font-medium">
                        {record.recorderBy?.fullName ||
                          record.recorderBy?.username ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium">Notes</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Visit Date: {formatDate(record.visitDate)}
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

export default ASHAPatientANC;
