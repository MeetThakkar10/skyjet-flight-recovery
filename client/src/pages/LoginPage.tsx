import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useAuth } from "@/context/AuthContext";
import { getCaptcha } from "@/api/auth";
import { ApiRequestError } from "@/api/client";
import { Plane, ArrowRight, Lock } from "lucide-react";

function captchaImgSrc(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const refreshCaptcha = useCallback(async () => {
    try {
      const challenge = await getCaptcha();
      setCaptchaId(challenge.captchaId);
      setCaptchaSvg(challenge.svg);
      setCaptchaInput("");
    } catch {
      setError("Could not load captcha. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password, captchaId, captchaInput);
      navigate(user.role === "staff" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not log in.");
      await refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 md:flex-row md:gap-12">
      {/* ── Left hero panel ── */}
      <div className="flex flex-1 flex-col gap-6 md:max-w-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg">
            <Plane className="size-4 text-white" />
          </div>
          SkyJet Flight Recovery
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Welcome{" "}
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              back.
            </span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Log in to access your bookings, manage recovery options, or reach the staff dashboard.
          </p>
        </div>

        <div className="hidden flex-col gap-4 rounded-xl border border-border/50 bg-accent/30 p-4 md:flex">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Your session is protected</p>
              <p className="text-xs text-muted-foreground">We use CAPTCHA verification and encrypted sessions to keep your data safe.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full md:max-w-sm">
        <Card className="shadow-xl border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Log in</CardTitle>
            <CardDescription>Access your bookings, or the staff dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="captcha">Enter the numbers shown</Label>
                <div className="flex items-center gap-2">
                  {captchaSvg ? (
                    <img
                      src={captchaImgSrc(captchaSvg)}
                      alt="Captcha challenge"
                      className="h-10 rounded-lg border bg-muted"
                    />
                  ) : (
                    <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
                  )}
                  <Button type="button" variant="ghost" size="sm" onClick={refreshCaptcha}>
                    Refresh
                  </Button>
                </div>
                <Input
                  id="captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="4-digit code"
                  inputMode="numeric"
                  required
                />
              </div>
              {error && <ErrorBanner message={error} />}
              <Button
                type="submit"
                disabled={submitting}
                className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:opacity-90 transition-opacity"
              >
                {submitting ? "Logging in…" : (
                  <span className="flex items-center gap-2">Log in <ArrowRight className="size-4" /></span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              No account?{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline font-medium">
                Create one
              </Link>
            </p>
            <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
              <Link to="/">Continue as guest (PNR lookup)</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
