import { describe, it, expect } from "vitest";
import {
  signPayload,
  verifySignature,
  createBusQrPayload,
  verifyBusQrPayload,
  createDayPassToken,
  verifyDayPassToken
} from "../src/lib/verification";

describe("signing primitives", () => {
  it("verifies a signature produced with the same secret", async () => {
    const sig = await signPayload("bus-123", "secret-a");
    expect(await verifySignature("bus-123", sig, "secret-a")).toBe(true);
  });

  it("rejects a signature checked against the wrong secret", async () => {
    const sig = await signPayload("bus-123", "secret-a");
    expect(await verifySignature("bus-123", sig, "secret-b")).toBe(false);
  });

  it("rejects a tampered payload even with a valid-looking signature", async () => {
    const sig = await signPayload("bus-123", "secret-a");
    expect(await verifySignature("bus-999", sig, "secret-a")).toBe(false);
  });
});

describe("bus QR payload", () => {
  it("round-trips: created payload verifies back to the same busId", async () => {
    const token = await createBusQrPayload("bus-7", "fleet-secret");
    const busId = await verifyBusQrPayload(token, "fleet-secret");
    expect(busId).toBe("bus-7");
  });

  it("a QR generated for one bus's secret fails against another bus's secret", async () => {
    const token = await createBusQrPayload("bus-7", "secret-for-bus-7");
    const busId = await verifyBusQrPayload(token, "secret-for-bus-9");
    expect(busId).toBeNull();
  });

  it("garbage / non-JSON scanned text fails closed rather than throwing", async () => {
    const busId = await verifyBusQrPayload("not-a-real-qr-payload", "any-secret");
    expect(busId).toBeNull();
  });

  it("a photographed/screenshotted QR still verifies (static QR is meant to be reusable)", async () => {
    const token = await createBusQrPayload("bus-11", "s");
    // Simulate "scanning the same static token again tomorrow" —
    // the token itself is still valid; it's evaluateCheckIn's
    // alreadyUsedToday flag that blocks repeat boarding, not the
    // signature check.
    const busId1 = await verifyBusQrPayload(token, "s");
    const busId2 = await verifyBusQrPayload(token, "s");
    expect(busId1).toBe("bus-11");
    expect(busId2).toBe("bus-11");
  });
});

describe("day-pass token", () => {
  it("round-trips and reports allowed=true correctly", async () => {
    const token = await createDayPassToken({ studentId: "s1", date: "2026-09-18", allowed: true }, "secret");
    const payload = await verifyDayPassToken(token, "secret");
    expect(payload?.allowed).toBe(true);
    expect(payload?.studentId).toBe("s1");
  });

  it("fails verification if the secret differs (e.g. stale cached secret after rotation)", async () => {
    const token = await createDayPassToken({ studentId: "s1", date: "2026-09-18", allowed: true }, "secret-old");
    const payload = await verifyDayPassToken(token, "secret-new");
    expect(payload).toBeNull();
  });
});
