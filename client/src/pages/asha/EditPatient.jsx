import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const genderOptions = ["male", "female"];

const bloodGroupOptions = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

const EditPatient = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    village: "",
    gender: "",
    dob: "",
    weight: "",
    height: "",
    bloodGroup: "Unknown",
    isPregnant: false,
    lmpDate: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(`/patients/${patientId}`);

        const patient = response?.data?.data || response?.data?.patient;

        if (!patient) {
          throw new Error("Patient data not found");
        }

        setFormData({
          fullName: patient.fullName || "",
          phone: patient.phone || "",
          village: patient.village || "",
          gender: patient.gender || "",
          dob: patient.dob ? patient.dob.split("T")[0] : "",
          weight: patient.weight ?? "",
          height: patient.height ?? "",
          bloodGroup: patient.bloodGroup || "Unknown",
          isPregnant: patient.isPregnant || false,
          lmpDate: patient.lmpDate ? patient.lmpDate.split("T")[0] : "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load patient.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        village: formData.village,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        isPregnant: formData.isPregnant,
      };

      if (formData.weight !== "") {
        payload.weight = Number(formData.weight);
      }

      if (formData.height !== "") {
        payload.height = Number(formData.height);
      }

      if (formData.isPregnant && formData.lmpDate) {
        payload.lmpDate = formData.lmpDate;
      }

      await api.patch(`/patients/${patientId}`, payload);
      navigate(`/asha/patients/${patientId}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update patient.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading patient...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Patient</h1>
          <p className="text-muted-foreground">Update patient Information</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bortder border-destructive/20 bg-destructive/01 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="sapce-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Physical Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="sapce-y-2">
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

              <div className="sapce-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.height}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none"
                >
                  {genderOptions.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pregnancy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Label className="flex cursor-pointer items-center gap-3">
                <Input
                  type="checkbox"
                  name="isPregnant"
                  checked={formData.isPregnant}
                  onChange={handleChange}
                  className="h-4 w-4 rounded-input"
                />

                <span className="text-sm font-medium">Patient is pregnant</span>
              </Label>

              {formData.isPregnant && (
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="lmpDate">Last Menstrual Period(LMP)</Label>

                  <Input
                    id="lmpDate"
                    name="lmpDate"
                    type="date"
                    value={formData.lmpDate}
                    onChange={handleChange}
                  />
                </div>
              )}

              {!formData.isPregnant && formData.lmpDate && (
                <p className="text-sm text-muted-foreground">
                  LMP will be cleared becaue the patient is no longer marked as
                  pregnant.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onlick={() => navigate(`/asha/patients/${patientId}`)}
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

export default EditPatient;
