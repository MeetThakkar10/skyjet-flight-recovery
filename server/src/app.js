import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mockFlightsRoutes from "./routes/mock/flights.routes.js";
import mockPassengersRoutes from "./routes/mock/passengers.routes.js";
import mockBookingsRoutes from "./routes/mock/bookings.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import flightsRoutes from "./routes/flights.routes.js";
import recoveryRoutes from "./routes/recovery.routes.js";
import rebookRoutes from "./routes/rebook.routes.js";
import refundRoutes from "./routes/refund.routes.js";
import supportTicketRoutes from "./routes/supportTicket.routes.js";
import alternateFlightsRoutes from "./routes/alternateFlights.routes.js";
import authRoutes from "./routes/auth.routes.js";
import myBookingsRoutes from "./routes/myBookings.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Credentialed CORS is required so the httpOnly auth cookie is sent/accepted
// cross-origin between the Vite dev server and this API.
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174").split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Simulated external airline API — swap point for real integrations.
app.use("/api/mock/flights", mockFlightsRoutes);
app.use("/api/mock/passengers", mockPassengersRoutes);
app.use("/api/mock/bookings", mockBookingsRoutes);

// App's own orchestration API.
app.use("/api/trips", tripsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/flights", flightsRoutes);

// Recovery System API — additive, does not replace /api/bookings|trips|flights above.
app.use("/api/recovery-options", recoveryRoutes);
app.use("/api/rebook", rebookRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/support-ticket", supportTicketRoutes);
app.use("/api/alternate-flights", alternateFlightsRoutes);

// Accounts + auth — additive, existing endpoints above remain unauthenticated.
app.use("/api/auth", authRoutes);
app.use("/api/my/bookings", myBookingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
