import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const completeProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    village: user?.village || "",
    phone: user?.phone || "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (r) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const navigateToDashboard = (currentUser) => {
    switch (currentUser?.role) {
      case "asha":
        navigate("/asha/dashboard", { replace: true });
        break;
      case "phc":
        navigate("/phc/dashboard", { replace: true });
        break;
      case "it_admin":
        navigate("/admin/dashboard", { replace: true });
        break;
      default:
        navigate("/unauthorized", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const fullName = formData.fullName.trim();
    const village = formData.village.trim();
    const phone = formData.phone.trim();

    if (!fullName) {
      setError("Full Name is required");
      return;
    }

    if (fullName.length < 2) {
      setError("fullName must be at least 2 characters long.");
      return;
    }

    if (!village) {
      setError("village is required");
      return;
    }

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.completeProfile({
        fullName,
        village,
        phone,
      });

      const updatedUser = response?.data?.user || response?.user;
      const currentUser = updatedUser || {
        ...user,
        fullName,
        village,
        phone,
        isProfileComplete: true,
      };

      updateUser(currentUser);

      navigateToDashboard(currentUser);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to complet profile. Please try again";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-wd">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Please provide your details before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">FullName</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full Name"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                name="village"
                type="text"
                placeholder="Enter your village"
                value={formData.village}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>

              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={FormDataEvent.phone}
                onchange={handleChange}
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                disabled={isLoading}
              />

              <p className="text-xs text-muted-foreground">
                Enter a valid 10-digit mobile number.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving Profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default completeProfile;
