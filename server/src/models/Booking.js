import mongoose from "mongoose";

const rebookingSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      enum: ["none", "auto-rebooked", "pending-selection", "escalated"],
      default: "none",
    },
    newFlightId: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", default: null },
    rebookedAt: { type: Date, default: null },
  },
  { _id: false }
);

const refundSchema = new mongoose.Schema(
  {
    eligibilityState: {
      type: String,
      enum: ["not-applicable", "eligible", "not-eligible", "escalated"],
      default: "not-applicable",
    },
    determinedAt: { type: Date, default: null },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const escalationSchema = new mongoose.Schema(
  {
    flagged: { type: Boolean, default: false },
    reason: { type: String, default: "" },
    queuedAt: { type: Date, default: null },
    queueStatus: { type: String, enum: ["pending", "in-review"], default: "pending" },
    escalationRef: { type: String, default: null },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    pnr: { type: String, required: true, unique: true, uppercase: true, trim: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "Passenger", required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
    cabin: { type: String, required: true },
    status: {
      type: String,
      enum: ["confirmed", "rebooked", "cancelled", "refund-pending"],
      default: "confirmed",
    },
    rebooking: { type: rebookingSchema, default: () => ({}) },
    refund: { type: refundSchema, default: () => ({}) },
    escalation: { type: escalationSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
