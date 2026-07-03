# 5-Minute Demo Script

Setup beforehand: `server` and `client` both running (`npm run dev` in each),
database freshly seeded (`npm run seed` in `server`). Have `http://localhost:5173`
open in the browser.

## 1. Frame the problem (30s)

"During weather disruptions, 40% of SkyJet passengers call in just to ask:
is my flight cancelled, can I move to another flight, or am I owed a refund.
Average wait is 25 minutes. This MVP answers all three without an agent —
and knows when *not* to guess."

## 2. On-time flight — the non-event (30s)

- Enter PNR `SJONT1`, last name `Shah`, submit.
- Point out: status badge, no action buttons — because there's nothing to
  self-serve when the flight is fine. Don't show disruption UI for
  non-disrupted passengers.

## 3. Cancelled + auto-rebook (90s)

- Go back, enter PNR `SJRBK1`, last name `Mehta`.
- Point out the "Cancelled" badge and the three action buttons.
- Click **Find another flight**. Two same-route, same-cabin alternates
  appear immediately, pulled live from the mock airline API.
- Click **Select** on the first one. Confirmed instantly — no agent needed,
  no hold time.

## 4. Cancelled + escalation (90s)

- Go back, enter PNR `SJINT1`, last name `Rodrigues` (an international
  itinerary).
- Click **Find another flight**. Instead of a flight list, the passenger
  sees upfront that this itinerary needs agent review — *before* they pick
  anything and get surprised. Click **Get agent help with rebooking**.
- Land on the escalation confirmation screen: reference number, 24-hour
  turnaround, no phone call required. Same screen the "Talk to an agent"
  button reaches from anywhere.

## 5. Refund eligibility (60s)

- Go back, enter PNR `SJRFD1`, last name `Khan`.
- Click **Check refund eligibility**. Instant determination: "Eligible for
  refund" with the reasoning shown — cancelled flight, standard fare, no
  accepted rebooking. No payment is issued here; this is a status check the
  passenger can act on (or that feeds a downstream refund process).

## 6. Close (30s)

- One line on architecture: "the mock airline API is a deliberate seam — one
  adapter file is the only thing that changes when this plugs into SkyJet's
  real systems."
- One line on scope: "we automate the clear-cut cases and get out of the way
  for the rest — international fares, missing alternates, anything the rules
  aren't confident about goes straight to an agent with full context already
  attached, instead of a passenger repeating themselves on hold."
