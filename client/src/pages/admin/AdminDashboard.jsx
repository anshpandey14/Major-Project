import { Link } from "react-router-dom";
import { Building2, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

        <p className="text-muted-foreground">
          Manage healthcare center accounts and system access
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.fullName || "Administrator"}</CardTitle>
          <CardDescription>
            You are logged in as IT Administrator.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium">Account</p>
              <p className="text-sm text-muted-foreground">{user?.emaill}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 ms:grid-cols-2">
        <Card>
          <CardHeader>
            <Building2 className="mb-2 size-6" />
            <CardTitle>PHC Management</CardTitle>
            <CardDescription>
              Create and manage Primary Helath Centre accounts.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild>
              <Link to="/admin/register-phc">
                <UserPlus />
                Register PHC
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>
              System administration features will appear here.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
