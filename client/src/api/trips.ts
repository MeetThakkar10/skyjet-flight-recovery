import { api } from "./client";
import type { TripSummary } from "@/types";

export function lookupTrip(pnr: string, lastName: string) {
  return api.post<TripSummary>("/api/trips/lookup", { pnr, lastName });
}
