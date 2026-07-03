import { api } from "./client";
import type {
  RecoveryOptionsResult,
  RebookConfirmation,
  RefundRequestResult,
  SupportTicketResult,
} from "@/types";

export function getRecoveryOptions(bookingId: string) {
  return api.get<RecoveryOptionsResult>(`/api/recovery-options/${bookingId}`);
}

export function rebookViaRecovery(bookingId: string, newFlightId: string) {
  return api.post<RebookConfirmation>(`/api/rebook`, { bookingId, newFlightId });
}

export function requestRefund(bookingId: string) {
  return api.post<RefundRequestResult>(`/api/refund`, { bookingId });
}

export function createSupportTicket(bookingId: string, reason: string) {
  return api.post<SupportTicketResult>(`/api/support-ticket`, { bookingId, reason });
}

export function getSupportTicket(ticketId: string) {
  return api.get<SupportTicketResult>(`/api/support-ticket/${ticketId}`);
}

export function getOpenSupportTicket(bookingId: string) {
  return api.get<{ ticket: SupportTicketResult | null }>(`/api/support-ticket?bookingId=${bookingId}`);
}
