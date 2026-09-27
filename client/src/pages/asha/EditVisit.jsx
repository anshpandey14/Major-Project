import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  "breathlessness",
  "bleeding",
];

const EditVisit = () => {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    visitDate: "",
    weight: "",
    symptoms: [],
    additionalSymptoms: "",
    notes: "",
    followUpDate: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get(`/visits/${patientId}/${visitId}`);
        const visit = response?.data?.data || response?.data?.visit;

        if (!visit) {
          throw new Error("Visit data not found");
        }

        setFormData({
          visitDate: visit.visitDate ? visit.visitDate.split("T")[0] : "",
          weight: visit.weight ?? "",
          symptoms: visit.symptoms || [],
          additionalSymptoms: visit.additionalSymptoms || "",
          notes: visit.notes || "",
          followUpDate: visit.followUpDate
            ? visit.followUpDate.split["T"][0]
            : "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load visit",
        );
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

  const handleSubmit = async (e) => {
    e.prevetDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        visitDate: formData.visitDate,
        symptoms: formData.symptoms,
        additionalSymptoms: formData.additionalSymptoms,
        notes: formData.notes,
        followUpDate: formData.followUpDate || undefined,
      };

      if (formData.weight !== "") {
        payload.weight = Number(formData.weight);
      }

      await api.put(`/visits/${patientId}/${visitId}`, payload);

      navigate(`/asha/patients/${patientId}/visits`);
    } catch (err) {
      setError(
        err?.message?.data?.message || err?.message || "Failed to update visit",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading visit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/asha/patients/${patientId}/visits`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Visit</h1>
          <p className="text-muted-foreground">
            Update the patient's visit Information.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlfor="visitDate">Visit Date</Label>
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
                <Label htmlfor="weight">weight (kg)</Label>
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
                <Label htmlfor="followUpDate">Follow-Up Date</Label>
                <Input
                  id="followUpDate"
                  name="followUpDate"
                  type="date"
                  m
                  value={formData.followUpDate}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Symptoms</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {symptomOptions.map((symptom) => (
                  <Label
                    key={symptom}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Input
                      type="checkbox"
                      checked={formData.symptoms.includes(symptom)}
                      onChange={() => handleSymptomChange(symptom)}
                      className="h-4 w-4 rounded border-input"
                    />

                    <span className="capitalize">{symptom}</span>
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="additionalSymptoms"
                value={formData.additionalSymptoms}
                onChange={handleChange}
                placeholder="Enter any other symptoms..."
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add notes about this visit..."
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/asha/patients/${patientId}/visits`)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditVisit;
