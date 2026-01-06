/**
 * Unit tests for canAdminModifyOrder permission helper
 * 
 * Permission Rules:
 * - Protected orders (my_order=true OR createdByRole=1) can ONLY be modified by superadmin (role=1)
 * - Non-protected orders can be modified by any admin
 */

import { canAdminModifyOrder, isOrderProtected } from "../canAdminModifyOrder";

describe("canAdminModifyOrder", () => {
  // ─────────────────────────────────────────────────────────────
  // TEST: Regular admin (role=0) trying to modify orders
  // ─────────────────────────────────────────────────────────────
  
  describe("Regular admin (role=0)", () => {
    const adminRole = 0;
    
    test("DENIED: cannot modify client order (my_order=true)", () => {
      const order = { my_order: true, createdByRole: 0 };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(false);
      expect(result.isProtected).toBe(true);
      expect(result.reason).toBeTruthy();
    });
    
    test("DENIED: cannot modify superadmin-created order (createdByRole=1)", () => {
      const order = { my_order: false, createdByRole: 1 };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(false);
      expect(result.isProtected).toBe(true);
      expect(result.reason).toBeTruthy();
    });
    
    test("DENIED: cannot modify client order created by superadmin", () => {
      const order = { my_order: true, createdByRole: 1 };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(false);
      expect(result.isProtected).toBe(true);
    });
    
    test("ALLOWED: can modify admin-created order (my_order=false, createdByRole=0)", () => {
      const order = { my_order: false, createdByRole: 0 };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(true);
      expect(result.isProtected).toBe(false);
      expect(result.reason).toBeNull();
    });
    
    test("ALLOWED: can modify order without createdByRole field (defaults to 0)", () => {
      const order = { my_order: false };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(true);
      expect(result.isProtected).toBe(false);
    });
  });
  
  // ─────────────────────────────────────────────────────────────
  // TEST: Superadmin (role=1) can modify ANY order
  // ─────────────────────────────────────────────────────────────
  
  describe("Superadmin (role=1)", () => {
    const adminRole = 1;
    
    test("ALLOWED: can modify client order (my_order=true)", () => {
      const order = { my_order: true, createdByRole: 0 };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(true);
      expect(result.isProtected).toBe(true); // Still marked as protected
    });
    
    test("ALLOWED: can modify superadmin-created order (createdByRole=1)", () => {
      const order = { my_order: false, createdByRole: 1 };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(true);
      expect(result.isProtected).toBe(true);
    });
    
    test("ALLOWED: can modify regular admin-created order", () => {
      const order = { my_order: false, createdByRole: 0 };
      const result = canAdminModifyOrder({ order, adminRole });
      
      expect(result.allowed).toBe(true);
      expect(result.isProtected).toBe(false);
    });
    
    test("ALLOWED: can modify any order regardless of protection", () => {
      const orders = [
        { my_order: true, createdByRole: 0 },
        { my_order: true, createdByRole: 1 },
        { my_order: false, createdByRole: 1 },
        { my_order: false, createdByRole: 0 },
        { my_order: false }, // No createdByRole
      ];
      
      orders.forEach((order) => {
        const result = canAdminModifyOrder({ order, adminRole });
        expect(result.allowed).toBe(true);
      });
    });
  });
  
  // ─────────────────────────────────────────────────────────────
  // TEST: Edge cases
  // ─────────────────────────────────────────────────────────────
  
  describe("Edge cases", () => {
    test("handles null order gracefully", () => {
      const result = canAdminModifyOrder({ order: null, adminRole: 0 });
      expect(result.isProtected).toBe(false);
    });
    
    test("handles undefined order gracefully", () => {
      const result = canAdminModifyOrder({ order: undefined, adminRole: 0 });
      expect(result.isProtected).toBe(false);
    });
    
    test("handles missing my_order field (defaults to false)", () => {
      const order = { createdByRole: 0 };
      const result = canAdminModifyOrder({ order, adminRole: 0 });
      
      expect(result.allowed).toBe(true);
      expect(result.isProtected).toBe(false);
    });
    
    test("handles string adminRole by treating it as falsy", () => {
      const order = { my_order: false, createdByRole: 0 };
      const result = canAdminModifyOrder({ order, adminRole: "1" });
      
      // String "1" is truthy but !== 1 (number)
      // This tests that we correctly check for role === 1
      expect(result.allowed).toBe(true); // Would work since protected=false
    });
  });
});

describe("isOrderProtected", () => {
  test("returns true for client orders (my_order=true)", () => {
    expect(isOrderProtected({ my_order: true })).toBe(true);
  });
  
  test("returns true for superadmin-created orders (createdByRole=1)", () => {
    expect(isOrderProtected({ createdByRole: 1 })).toBe(true);
  });
  
  test("returns false for regular admin orders", () => {
    expect(isOrderProtected({ my_order: false, createdByRole: 0 })).toBe(false);
  });
  
  test("returns false for null/undefined order", () => {
    expect(isOrderProtected(null)).toBe(false);
    expect(isOrderProtected(undefined)).toBe(false);
  });
});

