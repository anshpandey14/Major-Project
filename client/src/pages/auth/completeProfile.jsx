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

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || "",
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

    const username = formData.username.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (!username) {
      setError("Username is required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      setError(
        "Username can contain only lowercase letters, numbers and underscores.",
      );
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
        username,
        phone,
      });

      const updatedUser = response?.data?.user;

      if (!updatedUser) {
        throw new Error("Updated user was not returned by the server.");
      }

      updateUser(currentUser);

      navigateToDashboard(currentUser);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to complete profile. Please try again";
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
            Set your username and phone number before continuing.
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
              <Label htmlFor="username">FuUsernamellName</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="name"
                disabled={isLoading}
              />

              <p className="text-xs text-muted-foreground">
                Use lowercase letters, numbers and underscores.
              </p>
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
export default CompleteProfile;
