import { processRefundRequest } from "../services/refundService.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function requestRefundController(req, res, next) {
  try {
    const { bookingId } = req.body;
    if (!bookingId) throw new ApiError(400, "bookingId is required");

    const result = await processRefundRequest(bookingId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
