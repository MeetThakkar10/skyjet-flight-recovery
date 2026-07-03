import { getMyBookings } from "../services/passengerDashboardService.js";

export async function getMyBookingsController(req, res, next) {
  try {
    const results = await getMyBookings(req.user.email);
    res.json({ bookings: results });
  } catch (err) {
    next(err);
  }
}
