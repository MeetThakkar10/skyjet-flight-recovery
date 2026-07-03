# API Design

Base URL: `http://localhost:4000`. All responses are JSON. Errors use
`{ "error": "message" }` with an appropriate HTTP status (400, 404, 500).

## Simulated airline data service (`/api/mock/*`)

Stands in for a real airline system. Not called by the client directly — only
by the app backend, through `services/airlineClient.js`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/mock/flights/:id` | Flight detail |
| GET | `/api/mock/flights/:id/alternatives` | Raw candidate flights on the same route within a 48h window |
| GET | `/api/mock/passengers/:id` | Passenger detail |
| GET | `/api/mock/bookings/pnr/:pnr` | Booking lookup by PNR |

## App backend (`/api/*`)

Called directly by the client.

### `POST /api/trips/lookup`
Look up a trip by PNR + last name (case-insensitive).

Request body:
```json
{ "pnr": "SJRBK1", "lastName": "Mehta" }
```
Response `200`:
```json
{
  "bookingId": "...", "pnr": "SJRBK1", "passengerName": "Chirag Mehta",
  "flight": { "...": "Flight document" },
  "bookingStatus": "confirmed",
  "rebooking": { "state": "none", "newFlightId": null, "rebookedAt": null },
  "refund": { "eligibilityState": "not-applicable", "determinedAt": null, "reason": "" },
  "escalation": { "flagged": false, "reason": "", "queuedAt": null, "queueStatus": "pending", "escalationRef": null }
}
```
Response `404`: no matching trip.

### `GET /api/bookings/:id`
Full booking + flight detail, used to refresh state on any page.
Response `200`: `{ "booking": {...}, "flight": {...} }`

### `GET /api/flights/:id/alternatives?bookingId=<id>`
Candidate alternate flights for a cancelled flight. When `bookingId` is
provided, the response also reports whether the rebooking engine would
auto-confirm a selection — so the UI can show an escalation notice upfront
instead of after the passenger picks a flight.

Response `200`:
```json
{
  "alternatives": [{ "flightId": "...", "flightNumber": "SJ201", "departureTime": "...", "arrivalTime": "...", "cabinClasses": ["economy"], "seatsAvailable": { "economy": 12 } }],
  "canAutoRebook": true,
  "escalationReason": null
}
```

### `POST /api/bookings/:id/rebook`
Confirm rebooking onto a chosen alternate. The server re-validates against
the same rules used to compute `canAutoRebook` — a `newFlightId` from a stale
alternatives list can still be escalated instead of confirmed.

Request body: `{ "newFlightId": "..." }` (omit if the booking cannot
auto-rebook — the server will escalate immediately)

Response `200`:
```json
{ "result": "confirmed", "booking": { "...": "updated Booking document" } }
```
or
```json
{ "result": "escalated", "booking": { "...": "updated Booking document" } }
```

### `GET /api/bookings/:id/refund-eligibility`
Computes and persists a refund eligibility determination. Status/determination
only — never issues a payment.

Response `200`:
```json
{ "eligibilityState": "eligible", "reason": "Flight cancelled, no accepted rebooking — full refund eligible", "determinedAt": "..." }
```
`eligibilityState` is one of `not-applicable | eligible | not-eligible | escalated`.

### `POST /api/bookings/:id/escalate`
Flags the booking for agent follow-up. Used both as the target of automatic
escalation and the "Talk to an agent" button.

Request body: `{ "reason": "optional override" }`

Response `200`:
```json
{ "escalationRef": "ESC-8E62C537", "queuedAt": "...", "queueStatus": "pending" }
```
