import { api } from "./client";
import type { AlternateFlightCardData } from "@/types";

export function getAlternateFlightsForBooking(bookingId: string) {
  return api.get<{ flights: AlternateFlightCardData[] }>(`/api/alternate-flights/${bookingId}`);
}
