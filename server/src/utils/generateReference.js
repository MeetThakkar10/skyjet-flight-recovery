import crypto from "node:crypto";

// Generic reference generator, e.g. generateReference("RCV") -> "RCV-9F3A2B7C"
export function generateReference(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}
