import { getRecoveryOptions, rebookBooking } from "../services/recoveryService.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function getRecoveryOptionsController(req, res, next) {
  try {
    const result = await getRecoveryOptions(req.params.bookingId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function rebookController(req, res, next) {
  try {
    const { bookingId, newFlightId } = req.body;
    if (!bookingId) throw new ApiError(400, "bookingId is required");

    const { booking, recoveryRequest, recoveryReference } = await rebookBooking(bookingId, newFlightId);
    res.json({ result: "confirmed", booking, recoveryRequest, recoveryReference });
  } catch (err) {
    next(err);
  }
}
