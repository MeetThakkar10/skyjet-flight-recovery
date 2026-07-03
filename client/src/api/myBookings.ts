import { api } from "./client";
import type { Booking, Flight } from "@/types";

export interface MyBookingEntry {
  booking: Booking;
  flight: Flight | null;
}

export function getMyBookings() {
  return api.get<{ bookings: MyBookingEntry[] }>("/api/my/bookings");
}
