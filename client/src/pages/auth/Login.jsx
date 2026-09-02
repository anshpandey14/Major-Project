import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
import useAuth from "@/hooks/useAuth";

const Login = () => {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isLoading && isAuthenticated && user) {
    if (user.mustChangePassword) {
      return <Navigate to="/change-password" replace />;
    }

    if (!user.isProfileComplete) {
      return <Navigate to="/complete-profile" replace />;
    }

    if (user.role === "asha") {
      return <Navigate to="/asha/dashboard" replace />;
    }

    if (user.role === "phc") {
      return <Navigate to="/phc/dashboard" replace />;
    }

    if (user.role === "it_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const loggedInUser = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (loggedInUser.mustChangePassword) {
        navigate("/change-password", { replace: true });
        return;
      }

      if (!loggedInUser.isProfileComplete) {
        navigate("/complete-profile", { replace: true });
        return;
      }

      if (loggedInUser.role === "asha") {
        navigate("/asha/dashboard", { replace: true });
        return;
      }

      if (loggedInUser.role === "phc") {
        navigate("/phc/dashboard", { replace: true });
        return;
      }

      if (loggedInUser.role === "it_admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      setError("Your account has an invalid role");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to login. Please check  your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">EHR Companion</CardTitle>

          <CardDescription>Sign in to your healthCare account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formDataEvent.email}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="pr-20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
