import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "Passenger", required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in-review", "resolved"],
      default: "open",
    },
    ticketReference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
