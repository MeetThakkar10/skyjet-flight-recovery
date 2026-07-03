// Adapter over the simulated airline API. This is the single place that would
// change if the mock /api/mock/* routes were replaced by a real airline integration —
// callers below never touch Mongoose models directly.
import Flight from "../models/Flight.js";
import Passenger from "../models/Passenger.js";
import Booking from "../models/Booking.js";

export async function getFlight(flightId) {
  return Flight.findById(flightId);
}

export async function getPassenger(passengerId) {
  return Passenger.findById(passengerId);
}

export async function getBookingByPnr(pnr) {
  return Booking.findOne({ pnr: pnr.toUpperCase() });
}

export async function getAlternateFlights(flight) {
  const windowMs = 48 * 60 * 60 * 1000;
  return Flight.find({
    _id: { $ne: flight._id },
    origin: flight.origin,
    destination: flight.destination,
    status: { $ne: "cancelled" },
    departureTime: {
      $gte: new Date(flight.departureTime.getTime() - windowMs),
      $lte: new Date(flight.departureTime.getTime() + windowMs),
    },
  });
}
