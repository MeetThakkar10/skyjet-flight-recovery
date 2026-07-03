import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/api/client";
import { Plane, ArrowRight, Star } from "lucide-react";

const PERKS = [
  "All your bookings in one place",
  "One-tap rebooking when flights are disrupted",
  "Track refund status in real time",
  "Priority AI-assisted support",
];

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create your account.");
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
            Travel smarter,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              stress less.
            </span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Create a free account and manage all your bookings from one elegant dashboard.
          </p>
        </div>

        <div className="hidden flex-col gap-2.5 md:flex">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-blue-900">
                <Star className="size-2.5 text-white fill-white" />
              </div>
              <p className="text-sm text-foreground">{perk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full md:max-w-sm">
        <Card className="shadow-xl border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Create an account</CardTitle>
            <CardDescription>See all your bookings in one place.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              {error && <ErrorBanner message={error} />}
              <Button
                type="submit"
                disabled={submitting}
                className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:opacity-90 transition-opacity"
              >
                {submitting ? "Creating account…" : (
                  <span className="flex items-center gap-2">Create account <ArrowRight className="size-4" /></span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
