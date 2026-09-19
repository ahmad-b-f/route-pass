import { describe, it, expect } from "vitest";
import { evaluateCheckIn, evaluateCheckInForStudent } from "../src/lib/verification";

describe("evaluateCheckIn — core decision matrix", () => {
  it("grants when signature valid, fee active, today is a paid day, not used yet", () => {
    const result = evaluateCheckIn({
      feeActive: true,
      paidDays: ["Mon", "Wed", "Fri"],
      today: "Mon",
      alreadyUsedToday: false,
      signatureValid: true
    });
    expect(result.granted).toBe(true);
  });

  it("denies when the QR/pass signature is invalid, even if everything else is fine", () => {
    const result = evaluateCheckIn({
      feeActive: true,
      paidDays: ["Mon"],
      today: "Mon",
      alreadyUsedToday: false,
      signatureValid: false
    });
    expect(result.granted).toBe(false);
    expect(result.reason).toMatch(/signature/);
  });

  it("denies when fee is suspended, even on a correctly paid day", () => {
    const result = evaluateCheckIn({
      feeActive: false,
      paidDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      today: "Mon",
      alreadyUsedToday: false,
      signatureValid: true
    });
    expect(result.granted).toBe(false);
    expect(result.reason).toMatch(/fee suspended/);
  });

  it("denies when today is not one of the student's paid days", () => {
    const result = evaluateCheckIn({
      feeActive: true,
      paidDays: ["Mon", "Wed"],
      today: "Tue",
      alreadyUsedToday: false,
      signatureValid: true
    });
    expect(result.granted).toBe(false);
    expect(result.reason).toMatch(/not a paid day/);
  });

  it("denies a second scan the same day (already used)", () => {
    const result = evaluateCheckIn({
      feeActive: true,
      paidDays: ["Sat"],
      today: "Sat",
      alreadyUsedToday: true,
      signatureValid: true
    });
    expect(result.granted).toBe(false);
    expect(result.reason).toMatch(/already checked in/);
  });

  it("Saturday is a valid paid day when assigned", () => {
    const result = evaluateCheckIn({
      feeActive: true,
      paidDays: ["Sat"],
      today: "Sat",
      alreadyUsedToday: false,
      signatureValid: true
    });
    expect(result.granted).toBe(true);
  });

  it("Sunday is never a travel day even if somehow present in paidDays", () => {
    const result = evaluateCheckIn({
      feeActive: true,
      paidDays: ["Sun"] as any,
      today: "Sun",
      alreadyUsedToday: false,
      signatureValid: true
    });
    expect(result.granted).toBe(false);
  });

  it("a student paying for 3 days is denied on the other 3 travel days", () => {
    const threeDay = { feeActive: true, paidDays: ["Mon", "Wed", "Fri"] as const };
    const days = ["Tue", "Thu", "Sat"] as const;
    days.forEach((day) => {
      const result = evaluateCheckInForStudent(threeDay as any, day, false, true);
      expect(result.granted).toBe(false);
    });
  });

  it("checks fee status before day status when both fail (deterministic reason ordering)", () => {
    const result = evaluateCheckIn({
      feeActive: false,
      paidDays: ["Mon"],
      today: "Tue",
      alreadyUsedToday: false,
      signatureValid: true
    });
    expect(result.reason).toMatch(/fee suspended/);
  });
});
