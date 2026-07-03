export interface Passenger {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export type FlightStatus = "on-time" | "delayed" | "cancelled";
export type FareType = "standard" | "special" | "multi-leg";
export type DisruptionType =
  | "none"
  | "technical"
  | "weather"
  | "crew-unavailable"
  | "seat-unavailable"
  | "missed-connection";

export interface Flight {
  _id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: FlightStatus;
  cabinClasses: string[];
  fareType: FareType;
  international: boolean;
  seatsAvailable: Record<string, number>;
  disruptionType: DisruptionType;
  delayMinutes: number;
  reason: string;
  gate: string;
  terminal: string;
}

export type RebookingState = "none" | "auto-rebooked" | "pending-selection" | "escalated";
export type RefundEligibilityState = "not-applicable" | "eligible" | "not-eligible" | "escalated";
export type QueueStatus = "pending" | "in-review";

export interface Rebooking {
  state: RebookingState;
  newFlightId: string | null;
  rebookedAt: string | null;
}

export interface Refund {
  eligibilityState: RefundEligibilityState;
  determinedAt: string | null;
  reason: string;
}

export interface Escalation {
  flagged: boolean;
  reason: string;
  queuedAt: string | null;
  queueStatus: QueueStatus;
  escalationRef: string | null;
}

export type BookingStatus = "confirmed" | "rebooked" | "cancelled" | "refund-pending";

export interface Booking {
  _id: string;
  pnr: string;
  passengerId: string;
  flightId: string;
  cabin: string;
  status: BookingStatus;
  rebooking: Rebooking;
  refund: Refund;
  escalation: Escalation;
}

export interface TripSummary {
  bookingId: string;
  pnr: string;
  passengerName: string;
  flight: Flight;
  bookingStatus: BookingStatus;
  rebooking: Rebooking;
  refund: Refund;
  escalation: Escalation;
}

export interface AlternateFlight {
  flightId: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  cabinClasses: string[];
  seatsAvailable: Record<string, number>;
}

export interface AlternativesResult {
  alternatives: AlternateFlight[];
  canAutoRebook: boolean | null;
  escalationReason: string | null;
}

export interface RebookResult {
  result: "confirmed" | "escalated";
  booking: Booking;
}

export interface RefundEligibilityResult {
  eligibilityState: RefundEligibilityState;
  reason: string;
  determinedAt: string;
}

export interface EscalationResult {
  escalationRef: string;
  queuedAt: string;
  queueStatus: QueueStatus;
}

// --- Recovery System ---

export type EligibleAction = "keep-current" | "rebook" | "refund" | "voucher" | "contact-support";
export type RecoveryStatus = "pending" | "informed" | "rebooked" | "refunded" | "voucher-issued" | "escalated" | "resolved";

export interface RecoveryRequest {
  _id: string;
  bookingId: string;
  passengerId: string;
  flightId: string;
  disruptionType: DisruptionType;
  delayMinutes: number;
  eligibleActions: EligibleAction[];
  selectedAction: EligibleAction | null;
  recoveryStatus: RecoveryStatus;
  refundEligible: boolean;
  previousFlight: string | null;
  newFlight: string | null;
  recoveryReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisruptionContext {
  disruptionType: DisruptionType;
  delayMinutes: number;
  reason: string;
  gate: string;
  terminal: string;
}

export interface RecoveryOptionsResult {
  recoveryRequest: RecoveryRequest;
  flight: Flight;
  disruptionContext: DisruptionContext;
}

export interface RebookConfirmation {
  result: "confirmed";
  booking: Booking;
  recoveryRequest: RecoveryRequest;
  recoveryReference: string;
}

export interface RefundRequestResult {
  eligibilityState: RefundEligibilityState;
  reason: string;
  refundEligible: boolean;
  recoveryRequest: RecoveryRequest;
}

export type SupportTicketStatus = "open" | "in-review" | "resolved";

export interface SupportTicketResult {
  ticketId: string;
  bookingId: string;
  reason: string;
  ticketReference: string;
  status: SupportTicketStatus;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  bookingId: string;
  sender: "passenger" | "assistant";
  message: string;
  createdAt: string;
}

// --- Accounts ---

export type UserRole = "passenger" | "staff";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface CaptchaChallenge {
  captchaId: string;
  svg: string;
}

export interface AlternateFlightCardData {
  flightId: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabin: string;
  availableSeats: number;
  status: FlightStatus;
}
