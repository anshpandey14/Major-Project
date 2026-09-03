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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, , setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
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
    setSuccess("");

    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New Password must be different from your current password");
      return;
    }

    try {
      setIsLoading(true);

      const response = await authService.changePassword({
        oldPassword,
        newPassword,
      });

      const updatedUser = response?.data?.user || response?.user;

      if (updatedUser) {
        updateUser(updatedUser);
      } else {
        updateUser({ mustChangePassword: false });
      }

      setSuccess("Password changed successfully");

      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        const currentUser = updatedUser
          ? updatedUser
          : { ...user, mustChangePassword: false };

        if (!currentUser?.isProfileComplete) {
          navigate("/complete-profile", {
            replace: true,
          });

          return;
        }
        navigateToDashboard(currentUser);
      }, 700);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to change password. Please try again";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8 ">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">ChangePassword</CardTitle>
          <CardDescription>
            You must change your temporary password before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="oldPassword">CurrentPassword</Label>

              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                placeholder="Enter current password"
                value={formData.oldPassword}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>

              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new Password"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Password must be atleast 8 characters long.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
