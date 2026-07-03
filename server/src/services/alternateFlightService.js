import Booking from "../models/Booking.js";
import { getFlight, getAlternateFlights } from "./airlineClient.js";
import { ApiError } from "../middleware/errorHandler.js";

function formatDuration(departureTime, arrivalTime) {
  const minutes = Math.round((arrivalTime.getTime() - departureTime.getTime()) / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function serialize(flight, cabin) {
  return {
    flightId: flight._id,
    flightNumber: flight.flightNumber,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    duration: formatDuration(flight.departureTime, flight.arrivalTime),
    cabin,
    availableSeats: flight.seatsAvailable.get(cabin) || 0,
    status: flight.status,
  };
}

// Same underlying alternate-flight search as GET /api/flights/:id/alternatives,
// keyed by bookingId per the recovery API spec, narrowed to the passenger's own cabin.
export async function getAlternateFlightsForBooking(bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  const flight = await getFlight(booking.flightId);
  if (!flight) throw new ApiError(404, "Flight not found");

  const alternates = await getAlternateFlights(flight);
  const flights = alternates
    .filter((alt) => alt.cabinClasses.includes(booking.cabin))
    .map((alt) => serialize(alt, booking.cabin));

  return { flights };
}
