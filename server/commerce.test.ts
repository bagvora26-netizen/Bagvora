import { describe, expect, it } from "vitest";
import { calculateCommission, calculateOrderTotal } from "../shared/commerce";

describe("commerce calculations", () => {
  it("calculates order totals with discount and never returns a negative amount", () => {
    expect(calculateOrderTotal(420, 35, 20)).toBe(435);
    expect(calculateOrderTotal(10, 0, 50)).toBe(0);
  });

  it("calculates marketer commission as a rounded percentage", () => {
    expect(calculateCommission(1250, 7.5)).toBe(93.75);
    expect(calculateCommission(100, 0)).toBe(0);
  });
});
