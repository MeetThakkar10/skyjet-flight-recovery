import Booking from "../models/Booking.js";
import SupportTicket from "../models/SupportTicket.js";
import { generateReference } from "../utils/generateReference.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function createSupportTicket(bookingId, reason) {
  if (!reason) throw new ApiError(400, "reason is required");
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  const ticket = await SupportTicket.create({
    bookingId: booking._id,
    passengerId: booking.passengerId,
    reason,
    ticketReference: generateReference("TCKT"),
  });

  return ticket;
}

export async function getTicketById(ticketId) {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new ApiError(404, "Ticket not found");
  return ticket;
}

// Most recent ticket for this booking that isn't resolved yet — used to avoid
// showing the raise-ticket form again when one is already open.
export async function getOpenTicketForBooking(bookingId) {
  return SupportTicket.findOne({ bookingId, status: { $ne: "resolved" } }).sort({ createdAt: -1 });
}
