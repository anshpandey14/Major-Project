import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { hasPIN, clearPIN } from "@/utils/pin";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Lock, ShieldCheck, ShieldOff, Loader2,
  CheckCircle2, AlertCircle, KeyRound,
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const pinSet = hasPIN();

  // Change password state
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const handlePwChange = (e) => {
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPwMsg(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await api.post("/auth/change-password", pwForm);
      setPwMsg({ type: "success", text: "Password changed. Please log in again." });
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(async () => { await logout(); navigate("/login", { replace: true }); }, 2000);
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Failed to change password." });
    } finally {
      setPwLoading(false);
    }
  };

  const handleClearPIN = () => {
    clearPIN();
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account security</p>
      </div>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="size-4" /> Change Password
          </CardTitle>
          <CardDescription>Update your login password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="oldPassword">Current password</Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={pwForm.oldPassword}
                onChange={handlePwChange}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={pwForm.newPassword}
                onChange={handlePwChange}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={pwForm.confirmPassword}
                onChange={handlePwChange}
                placeholder="Repeat new password"
                required
              />
            </div>

            {pwMsg && (
              <div className={`flex items-center gap-2 text-sm ${pwMsg.type === "success" ? "text-primary" : "text-destructive"}`}>
                {pwMsg.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                {pwMsg.text}
              </div>
            )}

            <Button type="submit" disabled={pwLoading} className="w-full sm:w-auto">
              {pwLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* PIN management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" /> Offline PIN
          </CardTitle>
          <CardDescription>
            {pinSet
              ? "Your PIN is set. You can log in offline using your 4-digit PIN."
              : "No PIN set. Set one to log in without internet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={pinSet ? "outline" : "default"}
            className="gap-2"
            onClick={() => navigate("/pin/setup")}
          >
            <ShieldCheck className="size-4" />
            {pinSet ? "Change PIN" : "Set PIN"}
          </Button>
          {pinSet && (
            <Button
              variant="ghost"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={handleClearPIN}
            >
              <ShieldOff className="size-4" />
              Remove PIN
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
