import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const Profile = () => {
  const { user, setUser } = useAuth();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  const getInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    const map = { asha: "ASHA Worker", phc: "PHC Staff", it_admin: "IT Admin" };
    return map[user?.role] || "User";
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadMsg({ type: "error", text: "Only JPEG, PNG or WebP images allowed." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadMsg({ type: "error", text: "Image must be under 2MB." });
      return;
    }
    setUploading(true);
    setUploadMsg(null);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await api.put("/auth/upload-avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = res.data?.data?.user;
      if (updatedUser) setUser(updatedUser);
      setUploadMsg({ type: "success", text: "Avatar updated successfully." });
    } catch {
      setUploadMsg({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const fields = [
    { label: "Full Name", value: user?.fullName },
    { label: "Username", value: user?.username || "—" },
    { label: "Email", value: user?.email },
    { label: "Phone", value: user?.phone || "—" },
    { label: "Village", value: user?.village || "—" },
    { label: "Role", value: getRoleBadge() },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account information</p>
      </div>

      {/* Avatar card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative">
            <Avatar className="size-24 ring-2 ring-primary/20 ring-offset-2">
              <AvatarImage src={user?.avatar?.url} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary/90 transition-colors"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">{user?.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge className="mt-2" variant="secondary">{getRoleBadge()}</Badge>
            {uploadMsg && (
              <div className={`mt-3 flex items-center gap-2 text-sm ${uploadMsg.type === "success" ? "text-primary" : "text-destructive"}`}>
                {uploadMsg.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                {uploadMsg.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((f, i) => (
            <div key={f.label}>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">{f.label}</Label>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
              {i < fields.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
