/**
 * Unit tests for orderAccessPolicy
 * 
 * ════════════════════════════════════════════════════════════════
 * TEST MATRIX (защита от регрессий)
 * ════════════════════════════════════════════════════════════════
 * 
 * | Role       | Order    | Confirmed | Past | canView | canEdit | canDelete | PII |
 * |------------|----------|-----------|------|---------|---------|-----------|-----|
 * | ADMIN      | Client   | ❌        | ❌   | ✅      | ❌      | ✅        | ❌  |
 * | ADMIN      | Client   | ✅        | ❌   | ✅      | ✅*     | ❌        | ✅  |
 * | ADMIN      | Client   | ✅        | ✅   | ✅      | ❌      | ❌        | ✅  |
 * | ADMIN      | Client   | ❌        | ✅   | ✅      | ❌      | ❌        | ❌  |
 * | ADMIN      | Internal | any       | ❌   | ✅      | ✅      | ✅        | ✅  |
 * | ADMIN      | Internal | any       | ✅   | ✅      | ❌      | ❌        | ✅  |
 * | SUPERADMIN | any      | any       | any  | ✅      | ✅      | ✅        | ✅  |
 * 
 * * edit = только return / insurance
 */

import { getOrderAccess } from "../orderAccessPolicy";

describe("orderAccessPolicy", () => {
  // ════════════════════════════════════════════════════════════════
  // SUPERADMIN TESTS
  // ════════════════════════════════════════════════════════════════
  
  describe("SUPERADMIN", () => {
    it("has full access to any order", () => {
      const access = getOrderAccess({
        role: "SUPERADMIN",
        isClientOrder: true,
        confirmed: false,
        isPast: true,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(true);
      expect(access.canDelete).toBe(true);
      expect(access.canEditDates).toBe(true);
      expect(access.canEditReturn).toBe(true);
      expect(access.canEditInsurance).toBe(true);
      expect(access.canEditPricing).toBe(true);
      expect(access.canConfirm).toBe(true);
      expect(access.canSeeClientPII).toBe(true);
      expect(access.notifySuperadminOnEdit).toBe(false);
      expect(access.isViewOnly).toBe(false);
    });

    it("has full access to internal order", () => {
      const access = getOrderAccess({
        role: "SUPERADMIN",
        isClientOrder: false,
        confirmed: false,
        isPast: false,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(true);
      expect(access.canSeeClientPII).toBe(true);
    });
  });

  // ════════════════════════════════════════════════════════════════
  // ADMIN + CLIENT ORDER TESTS
  // ════════════════════════════════════════════════════════════════
  
  describe("ADMIN + Client Order", () => {
    it("UNCONFIRMED + FUTURE: view only, no PII, can delete", () => {
      const access = getOrderAccess({
        role: "ADMIN",
        isClientOrder: true,
        confirmed: false,
        isPast: false,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(false);
      expect(access.canDelete).toBe(true);
      expect(access.canEditDates).toBe(false);
      expect(access.canEditReturn).toBe(false);
      expect(access.canSeeClientPII).toBe(false); // 🔥 KEY TEST
      expect(access.isViewOnly).toBe(true);
    });

    it("CONFIRMED + FUTURE: limited edit, sees PII, notifies superadmin", () => {
      const access = getOrderAccess({
        role: "ADMIN",
        isClientOrder: true,
        confirmed: true,
        isPast: false,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(true);
      expect(access.canDelete).toBe(false); // ❌ can't delete confirmed
      expect(access.canEditDates).toBe(false); // ❌ can't edit dates
      expect(access.canEditReturn).toBe(true); // ✅ can edit return
      expect(access.canEditInsurance).toBe(true); // ✅ can edit insurance
      expect(access.canEditPricing).toBe(false); // ❌ can't edit pricing
      expect(access.canSeeClientPII).toBe(true); // 🔥 KEY TEST
      expect(access.notifySuperadminOnEdit).toBe(true); // 🔔 notify
      expect(access.isViewOnly).toBe(false);
    });

    it("CONFIRMED + PAST: view only, sees PII", () => {
      const access = getOrderAccess({
        role: "ADMIN",
        isClientOrder: true,
        confirmed: true,
        isPast: true,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(false);
      expect(access.canDelete).toBe(false);
      expect(access.canSeeClientPII).toBe(true); // ✅ confirmed = PII visible
      expect(access.isViewOnly).toBe(true);
    });

    it("UNCONFIRMED + PAST: view only, NO PII", () => {
      const access = getOrderAccess({
        role: "ADMIN",
        isClientOrder: true,
        confirmed: false,
        isPast: true,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(false);
      expect(access.canDelete).toBe(false);
      expect(access.canSeeClientPII).toBe(false); // 🔥 KEY TEST
      expect(access.isViewOnly).toBe(true);
    });
  });

  // ════════════════════════════════════════════════════════════════
  // ADMIN + INTERNAL ORDER TESTS
  // ════════════════════════════════════════════════════════════════
  
  describe("ADMIN + Internal Order", () => {
    it("FUTURE: full edit access", () => {
      const access = getOrderAccess({
        role: "ADMIN",
        isClientOrder: false,
        confirmed: false,
        isPast: false,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(true);
      expect(access.canDelete).toBe(true);
      expect(access.canEditDates).toBe(true);
      expect(access.canEditReturn).toBe(true);
      expect(access.canEditInsurance).toBe(true);
      expect(access.canEditPricing).toBe(true);
      expect(access.canSeeClientPII).toBe(true);
      expect(access.notifySuperadminOnEdit).toBe(false);
      expect(access.isViewOnly).toBe(false);
    });

    it("PAST: view only, sees data", () => {
      const access = getOrderAccess({
        role: "ADMIN",
        isClientOrder: false,
        confirmed: false,
        isPast: true,
      });

      expect(access.canView).toBe(true);
      expect(access.canEdit).toBe(false);
      expect(access.canDelete).toBe(false);
      expect(access.canSeeClientPII).toBe(true); // internal = always visible
      expect(access.isViewOnly).toBe(true);
    });
  });

  // ════════════════════════════════════════════════════════════════
  // EDGE CASES
  // ════════════════════════════════════════════════════════════════
  
  describe("Edge Cases", () => {
    it("always allows viewing (canView is always true)", () => {
      const scenarios = [
        { role: "ADMIN", isClientOrder: true, confirmed: false, isPast: true },
        { role: "ADMIN", isClientOrder: true, confirmed: true, isPast: true },
        { role: "ADMIN", isClientOrder: false, confirmed: false, isPast: true },
        { role: "SUPERADMIN", isClientOrder: true, confirmed: false, isPast: true },
      ];

      scenarios.forEach((ctx) => {
        const access = getOrderAccess(ctx);
        expect(access.canView).toBe(true);
      });
    });

    it("superadmin never notifies superadmin", () => {
      const access = getOrderAccess({
        role: "SUPERADMIN",
        isClientOrder: true,
        confirmed: true,
        isPast: false,
      });

      expect(access.notifySuperadminOnEdit).toBe(false);
    });

    it("admin editing confirmed client order notifies superadmin", () => {
      const access = getOrderAccess({
        role: "ADMIN",
        isClientOrder: true,
        confirmed: true,
        isPast: false,
      });

      expect(access.notifySuperadminOnEdit).toBe(true);
    });
  });
});
