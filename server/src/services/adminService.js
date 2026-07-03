import Passenger from "../models/Passenger.js";
import Booking from "../models/Booking.js";
import RecoveryRequest from "../models/RecoveryRequest.js";
import SupportTicket from "../models/SupportTicket.js";
import { ApiError } from "../middleware/errorHandler.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listPassengers(q) {
  const filter = q
    ? {
        $or: [
          { firstName: new RegExp(escapeRegExp(q), "i") },
          { lastName: new RegExp(escapeRegExp(q), "i") },
          { email: new RegExp(escapeRegExp(q), "i") },
        ],
      }
    : {};
  return Passenger.find(filter).sort({ createdAt: -1 });
}

export async function listBookings(q) {
  const filter = q ? { pnr: new RegExp(escapeRegExp(q), "i") } : {};
  return Booking.find(filter).sort({ createdAt: -1 });
}

export async function listRecoveryRequests(q) {
  const filter = q ? { recoveryReference: new RegExp(escapeRegExp(q), "i") } : {};
  return RecoveryRequest.find(filter).sort({ createdAt: -1 });
}

export async function listSupportTickets(q) {
  const filter = q
    ? {
        $or: [
          { ticketReference: new RegExp(escapeRegExp(q), "i") },
          { status: new RegExp(escapeRegExp(q), "i") },
        ],
      }
    : {};
  return SupportTicket.find(filter).sort({ createdAt: -1 });
}

export async function updateTicketStatus(ticketId, status) {
  if (!["open", "in-review", "resolved"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
  const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { status }, { new: true });
  if (!ticket) throw new ApiError(404, "Ticket not found");
  return ticket;
}
