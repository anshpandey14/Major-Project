import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EditVaccinationPHC = () => {
  const { patientId, vaccinationId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
    const fetchVaccination = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [patientResponse, vaccinationResponse] = await Promise.all([
          api.get(`/patients/${patientId}`),
          api.get(`/vaccinations/${patientId}/${vaccinationId}`),
        ]);

        const patientData =
          patientResponse?.data?.data || patientResponse?.data?.patient;

        const vaccinationData =
          vaccinationResponse?.data?.data ||
          vaccinationResponse?.data?.vaccination;

        setPatient(patientData);

        setFormData({
          vaccine: vaccinationData?.vaccine || "",
          customVaccine: vaccinationData?.customVaccine || "",
          doseNumber: vaccinationData?.doseNumber ?? "",
          vaccinationDate: vaccinationData?.vaccinationDate
            ? vaccinationData.vaccinationDate.split("T")[0]
            : "",
          nextDueDate: vaccinationData?.nextDueDate
            ? vaccinationData.nextDueDate.split("T")[0]
            : "",
          status: vaccinationData?.status || "completed",
          notes: vaccinationData?.notes || "",
        });
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load vaccination.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVaccination();
  }, [patientId, vaccinationId]);

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

      await api.put(`/vaccinations/${patientId}/${vaccinationId}`, {
        vaccine: formData.vaccine || undefined,
        customVaccine: formData.customVaccine || undefined,
        doseNumber: formData.doseNumber
          ? Number(formData.doseNumber)
          : undefined,
        vaccinationDate: formData.vaccinationDate || undefined,
        nextDueDate: formData.nextDueDate || undefined,
        status: formData.status,
        notes: formData.notes,
      });

      navigate(`/phc/patients/${patientId}/vaccinations`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load vaccination.");
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
          onClick={() => navigate(`/phc/patients/${patientId}/vaccinations`)}
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
          onClick={() => navigate(`/phc/patients/${patientId}/vaccinations`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold">Edit Vaccination</h1>
          {patient?.fullName && (
            <p className="text-sm text-muted-foreground">
              Patient: {patient.fullName}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vaccination Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="vaccine">Vaccine</Label>
              <Input
                id="vaccine"
                name="vaccine"
                value={formData.vaccine}
                onChange={handleChange}
                placeholder="e.g. BCG, OPV, DPT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customVaccine">Custom Vaccine</Label>
              <Input
                id="customVaccine"
                name="customVaccine"
                value={formData.customVaccine}
                onChange={handleChange}
                placeholder="Enter custom vaccine if applicable."
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
              <Label htmlFor="status">status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
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
                onClick={() =>
                  navigate(`/phc/patients/${patientId}/vaccinations`)
                }
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

export default EditVaccinationPHC;
