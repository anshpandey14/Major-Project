import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { setPIN } from "@/utils/pin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

const PINSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1 = enter, 2 = confirm
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentPIN = step === 1 ? pin : confirmPin;
  const setCurrentPIN = step === 1 ? setPin : setConfirmPin;

  const handleDigit = (digit) => {
    if (currentPIN.length < 4) setCurrentPIN((p) => p + digit);
  };

  const handleDelete = () => {
    setCurrentPIN((p) => p.slice(0, -1));
    setError("");
  };

  const handleNext = () => {
    if (pin.length < 4) { setError("Please enter a 4-digit PIN"); return; }
    setStep(2);
    setError("");
  };

  const handleConfirm = async () => {
    if (confirmPin.length < 4) { setError("Please confirm your PIN"); return; }
    if (pin !== confirmPin) {
      setError("PINs do not match. Try again.");
      setConfirmPin("");
      return;
    }
    setLoading(true);
    setPIN(pin);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    const role = user?.role;
    if (role === "asha") navigate("/asha/dashboard", { replace: true });
    else if (role === "phc") navigate("/phc/dashboard", { replace: true });
    else navigate("/admin/dashboard", { replace: true });
  };

  const dots = Array.from({ length: 4 }, (_, i) => i);
  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center gap-2 pb-2">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="size-7 text-primary" />
          </div>
          <CardTitle className="text-xl">
            {step === 1 ? "Set your offline PIN" : "Confirm your PIN"}
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            {step === 1
              ? "Choose a 4-digit PIN to log in without internet"
              : "Enter the same PIN again to confirm"}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-2">
          {/* Dots */}
          <div className="flex gap-3">
            {dots.map((i) => (
              <div
                key={i}
                className={`size-4 rounded-full transition-all duration-150 ${
                  currentPIN.length > i
                    ? "bg-primary scale-110"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          {/* Numpad */}
          <div className="grid w-full max-w-60 grid-cols-3 gap-3">
            {digits.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  if (d === "⌫") handleDelete();
                  else if (d !== "") handleDigit(d);
                }}
                disabled={d === ""}
                className={`flex h-14 items-center justify-center rounded-xl text-lg font-semibold transition-colors ${
                  d === ""
                    ? "invisible"
                    : d === "⌫"
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {step === 1 ? (
            <Button
              className="w-full"
              onClick={handleNext}
              disabled={pin.length < 4}
            >
              Continue <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={confirmPin.length < 4 || loading}
            >
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 size-4" />
              )}
              Set PIN & Continue
            </Button>
          )}

          <button
            onClick={() => {
              const role = user?.role;
              if (role === "asha") navigate("/asha/dashboard", { replace: true });
              else if (role === "phc") navigate("/phc/dashboard", { replace: true });
              else navigate("/admin/dashboard", { replace: true });
            }}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Skip for now
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PINSetup;
