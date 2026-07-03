import Passenger from "../models/Passenger.js";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";

// Matches the logged-in user's email against Passenger records (seeded/created
// independently of accounts) rather than storing a userId on Passenger/Booking,
// keeping this additive to the existing passenger/booking data model.
export async function getMyBookings(email) {
  const passengers = await Passenger.find({ email: email.toLowerCase().trim() });
  if (passengers.length === 0) return [];

  const passengerIds = passengers.map((p) => p._id);
  const bookings = await Booking.find({ passengerId: { $in: passengerIds } }).sort({ createdAt: -1 });
  const flightIds = bookings.map((b) => b.flightId);
  const flights = await Flight.find({ _id: { $in: flightIds } });
  const flightById = new Map(flights.map((f) => [f._id.toString(), f]));

  return bookings.map((booking) => ({
    booking,
    flight: flightById.get(booking.flightId.toString()) || null,
  }));
}
