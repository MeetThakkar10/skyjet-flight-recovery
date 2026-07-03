import mongoose from "mongoose";

const DISRUPTION_TYPES = ["none", "technical", "weather", "crew-unavailable", "seat-unavailable", "missed-connection"];
const ACTIONS = ["keep-current", "rebook", "refund", "voucher", "contact-support"];

const recoveryRequestSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "Passenger", required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },

    disruptionType: { type: String, enum: DISRUPTION_TYPES, default: "none" },
    delayMinutes: { type: Number, default: 0 },

    eligibleActions: { type: [String], enum: ACTIONS, default: [] },
    selectedAction: { type: String, enum: [...ACTIONS, null], default: null },

    recoveryStatus: {
      type: String,
      enum: ["pending", "informed", "rebooked", "refunded", "voucher-issued", "escalated", "resolved"],
      default: "pending",
    },

    refundEligible: { type: Boolean, default: false },

    previousFlight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", default: null },
    newFlight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", default: null },

    recoveryReference: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model("RecoveryRequest", recoveryRequestSchema);
