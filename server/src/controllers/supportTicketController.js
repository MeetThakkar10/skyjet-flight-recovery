import { createSupportTicket, getTicketById, getOpenTicketForBooking } from "../services/supportTicketService.js";
import { ApiError } from "../middleware/errorHandler.js";

export function serialize(ticket) {
  return {
    ticketId: ticket._id,
    bookingId: ticket.bookingId,
    reason: ticket.reason,
    ticketReference: ticket.ticketReference,
    status: ticket.status,
    createdAt: ticket.createdAt,
  };
}

export async function createSupportTicketController(req, res, next) {
  try {
    const { bookingId, reason } = req.body;
    if (!bookingId) throw new ApiError(400, "bookingId is required");

    const ticket = await createSupportTicket(bookingId, reason);
    res.status(201).json(serialize(ticket));
  } catch (err) {
    next(err);
  }
}

export async function getSupportTicketController(req, res, next) {
  try {
    const ticket = await getTicketById(req.params.ticketId);
    res.json(serialize(ticket));
  } catch (err) {
    next(err);
  }
}

export async function getOpenSupportTicketController(req, res, next) {
  try {
    const { bookingId } = req.query;
    if (!bookingId) throw new ApiError(400, "bookingId query param is required");

    const ticket = await getOpenTicketForBooking(bookingId);
    res.json({ ticket: ticket ? serialize(ticket) : null });
  } catch (err) {
    next(err);
  }
}
