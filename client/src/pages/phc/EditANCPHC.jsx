import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EditANCPHC = () => {
  const { patientId, ancId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
    const fetchANC = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [patientResponse, ancResponse] = await Promise.all([
          api.get(`/patients/${patientId}`),
          api.get(`/anc/${patientId}/${ancId}`),
        ]);

        const patientData =
          patientResponse?.data?.data || patientResponse?.data?.patient;

        const ancData = ancResponse?.data?.data || ancResponse?.data?.anc;

        setPatient(patientData);

        setFormData({
          visitDate: ancData?.visitDate ? ancData.visitDate.split("T")[0] : "",
          gestationalWeek: ancData?.gestationalWeek ?? "",
          trimester: ancData?.trimester ?? "",
          weight: ancData?.weight ?? "",
          systolic: ancData?.bloodPressure?.systolic ?? "",
          diastolic: ancData?.bloodPressure?.diastolic ?? "",
          hemoglobin: ancData?.hemoglobin ?? "",
          fetalHeartRate: ancData?.fetalHeartRate ?? "",
          nextVisitDate: ancData?.nextVisitDate
            ? ancData.nextVisitDate.split("T")[0]
            : "",
          notes: ancData?.notes ?? "",
        });
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load ANC record.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchANC();
  }, [patientId, ancId]);

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

      await api.put(`/anc/${patientId}/${ancId}`, {
        visitDate: formData.visitDate,
        gestationalWeek: formData.gestationalWeek
          ? Number(formData.gestationalWeek)
          : undefined,
        trimester: formData.trimester,
        weight: formData.weight ? Number(formData.weight) : undefined,
        bloodPressure: {
          systolic: formData.systolic ? Number(FormData.systolic) : undefined,
          diastolic: formData.diastolic
            ? Number(formData.diastolic)
            : undefined,
        },
        hemoglobin: formData.hemoglobin
          ? Number(formData.hemoglobin)
          : undefined,
        fetalHeartRate: formData.fetalHeartRate
          ? Number(formData.fetalHeartRate)
          : undefined,
        nextVisitDate: formData.nextVisitDate || undefined,
        notes: formData.notes,
      });

      navigate(`/phc/patients/${patientId}/anc`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load ANC record.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading vaccination...</p>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <Button
          className="mt-4"
          onClick={() => navigate(`/phc/patients/${patientId}/anc`)}
        >
          Back
        </Button>
      </div>
    );
  }

  if (patient && !patient.isPregnant) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          This patient is not currently marked as pregnant.
        </p>

        <Button
          className="mt-4"
          onClick={() => navigate(`/phc/patients/${patientId}/anc`)}
        >
          Back to ANC
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
          onClick={() => navigate(`/phc/patients/${patientId}/anc`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold">Edit ANC Record</h1>
          {patient?.fullName && (
            <p className="text-sm text-muted-foreground">
              Patient: {patient.fullName}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ANC Visit Details</CardTitle>
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
              <Label htmlFor="gestationalWeek">Gestational Week</Label>
              <Input
                id="gestationalWeek"
                name="gestationalWeek"
                type="number"
                min="0"
                value={formData.gestationalWeek}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trimester">Trimester</Label>
              <select
                id="trimester"
                name="trimester"
                value={formData.trimester}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Select Trimester</option>
                <option value="1">First Trimester</option>
                <option value="2">Second Trimester</option>
                <option value="3">Third Trimester</option>
              </select>
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
              <Label>Blood Pressure (mmHg)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  name="systolic"
                  type="number"
                  min="0"
                  placeholder="systolic"
                  value={formData.systolic}
                  onChange={handleChange}
                />
                <Input
                  name="diastolic"
                  type="number"
                  min="0"
                  placeholder="diastolic"
                  value={formData.diastolic}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
              <Input
                id="hemoglobin"
                name="hemoglobin"
                type="number"
                step="0.1"
                min="0"
                value={formData.hemoglobin}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fetalHeartRate">Fetal Heart Rate</Label>
              <Input
                id="fetalHeartRate"
                name="fetalHeartRate"
                type="number"
                min="0"
                value={formData.fetalHeartRate}
                onChange={handleChange}
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

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/phc/patients/${patientId}/anc`)}
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

export default EditANCPHC;
