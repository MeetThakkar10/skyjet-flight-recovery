import { api } from "./client";
import type { Booking, Passenger, RecoveryRequest, SupportTicketResult, SupportTicketStatus } from "@/types";

export function listPassengers(q?: string) {
  return api.get<{ passengers: Passenger[] }>(`/api/admin/passengers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

export function listBookings(q?: string) {
  return api.get<{ bookings: Booking[] }>(`/api/admin/bookings${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

export function listRecoveryRequests(q?: string) {
  return api.get<{ recoveryRequests: RecoveryRequest[] }>(
    `/api/admin/recovery-requests${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export function listSupportTickets(q?: string) {
  return api.get<{ tickets: SupportTicketResult[] }>(
    `/api/admin/support-tickets${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export function updateTicketStatus(ticketId: string, status: SupportTicketStatus) {
  return api.patch<{ ticket: SupportTicketResult }>(`/api/admin/support-tickets/${ticketId}/status`, { status });
}
