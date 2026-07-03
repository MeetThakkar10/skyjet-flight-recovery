import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, unique: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["on-time", "delayed", "cancelled"],
      default: "on-time",
    },
    cabinClasses: { type: [String], default: ["economy"] },
    fareType: {
      type: String,
      enum: ["standard", "special", "multi-leg"],
      default: "standard",
    },
    international: { type: Boolean, default: false },
    seatsAvailable: {
      type: Map,
      of: Number,
      default: {},
    },
    disruptionType: {
      type: String,
      enum: ["none", "technical", "weather", "crew-unavailable", "seat-unavailable", "missed-connection"],
      default: "none",
    },
    delayMinutes: { type: Number, default: 0, min: 0 },
    reason: { type: String, default: "" },
    gate: { type: String, default: "" },
    terminal: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

flightSchema.virtual("route").get(function () {
  return `${this.origin}-${this.destination}`;
});

export default mongoose.model("Flight", flightSchema);
