import bcrypt from "bcryptjs";
import Passenger from "../models/Passenger.js";
import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { passengers, flights, bookings } from "./seedData.js";

const DEMO_STAFF_EMAIL = "staff@skyjet.com";
const DEMO_STAFF_PASSWORD = "StaffDemo123";

// Upserted (not wiped) on every seed run so re-seeding doesn't invalidate
// existing registered accounts or force the demo staff login to change.
async function seedStaffUser() {
  const passwordHash = await bcrypt.hash(DEMO_STAFF_PASSWORD, 10);
  await User.findOneAndUpdate(
    { email: DEMO_STAFF_EMAIL },
    { name: "SkyJet Staff", email: DEMO_STAFF_EMAIL, passwordHash, role: "staff" },
    { upsert: true }
  );
}

export async function seedDatabase() {
  await Booking.deleteMany({});
  await Flight.deleteMany({});
  await Passenger.deleteMany({});

  const passengerDocs = await Passenger.insertMany(passengers);
  const flightDocs = await Flight.insertMany(flights);

  const passengerByKey = Object.fromEntries(passengers.map((p, i) => [p.key, passengerDocs[i]._id]));
  const flightByKey = Object.fromEntries(flights.map((f, i) => [f.key, flightDocs[i]._id]));

  const bookingDocs = await Booking.insertMany(
    bookings.map((b) => ({
      pnr: b.pnr,
      passengerId: passengerByKey[b.passengerKey],
      flightId: flightByKey[b.flightKey],
      cabin: b.cabin,
    }))
  );

  await seedStaffUser();

  console.log(`Seeded ${passengerDocs.length} passengers, ${flightDocs.length} flights, ${bookingDocs.length} bookings`);
  console.log("Demo PNR / last name pairs:");
  bookings.forEach((b) => {
    const passenger = passengers.find((p) => p.key === b.passengerKey);
    console.log(`  PNR ${b.pnr}  /  last name "${passenger.lastName}"`);
  });
  console.log(`Demo staff login: ${DEMO_STAFF_EMAIL} / ${DEMO_STAFF_PASSWORD}`);
}
