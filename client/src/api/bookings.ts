import { api } from "./client";
import type {
  Booking,
  Flight,
  AlternativesResult,
  RebookResult,
  RefundEligibilityResult,
  EscalationResult,
} from "@/types";

export function getBooking(bookingId: string) {
  return api.get<{ booking: Booking; flight: Flight }>(`/api/bookings/${bookingId}`);
}

export function getAlternatives(flightId: string, bookingId: string) {
  return api.get<AlternativesResult>(`/api/flights/${flightId}/alternatives?bookingId=${bookingId}`);
}

export function rebook(bookingId: string, newFlightId?: string) {
  return api.post<RebookResult>(`/api/bookings/${bookingId}/rebook`, { newFlightId });
}

export function getRefundEligibility(bookingId: string) {
  return api.get<RefundEligibilityResult>(`/api/bookings/${bookingId}/refund-eligibility`);
}

export function escalate(bookingId: string, reason?: string) {
  return api.post<EscalationResult>(`/api/bookings/${bookingId}/escalate`, { reason });
}
