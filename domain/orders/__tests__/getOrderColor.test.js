/**
 * Tests for getOrderColor
 * 
 * Ensures that getOrderColor returns correct color configuration
 * for all 4 combinations of (confirmed, my_order)
 */

import { getOrderColor } from "../getOrderColor";

describe("getOrderColor", () => {
  it("should return PENDING_ADMIN for null/undefined order", () => {
    const result = getOrderColor(null);
    expect(result.key).toBe("PENDING_ADMIN");
    expect(result).toHaveProperty("main");
    expect(result).toHaveProperty("bg");
  });

  it("should return CONFIRMED_CLIENT for confirmed + my_order=true", () => {
    const order = { confirmed: true, my_order: true };
    const result = getOrderColor(order);
    expect(result.key).toBe("CONFIRMED_CLIENT");
    expect(result.main).toBeTruthy();
    expect(result.bg).toBeTruthy();
  });

  it("should return CONFIRMED_ADMIN for confirmed + my_order=false", () => {
    const order = { confirmed: true, my_order: false };
    const result = getOrderColor(order);
    expect(result.key).toBe("CONFIRMED_ADMIN");
    expect(result.main).toBeTruthy();
    expect(result.bg).toBeTruthy();
  });

  it("should return PENDING_CLIENT for !confirmed + my_order=true", () => {
    const order = { confirmed: false, my_order: true };
    const result = getOrderColor(order);
    expect(result.key).toBe("PENDING_CLIENT");
    expect(result.main).toBeTruthy();
    expect(result.bg).toBeTruthy();
  });

  it("should return PENDING_ADMIN for !confirmed + my_order=false", () => {
    const order = { confirmed: false, my_order: false };
    const result = getOrderColor(order);
    expect(result.key).toBe("PENDING_ADMIN");
    expect(result.main).toBeTruthy();
    expect(result.bg).toBeTruthy();
  });

  it("should always return object with required fields", () => {
    const testCases = [
      { confirmed: true, my_order: true },
      { confirmed: true, my_order: false },
      { confirmed: false, my_order: true },
      { confirmed: false, my_order: false },
    ];

    testCases.forEach((order) => {
      const result = getOrderColor(order);
      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("main");
      expect(result).toHaveProperty("light");
      expect(result).toHaveProperty("dark");
      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("bg");
      expect(result).toHaveProperty("label");
      expect(result).toHaveProperty("labelEn");
      
      // Ensure colors are strings
      expect(typeof result.main).toBe("string");
      expect(typeof result.light).toBe("string");
      expect(typeof result.dark).toBe("string");
      expect(typeof result.text).toBe("string");
      expect(typeof result.bg).toBe("string");
      
      // Ensure labels are strings
      expect(typeof result.label).toBe("string");
      expect(typeof result.labelEn).toBe("string");
    });
  });

  it("should not depend on other order fields", () => {
    const order1 = { confirmed: true, my_order: true, rentalStartDate: "2024-01-01" };
    const order2 = { confirmed: true, my_order: true, rentalEndDate: "2024-01-10" };
    
    expect(getOrderColor(order1)).toEqual(getOrderColor(order2));
    expect(getOrderColor(order1)).toEqual(ORDER_COLORS.CONFIRMED_CLIENT);
  });
});

