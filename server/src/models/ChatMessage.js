import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    sender: { type: String, enum: ["passenger", "assistant"], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
