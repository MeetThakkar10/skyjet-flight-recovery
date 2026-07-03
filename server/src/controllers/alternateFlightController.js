import { getAlternateFlightsForBooking } from "../services/alternateFlightService.js";

export async function getAlternateFlightsController(req, res, next) {
  try {
    const result = await getAlternateFlightsForBooking(req.params.bookingId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
