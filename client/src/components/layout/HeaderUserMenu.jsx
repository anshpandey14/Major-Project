import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const HeaderUserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getInitials = () => {
    if (!user?.fullName) {
      return "U";
    }

    return user.fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .splice(0, 2)
      .toUpperCase();
  };

  const getRoleName = () => {
    switch (user?.role) {
      case "asha":
        return "ASHA Worker";

      case "phc":
        return "PHC";

      case "it_admin":
        return "IT Administrator";

      default:
        return "User";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-10 rounder-full">
          <Avatar className="size-9">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{user?.fullName || "User"}</span>
            <span className="etxt-xs font-normal text-muted-foreground">
              {getRoleName()}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderUserMenu;
