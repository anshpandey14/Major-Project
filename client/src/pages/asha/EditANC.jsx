import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EditANC = () => {
  const { patientId, ancId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [patientResponse, ancResponse] = await Promise.all([
          api.get(`/patients/${patientId}`),
          api.get(`/anc/${patientId}/${ancId}`),
        ]);

        const patientData =
          patientResponse?.data?.data || patientResponse?.data?.patient;

        const anc = ancResponse?.data.data || ancResponse?.data?.anc;

        if (!patientResponse) {
          throw new Error("Patient data not found");
        }

        if (!anc) {
          throw new Error("ANC record not found");
        }

        setPatient(patientData);

        setFormData({
          visitDate: anc.visitDate ? anc.visitDate.split("T")[0] : "",
          gestationalWeek: anc.gestationalWeek ?? "",
          trimester: anc.trimester ?? "",
          weight: anc.weight ?? "",
          systolic: anc?.bloodPressure?.systolic ?? "",
          diastolic: anc.bloodPressure.diastolic ?? "",
          hemoglobin: anc.hemoglobin ?? "",
          fetalHeartRate: anc.fetalHeartRate ?? "",
          nextVisitDate: anc.nextVisitDate
            ? anc.nextVisitDate.split("T")[0]
            : "",
          notes: anc.notes || "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load ANC record.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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
    if (!patient?.isPregnant) {
      setError("ANC records can only be updated for pregnant patients.");
      return;
    }
    try {
      setIsSaving(true);
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

        notes: formData.notes,
      };

      if (formData.weight !== "") {
        payload.weight = Number(formData.weight);
      }

      if (formData.fetalHeartRate !== "") {
        payload.fetalHeartRate = NUmber(formData.fetalHeartRate);
      }

      if (formData.nextVisitDate) {
        payload.nextVisitDate = formData.nextVisitDate;
      }

      await api.put(`/anc/${patientId}/${ancId}`, payload);
      navigate(`/asha/patients/${patientId}/anc`);
    } catch (err) {
      setError(
        err?.reponse?.data?.message ||
          err?.message ||
          "Failed to update ANC record",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading ANC record...</p>
      </div>
    );
  }

  if (!patient?.isPregnant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/asha/pateints/${patientId}/anc`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="" text-2xl font-bold tracking-tight>
              Edit ANC
            </h1>
            <p className="text-muted-foreground">
              ANC is available only for pregnant patients.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/asha/pateints/${patientId}/anc`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit ANC Visit
          </h1>
          <p className="text-muted-foreground">
            Update antenatal care information
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
              <CardTitle>Visit Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none"
                  required
                >
                  <option value="">Select trimester</option>
                  <option value="1">1st trimester</option>
                  <option value="2">2nd trimester</option>
                  <option value="3">3rd trimester</option>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="mb-2 block">Blood Pressure (mmHg)</Label>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="systolic"
                    type="number"
                    min="0"
                    placeholder="systolic"
                    value={formData.systolic}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="diastolic"
                    type="number"
                    min="0"
                    placeholder="diastolic"
                    value={formData.diastolic}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                <Input
                  id="hemoglobin"
                  name="hemoglobin"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.hemoglobin}
                  onChange={handleChange}
                  required
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="nextVisitDate">Next Visit Date</Label>
                <Input
                  id="nextVisitDate"
                  name="nextVisitDate"
                  type="date"
                  value={formData.nextVisitDate}
                  onChange={handleChange}
                />
              </div>
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
                placeholder="Add notes about this ANC visit..."
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
            onClick={() => navigate(`/asha/patients/${patientId}/anc`)}
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

export default EditANC;
