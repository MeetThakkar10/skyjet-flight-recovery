import {
  listPassengers,
  listBookings,
  listRecoveryRequests,
  listSupportTickets,
  updateTicketStatus,
} from "../services/adminService.js";
import { serialize as serializeTicket } from "./supportTicketController.js";

export async function listPassengersController(req, res, next) {
  try {
    res.json({ passengers: await listPassengers(req.query.q) });
  } catch (err) {
    next(err);
  }
}

export async function listBookingsController(req, res, next) {
  try {
    res.json({ bookings: await listBookings(req.query.q) });
  } catch (err) {
    next(err);
  }
}

export async function listRecoveryRequestsController(req, res, next) {
  try {
    res.json({ recoveryRequests: await listRecoveryRequests(req.query.q) });
  } catch (err) {
    next(err);
  }
}

export async function listSupportTicketsController(req, res, next) {
  try {
    const tickets = await listSupportTickets(req.query.q);
    res.json({ tickets: tickets.map(serializeTicket) });
  } catch (err) {
    next(err);
  }
}

export async function updateTicketStatusController(req, res, next) {
  try {
    const ticket = await updateTicketStatus(req.params.ticketId, req.body.status);
    res.json({ ticket: serializeTicket(ticket) });
  } catch (err) {
    next(err);
  }
}
