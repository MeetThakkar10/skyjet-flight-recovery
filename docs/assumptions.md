# Key Assumptions

- **No payment integration.** Refund eligibility is a status determination
  only (`eligible / not-eligible / escalated`) — no payment is ever issued by
  this system, per the challenge constraints.
- **No real airline API.** Flight/passenger/booking data is served by a small
  mock Express + MongoDB service (`/api/mock/*`) rather than a real airline
  system. It's designed to be swappable: the app backend only ever talks to
  it through one adapter (`services/airlineClient.js`), so a real integration
  later only touches that file.
- **PNR + last name is sufficient "authentication" for this MVP.** No
  password, OTP, or account system — matching what a passenger could read off
  a boarding pass or confirmation email. The booking's MongoDB ObjectId,
  returned after a successful lookup, is held client-side (React context +
  `sessionStorage`) and used to scope every subsequent request. This is not
  a secure session mechanism and would need real auth before production use.
- **Escalation queue is simulated.** "Talk to an agent" and auto-escalation
  both just set a flag/reference/timestamp on the Booking document and show a
  confirmation screen. There's no real ticketing system, live queue, or agent
  notification — no messages are actually sent.
- **Alternate-flight matching is simplified.** Alternates are found by same
  origin/destination, non-cancelled status, and departure within a 48-hour
  window of the original flight — not a full fare-rules or connections
  engine. Real rebooking logic (codeshares, multi-city itineraries, fare
  bucket rules) would need airline-specific business rules.
- **Auto vs. escalate split is rule-based, not ML-based.** A cancelled flight
  auto-rebooks/auto-determines refund eligibility only if it's domestic and
  standard-fare, and (for rebooking) a matching same-cabin alternate with
  seats exists. International, special, or multi-leg fares always escalate,
  as does any case with no matching alternate. These thresholds are a
  starting point for the MVP, not validated against real fare-rule data.
- **Single currency/timezone, no notifications.** All demo data uses one
  implied currency and the server's local timezone; no emails, SMS, or push
  notifications are actually sent when a booking is rebooked or escalated.
- **Delayed flights are informational only** in this MVP — no rebooking or
  refund flow is offered for delays, since the brief's three scenarios (is it
  cancelled / can I move / am I eligible) are framed around cancellation.
