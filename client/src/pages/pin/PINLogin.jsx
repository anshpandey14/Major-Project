import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  verifyPIN, incrementAttempts, resetAttempts,
  isLocked, getRemainingLockSeconds, hasPIN,
} from "@/utils/pin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Wifi, Lock } from "lucide-react";

const PINLogin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(isLocked());
  const [remaining, setRemaining] = useState(getRemainingLockSeconds());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Countdown timer
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => {
      const secs = getRemainingLockSeconds();
      setRemaining(secs);
      if (secs <= 0) { setLocked(false); clearInterval(id); }
    }, 1000);
    return () => clearInterval(id);
  }, [locked]);

  // Online detector
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  // Redirect if no PIN set
  useEffect(() => {
    if (!hasPIN()) navigate("/login", { replace: true });
  }, [navigate]);

  const getDashboard = () => {
    const role = user?.role || JSON.parse(localStorage.getItem("ehr_user") || "{}").role;
    if (role === "asha") return "/asha/dashboard";
    if (role === "phc") return "/phc/dashboard";
    return "/admin/dashboard";
  };

  const handleDigit = (d) => {
    if (locked || pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) {
      if (verifyPIN(next)) {
        resetAttempts();
        navigate(getDashboard(), { replace: true });
      } else {
        const attempts = incrementAttempts();
        if (isLocked()) {
          setLocked(true);
          setRemaining(getRemainingLockSeconds());
          setError("Too many wrong attempts. Locked for 30 minutes.");
        } else {
          setError(`Incorrect PIN. ${3 - attempts} attempt${3 - attempts !== 1 ? "s" : ""} remaining.`);
        }
        setPin("");
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  const dots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center gap-2 pb-2">
          <div className={`flex size-14 items-center justify-center rounded-2xl ${locked ? "bg-destructive/10" : "bg-primary/10"}`}>
            {locked ? <Lock className="size-7 text-destructive" /> : <ShieldAlert className="size-7 text-primary" />}
          </div>
          <CardTitle className="text-xl">
            {locked ? "Account Locked" : "Enter your PIN"}
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            {locked
              ? `Try again in ${formatTime(remaining)}`
              : "You are offline. Use your PIN to continue."}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 pt-2">
          {!locked && (
            <>
              <div className="flex gap-3">
                {dots.map((i) => (
                  <div
                    key={i}
                    className={`size-4 rounded-full transition-all duration-150 ${
                      pin.length > i ? "bg-primary scale-110" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}

              <div className="grid w-full max-w-60 grid-cols-3 gap-3">
                {digits.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => d === "⌫" ? handleDelete() : d !== "" && handleDigit(d)}
                    disabled={d === ""}
                    className={`flex h-14 items-center justify-center rounded-xl text-lg font-semibold transition-colors ${
                      d === "" ? "invisible"
                        : d === "⌫" ? "bg-muted text-muted-foreground hover:bg-muted/80"
                        : "bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </>
          )}

          {locked && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl font-mono font-bold text-destructive">
                {formatTime(remaining)}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Account locked after 3 wrong attempts
              </p>
            </div>
          )}

          {isOnline && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/login", { replace: true })}
            >
              <Wifi className="size-4" />
              Login with password instead
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PINLogin;
