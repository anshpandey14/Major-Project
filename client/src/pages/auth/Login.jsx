import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, CheckCircle2, Eye, EyeOff, HeartPulse, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";

const Login = () => {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isLoading && isAuthenticated && user) {
    if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
    if (!user.isProfileComplete) return <Navigate to="/complete-profile" replace />;
    if (user.role === "asha") return <Navigate to="/asha/dashboard" replace />;
    if (user.role === "phc") return <Navigate to="/phc/dashboard" replace />;
    if (user.role === "it_admin") return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
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
      const loggedInUser = await login({ email: formData.email.trim(), password: formData.password });
      if (loggedInUser.mustChangePassword) return navigate("/change-password", { replace: true });
      if (!loggedInUser.isProfileComplete) return navigate("/complete-profile", { replace: true });
      if (loggedInUser.role === "asha") return navigate("/asha/dashboard", { replace: true });
      if (loggedInUser.role === "phc") return navigate("/phc/dashboard", { replace: true });
      if (loggedInUser.role === "it_admin") return navigate("/admin/dashboard", { replace: true });
      setError("Your account has an invalid role");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-showcase" aria-label="EHR Companion introduction">
        <div className="login-showcase-content">
          <div className="login-brand">
            <span className="login-brand-icon"><HeartPulse className="size-6" /></span>
            <span>EHR <span className="font-normal text-white/70">Companion</span></span>
          </div>
          <div className="mt-12 sm:mt-16">
            <span className="login-eyebrow"><span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" /> Connected care, closer to home</span>
            <h1 className="login-headline">Care that moves <span>communities</span> forward.</h1>
            <p className="login-description">A simpler way for frontline health workers to coordinate patient records, maternal care, and vaccinations — even when connectivity is limited.</p>
          </div>
          <div className="login-glass-card" aria-hidden="true">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-white/65">COMMUNITY HEALTH</p><p className="mt-1 text-lg font-semibold">Care overview</p></div>
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-300/15 text-emerald-200"><Activity className="size-5" /></span>
            </div>
            <div className="login-glass-row"><span className="login-glass-icon"><Users className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium">Patient records</p><p className="text-xs text-white/60">Organised and accessible</p></div><CheckCircle2 className="size-5 text-emerald-200" /></div>
            <div className="login-glass-row"><span className="login-glass-icon"><ShieldCheck className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium">Continuity of care</p><p className="text-xs text-white/60">Built for field workflows</p></div><CheckCircle2 className="size-5 text-emerald-200" /></div>
          </div>
        </div>
        <div className="login-showcase-footer flex items-center justify-between gap-4 text-xs text-white/55">
          <span>For ASHA workers · PHC teams · Administrators</span>
          <span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck className="size-4" /> Secure workspace</span>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-form-card">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-primary">Welcome back</p>
            <h2 className="login-form-title">Sign in to your account</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your credentials to continue to your health workspace.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="name@health.org" value={formData.email} onChange={handleChange} disabled={isSubmitting} autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label></div>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={handleChange} disabled={isSubmitting} autoComplete="current-password" className="pr-11" required />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" disabled={isSubmitting} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            {error && <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" className="login-submit w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : <>Sign in securely <ArrowRight className="ml-2 size-4" /></>}
            </Button>
          </form>
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/55 p-3.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs leading-5 text-muted-foreground">Your account access is managed by your health centre. If you need help signing in, contact your PHC administrator.</p>
          </div>
          <p className="mt-7 text-center text-xs text-muted-foreground">EHR Companion · Community healthcare workspace</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
