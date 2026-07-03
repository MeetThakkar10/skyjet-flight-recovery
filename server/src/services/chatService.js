import Booking from "../models/Booking.js";
import ChatMessage from "../models/ChatMessage.js";
import { getFlight, getPassenger } from "./airlineClient.js";
import { evaluateRecovery } from "./recoveryDecisionEngine.js";
import { ApiError } from "../middleware/errorHandler.js";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const MODEL = "mistral-small-latest";

function buildSystemPrompt(passenger, booking, flight, recovery) {
  return [
    "You are SkyJet's flight recovery assistant, helping a passenger with their disrupted trip.",
    "Be concise, warm, and practical. Only discuss this passenger's booking and general airline",
    "policy — do not invent facts about flights or policies you weren't given.",
    "",
    `Passenger: ${passenger?.firstName ?? ""} ${passenger?.lastName ?? ""}`.trim(),
    `PNR: ${booking.pnr}`,
    `Flight: ${flight.flightNumber} (${flight.origin} -> ${flight.destination})`,
    `Flight status: ${flight.status}`,
    flight.disruptionType !== "none" ? `Disruption type: ${flight.disruptionType}` : "",
    flight.delayMinutes > 0 ? `Delay: ${flight.delayMinutes} minutes` : "",
    flight.reason ? `Reason given to passenger: ${flight.reason}` : "",
    flight.gate ? `Gate: ${flight.gate}` : "",
    flight.terminal ? `Terminal: ${flight.terminal}` : "",
    `Actions currently available to this passenger: ${recovery.eligibleActions.join(", ") || "none — flight is on schedule"}`,
    "",
    "If the passenger asks to rebook, get a refund, claim a voucher, or raise a ticket, tell them",
    "which of the above actions apply and that they can use the buttons on their trip page to do it —",
    "you cannot perform these actions yourself in this conversation.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function callMistral(messages) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new ApiError(500, "Chat is not configured (missing MISTRAL_API_KEY)");

  const res = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(502, `Chat service error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't come up with a response just now.";
}

export async function getChatHistory(bookingId) {
  return ChatMessage.find({ bookingId }).sort({ createdAt: 1 });
}

export async function sendMessage(bookingId, userMessage) {
  if (!userMessage?.trim()) throw new ApiError(400, "message is required");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  const flight = await getFlight(booking.flightId);
  if (!flight) throw new ApiError(404, "Flight not found");
  const passenger = await getPassenger(booking.passengerId);
  const recovery = evaluateRecovery(flight, booking);

  const history = await getChatHistory(bookingId);
  const messages = [
    { role: "system", content: buildSystemPrompt(passenger, booking, flight, recovery) },
    ...history.map((m) => ({ role: m.sender === "passenger" ? "user" : "assistant", content: m.message })),
    { role: "user", content: userMessage.trim() },
  ];

  await ChatMessage.create({ bookingId, sender: "passenger", message: userMessage.trim() });
  const reply = await callMistral(messages);
  await ChatMessage.create({ bookingId, sender: "assistant", message: reply });

  return reply;
}
