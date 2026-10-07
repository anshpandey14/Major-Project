import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EditVisitPHC = () => {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    visitDate: "",
    weight: "",
    symptoms: "",
    additionalSymptoms: "",
    notes: "",
    followUpDate: "",
  });

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [patientResponse, visitResponse] = await Promise.all([
          api.get(`/patients/${patientId}`),
          api.get(`/visits/${patientId}/${visitId}`),
        ]);

        const patientData =
          patientResponse?.data?.data || patientResponse?.data?.patient;

        const visitData = visitResponse?.data?.visit;

        setPatient(patientData);

        setFormData({
          visitDate: visitData?.visitDate
            ? visitData.visitDate.split("T")[0]
            : "",
          weight: visitData?.weight ?? "",
          symptoms: visitData?.symptoms ?? "",
          additionalSymptoms: visitData?.additionalSymptoms ?? "",
          notes: visitData?.notes ?? "",
          followUpDate: visitData?.followUpDate
            ? visitData.followUpDate.split("T")[0]
            : "",
        });
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load visit.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisit();
  }, [patientId, visitId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError("");

      await api.put(`/visits/${patientId}/${visitId}`, {
        visitDate: formData.visitDate,
        weight: formData.weight ? Number(formData.weight) : undefined,
        additionalSymptoms: formData.additionalSymptoms,
        notes: formData.notes,
        followUpDate: formData.followUpDate || undefined,
      });

      navigate(`/phc/patients/${patientId}/visits`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load visit.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading visit...</p>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <Button
          className="mt-4"
          onClick={() => navigate(`/phc/patients/${patientId}/visits`)}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/phc/patients/${patientId}/visits`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold">Edit Visit</h1>
          {patient?.fullName && (
            <p className="text-sm text-muted-foreground">
              Patient: {patient.fullName}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Input
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalSymptoms">Additional Symptoms</Label>
              <textarea
                id="additionalSymptoms"
                name="additionalSymptoms"
                value={formData.additionalSymptoms}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                name="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/phc/patients/${patientId}/visits`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditVisitPHC;
