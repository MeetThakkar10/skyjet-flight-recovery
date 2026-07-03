import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useTripSession } from "@/context/TripSessionContext";
import { lookupTrip } from "@/api/trips";
import { ApiRequestError } from "@/api/client";
import { Plane, ArrowRight, ShieldCheck, Clock, Headphones } from "lucide-react";
import { TypeAnimation } from "react-type-animation";

const FEATURES = [
  { icon: Plane, title: "Instant Lookup", desc: "Find your flight in seconds, no hold music." },
  { icon: ShieldCheck, title: "Secure & Private", desc: "Your booking data is encrypted end-to-end." },
  { icon: Clock, title: "Real-time Status", desc: "Live flight updates as disruptions happen." },
  { icon: Headphones, title: "AI-Powered Support", desc: "Chat with an agent any time, 24/7." },
];

export function LookupPage() {
  const [pnr, setPnr] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setBookingId, setPassengerName } = useTripSession();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const trip = await lookupTrip(pnr.trim(), lastName.trim());
      setBookingId(trip.bookingId);
      setPassengerName(trip.passengerName);
      navigate(`/trip/${trip.bookingId}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not look up your trip.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 md:flex-row md:gap-12">
      {/* ── Left hero panel ── */}
      <div className="flex flex-1 flex-col gap-7 md:max-w-sm">
        {/* Brand badge */}
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg">
            <Plane className="size-4 text-white" />
          </div>
          SkyJet Flight Recovery
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Your flight disrupted?{" "}
            <TypeAnimation
              sequence={[
                "We've got you.", 2000,
                "Rebook instantly.", 2000,
                "Check your refund.", 2000,
                "Talk to an agent.", 2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent"
            />
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Check your status, rebook instantly, or start a refund — all without waiting on hold.
          </p>
        </div>

        <div className="hidden flex-col gap-3 md:flex">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent">
                <Icon className="size-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full md:max-w-sm">
        <Card className="shadow-xl border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Look up your trip</CardTitle>
            <CardDescription>
              Enter your booking reference and last name to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pnr">Booking reference (PNR)</Label>
                <Input
                  id="pnr"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  placeholder="e.g. SJRBK1"
                  required
                  autoFocus
                  className="font-mono tracking-widest uppercase"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Mehta"
                  required
                />
              </div>
              {error && <ErrorBanner message={error} />}
              <Button
                type="submit"
                disabled={submitting}
                className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md hover:opacity-90 transition-opacity"
              >
                {submitting ? "Looking up…" : (
                  <span className="flex items-center gap-2">Find my trip <ArrowRight className="size-4" /></span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-1 text-center">
            <p className="text-sm text-muted-foreground">
              Have an account?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline font-medium">
                Log in
              </Link>{" "}
              or{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline font-medium">
                create one
              </Link>{" "}
              to see all your bookings.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
