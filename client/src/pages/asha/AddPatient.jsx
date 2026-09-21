import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

const AddPatient = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    village: "",
    gender: "",
    dob: "",
    weight: "",
    height: "",
    bloodGroup: "",
    isPregnant: "",
    lmpDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        village: formData.village.trim(),
        gender: formData.gender,
        dob: formData.dob,
        isPregnant: formData.isPregnant,
      };

      if (formData.weight !== "") {
        payload.weight = Number(formData.weight);
      }

      if (formData.height !== "") {
        payload.height = Number(formData.height);
      }

      if (payload.isPregnant && formData.lmpDate) {
        payload.lmpDate = formData.lmpDate;
      }

      const response = await api.post("/patients", payload);

      const createdPatient =
        response?.data?.data?.patient ||
        response?.data?.patient ||
        response?.data?.data;

      if (createdPatient?._id) {
        navigate(`/asha/patients/${createdPatient._id}`);
      } else {
        navigate("/asha/patients");
      }
    } catch (err) {
      const message =
        err?.response?.message ||
        err?.response?.data?.errors?.[0].msg ||
        "Failed to add patient. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/asha/patients")}
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Patient</h1>
          <p className="text-muted-foreground">
            Register a new patient usner your care.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Patient Information
          </CardTitle>
          <CardDescription>
            Enter the patient's basic and health information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-md border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter patient's full Name"
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
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>

                  <Input
                    id="village"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Enter village"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>

                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>

                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Physical Information</h2>

              <div className="grid gap-4 md:grid-cols-3">
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
                    placeholder="e.g. 55"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>

                  <Input
                    id="height"
                    name="height"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g. 165"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group (cm)</Label>

                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Pregnancy Information</h2>

              <Label
                htmlFor="isPregnant"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4"
              >
                <Input
                  id="isPregnant"
                  name="isPregnant"
                  type="checkbox"
                  onChange={handleChange}
                  className="h-4 w-4"
                  checked={formData.isPregnant}
                />
                <div>
                  <p className="font-medium">Pateint is pregnant</p>
                  <p className="text-sm text-muted-foreground">
                    Enable this if the patient is currently pregnant.
                  </p>
                </div>
              </Label>

              {formData.isPregnant && (
                <div className="max-w-md space-y-2">
                  <Label htmlFor="lmpDate">Last Menstrual Period</Label>

                  <Input
                    id="lmpDate"
                    name="lmpDate"
                    type="Date"
                    value={formData.lmpDate}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/asha/patients")}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Patient...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Patient
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPatient;
