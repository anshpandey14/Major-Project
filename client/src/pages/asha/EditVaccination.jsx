import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const vaccineOptions = [
  "BCG",
  "OPV0",
  "OPV1",
  "OPV2",
  "OPV3",
  "HEPB",
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

const EditVaccination = () => {
  const { patientId, vaccinationId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vaccine: "",
    customVaccine: "",
    doseNumber: "",
    vaccinationDate: "",
    nextDueDate: "",
    status: "pending",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVaccination = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(
          `/vaccinations/${patientId}/${vaccinationId}`,
        );

        const vaccination = response?.data?.data || response?.data?.vaccination;

        if (!vaccination) {
          throw new Error("Vaccination data not found");
        }

        setFormData({
          vaccine: vaccination.vaccine || "",
          customVaccine: vaccination.customVaccine || "",
          doseNumber: vaccination.doseNumber ?? "",
          vaccinationDate: vaccination.vaccinationDate
            ? vaccination.vaccinationDate.split("T")[0]
            : "",
          nextDueDate: vaccination.nextDueDate
            ? vaccination.nextDueDate.split("T")[0]
            : "",
          status: vaccination.status || "pending",
          notes: vaccination.notes || "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.mesage ||
            err?.message ||
            "Failed to load vaccination",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchVaccination();
  }, [patientId]);

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

      const payload = {
        doseNumber: NUmber(formData.doseNumber),
        vaccinationDate: formData.vaccinationDate,
        nextDueDate: formData.nextDueDate || undefined,
        status: formData.status,
        notes: formData.notes,
      };

      if (formData.vaccine === "custom") {
        payload.vacc = "";
        payload.customVaccine = formData.customVaccine.trim();
      } else {
        payload.vaccine = formData.vaccine;
        payload.customVaccine = "";
      }

      await api.put(`/vaccination/${patientId}/${vaccinationId}`, payload);

      navigate(`/asha/patients/${patientId}/vaccinations`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update vaccination",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading vaccination...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/asha/patients/${patientId}/vaccinations`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Vaccination
          </h1>
          <p className="text-muted-foreground">
            Update vaccination information
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
              <CardTitle>Vaccine Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlfor="vaccine">Vaccine</Label>

                <select
                  id="vaccine"
                  value={formData.vaccine}
                  name="vaccine"
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none"
                >
                  <option value="">Select Vaccine</option>
                  {vaccineOptions.map((vaccine) => (
                    <option key={vaccine} value={vaccine}>
                      {vaccine}
                    </option>
                  ))}

                  <option value="custom">Custom Vaccine</option>
                </select>
              </div>

              {formData.vaccine === "custom" && (
                <div className="space-y-2">
                  <Label htmlfor="customVaccine">Custom Vaccine</Label>
                  <Input
                    id="customVaccine"
                    name="customVaccine"
                    value={formData.customVaccine}
                    onChange={handleChange}
                    placeholder="Enter vaccine name"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlfor="doseNumber">Dose Number</Label>

                <Input
                  id="doseNumber"
                  name="doseNumber"
                  type="number"
                  min="1"
                  max="10"
                  onChange={handleChange}
                  value={formData.doseNumber}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vaccination Dates</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlfor="vaccinationDate">Vaccination Date</Label>

                <Input
                  id="vaccinationDate"
                  name="vaccinationDate"
                  type="date"
                  onChange={handleChange}
                  value={formData.vaccinationDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlfor="nextDueDate">Next Due Date</Label>

                <Input
                  id="nextDueDate"
                  name="nextDueDate"
                  type="date"
                  onChange={handleChange}
                  value={formData.nextDueDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlfor="status">Status</Label>

                <select
                  id="status"
                  name="status"
                  type="date"
                  onChange={handleChange}
                  value={formData.status}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add vaccination notes..."
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
            onClick={() => navigate(`/asha/patients/${patientId}/vaccinations`)}
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

export default EditVaccination;
