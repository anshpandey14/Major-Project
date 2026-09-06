import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import authService from "@/services/auth.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RegisterPHC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    village: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const village = formData.village.trim();

    if (!fullName) {
      setError("Full name is required");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setIsLoading(true);

      await authService.registerPHC({
        fullName,
        email,
        password,
        ...(village && { village }),
      });

      setSuccess("PHC account created successfully");

      setFormData({
        fullName: "",
        email: "",
        password: "",
        village: "",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to create PHC account.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/dashboard">
            <ArrowLeft />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex sixe-10 items-center justify-center rounded-lg border bg-background">
            <Building2 className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Register PHC</h1>

            <p className="text-sm text-muted-foreground">
              Create a new Priary Health Centre account.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PHC Account Details</CardTitle>
          <CardDescription>
            Enter the details required to create the PHC account.
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
              <Label htmlFor="fullName">Full Name</Label>

              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter PHC administrator name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter PHC email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter temporary password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isLoading}
              />

              <p className="text-xs text-muted-foreground">
                The PHC user will use this password for their first login.
              </p>
            </div>

            <div className="sapce-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                name="village"
                type="text"
                placeholder="Enter village"
                value={formData.village}
                onChange={handleChange}
                disabled={isLoading}
              />

              <p className="text-xs text-muted-foreground">Optional.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isLoading}
              >
                <Link to="/admin/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating PHC..." : "Create PHC Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPHC;
