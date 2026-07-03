import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as adminApi from "@/api/admin";
import { getChatHistory } from "@/api/chat";
import { ApiRequestError } from "@/api/client";
import { cn } from "@/lib/utils";
import type { Booking, ChatMessage, Passenger, RecoveryRequest, SupportTicketResult, SupportTicketStatus } from "@/types";
import { Users, BookOpen, RefreshCw, LifeBuoy, Search, ShieldAlert } from "lucide-react";

type Tab = "passengers" | "bookings" | "recovery" | "tickets";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "passengers", label: "Passengers", icon: Users },
  { id: "bookings", label: "Bookings", icon: BookOpen },
  { id: "recovery", label: "Recovery Requests", icon: RefreshCw },
  { id: "tickets", label: "Support Tickets", icon: LifeBuoy },
];

const TICKET_STATUS_CONFIG: Record<SupportTicketStatus, { className: string; icon: string }> = {
  open: { className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700", icon: "⚠" },
  "in-review": { className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700", icon: "🔍" },
  resolved: { className: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700", icon: "✓" },
};

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}

export function StaffDashboardPage() {
  const [tab, setTab] = useState<Tab>("tickets");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicketResult[]>([]);
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "passengers") setPassengers((await adminApi.listPassengers(q)).passengers);
      else if (tab === "bookings") setBookings((await adminApi.listBookings(q)).bookings);
      else if (tab === "recovery") setRecoveryRequests((await adminApi.listRecoveryRequests(q)).recoveryRequests);
      else if (tab === "tickets") setTickets((await adminApi.listSupportTickets(q)).tickets);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(ticketId: string, status: SupportTicketStatus) {
    try {
      await adminApi.updateTicketStatus(ticketId, status);
      setTickets((prev) => prev.map((t) => (t.ticketId === ticketId ? { ...t, status } : t)));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update ticket status.");
    }
  }

  async function handleViewChat(bookingId: string) {
    setChatBookingId(bookingId);
    setChatLoading(true);
    try {
      const { messages } = await getChatHistory(bookingId);
      setChatMessages(messages);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load chat history.");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-64px)] w-full flex-col gap-6 px-6 py-10 lg:px-16">
      {/* ── Page hero banner ── */}
      <div className="flex items-center gap-3 rounded-xl bg-primary p-6 text-primary-foreground">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Staff Dashboard</h1>
          <p className="text-sm text-primary-foreground/70">Manage passengers, bookings, and support tickets</p>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-muted-foreground sr-only">Admin Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* ── Pill tab bar ── */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* ── Search bar with icon ── */}
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>

          {error && <ErrorBanner message={error} />}

          {loading ? (
            <LoadingSpinner label="Loading…" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
              {tab === "passengers" && (
                <table className="w-full">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Phone</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {passengers.map((p, i) => (
                      <tr key={p._id} className={cn("transition-colors hover:bg-muted/30", i % 2 === 0 ? "" : "bg-muted/10")}>
                        <Td><span className="font-medium">{p.firstName} {p.lastName}</span></Td>
                        <Td className="text-muted-foreground">{p.email}</Td>
                        <Td className="text-muted-foreground">{p.phone}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "bookings" && (
                <table className="w-full">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <Th>PNR</Th>
                      <Th>Cabin</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {bookings.map((b, i) => (
                      <tr key={b._id} className={cn("transition-colors hover:bg-muted/30", i % 2 === 0 ? "" : "bg-muted/10")}>
                        <Td><span className="font-mono text-xs tracking-widest font-semibold">{b.pnr}</span></Td>
                        <Td className="capitalize text-muted-foreground">{b.cabin}</Td>
                        <Td className="capitalize text-muted-foreground">{b.status}</Td>
                        <Td>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                              <a href={`/trip/${b._id}`}>View</a>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleViewChat(b._id)} className="h-7 text-xs">
                              Chat
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "recovery" && (
                <table className="w-full">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <Th>Disruption</Th>
                      <Th>Eligible Actions</Th>
                      <Th>Selected</Th>
                      <Th>Status</Th>
                      <Th>Reference</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recoveryRequests.map((r, i) => (
                      <tr key={r._id} className={cn("transition-colors hover:bg-muted/30", i % 2 === 0 ? "" : "bg-muted/10")}>
                        <Td className="capitalize font-medium">{r.disruptionType}</Td>
                        <Td className="text-muted-foreground">{r.eligibleActions.join(", ") || "—"}</Td>
                        <Td className="text-muted-foreground">{r.selectedAction ?? "—"}</Td>
                        <Td className="capitalize text-muted-foreground">{r.recoveryStatus}</Td>
                        <Td className="font-mono text-xs text-muted-foreground">{r.recoveryReference ?? "—"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "tickets" && (
                <table className="w-full">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <Th>Reference</Th>
                      <Th>Reason</Th>
                      <Th>Status</Th>
                      <Th>Update</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {tickets.map((t, i) => {
                      const cfg = TICKET_STATUS_CONFIG[t.status];
                      return (
                        <tr key={t.ticketId} className={cn("transition-colors hover:bg-muted/30", i % 2 === 0 ? "" : "bg-muted/10")}>
                          <Td><span className="font-mono text-xs tracking-wide font-semibold">{t.ticketReference}</span></Td>
                          <Td className="max-w-xs truncate text-muted-foreground">{t.reason}</Td>
                          <Td>
                            <Badge variant="outline" className={cn("gap-1 text-xs", cfg.className)}>
                              <span>{cfg.icon}</span>
                              {t.status}
                            </Badge>
                          </Td>
                          <Td>
                            <div className="flex gap-1">
                              {(["open", "in-review", "resolved"] as SupportTicketStatus[])
                                .filter((s) => s !== t.status)
                                .map((s) => (
                                  <Button
                                    key={s}
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleStatusChange(t.ticketId, s)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    {s}
                                  </Button>
                                ))}
                            </div>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={chatBookingId !== null} onOpenChange={(open) => !open && setChatBookingId(null)}>
        <DialogContent className="flex max-h-[80vh] flex-col gap-3">
          <DialogHeader>
            <DialogTitle>Chat history</DialogTitle>
            <DialogDescription>Conversation between the passenger and the assistant for this booking.</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto rounded-xl border bg-muted/30 p-3">
            {chatLoading ? (
              <LoadingSpinner label="Loading conversation…" />
            ) : chatMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet for this booking.</p>
            ) : (
              chatMessages.map((m) => (
                <div
                  key={m._id}
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                    m.sender === "passenger"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-card text-card-foreground ring-1 ring-foreground/10"
                  )}
                >
                  {m.message}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
