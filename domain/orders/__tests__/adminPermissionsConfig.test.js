/**
 * Unit tests for adminPermissionsConfig helpers
 * 
 * Tests verify role normalization and superadmin/admin detection.
 */

import { normalizeUserRole, isSuperAdmin, isAdmin } from "../adminPermissionsConfig";
import { USER_ROLES } from "@models/user";

describe("normalizeUserRole", () => {
  test("role: 1 => returns SUPERADMIN (1)", () => {
    expect(normalizeUserRole(1)).toBe(USER_ROLES.SUPERADMIN);
  });
  
  test('role: "1" => returns SUPERADMIN (1)', () => {
    expect(normalizeUserRole("1")).toBe(USER_ROLES.SUPERADMIN);
  });
  
  test('role: "SUPERADMIN" => returns SUPERADMIN (1)', () => {
    expect(normalizeUserRole("SUPERADMIN")).toBe(USER_ROLES.SUPERADMIN);
  });
  
  test('role: "superadmin" => returns SUPERADMIN (1)', () => {
    expect(normalizeUserRole("superadmin")).toBe(USER_ROLES.SUPERADMIN);
  });
  
  test("role: 0 => returns ADMIN (0)", () => {
    expect(normalizeUserRole(0)).toBe(USER_ROLES.ADMIN);
  });
  
  test('role: "0" => returns ADMIN (0)', () => {
    expect(normalizeUserRole("0")).toBe(USER_ROLES.ADMIN);
  });
  
  test('role: "ADMIN" => returns ADMIN (0)', () => {
    expect(normalizeUserRole("ADMIN")).toBe(USER_ROLES.ADMIN);
  });
  
  test("role: null => returns ADMIN (0) default", () => {
    expect(normalizeUserRole(null)).toBe(USER_ROLES.ADMIN);
  });
  
  test("role: undefined => returns ADMIN (0) default", () => {
    expect(normalizeUserRole(undefined)).toBe(USER_ROLES.ADMIN);
  });
  
  test("role: 2 => returns SUPERADMIN (1) (>=1)", () => {
    expect(normalizeUserRole(2)).toBe(USER_ROLES.SUPERADMIN);
  });
  
  test('role: "invalid" => returns ADMIN (0) default', () => {
    expect(normalizeUserRole("invalid")).toBe(USER_ROLES.ADMIN);
  });
});

describe("isSuperAdmin", () => {
  test("role: 1 => superadmin true", () => {
    const user = { isAdmin: true, role: 1 };
    expect(isSuperAdmin(user)).toBe(true);
  });
  
  test('role: "1" => superadmin true', () => {
    const user = { isAdmin: true, role: "1" };
    expect(isSuperAdmin(user)).toBe(true);
  });
  
  test('role: "SUPERADMIN" => superadmin true', () => {
    const user = { isAdmin: true, role: "SUPERADMIN" };
    expect(isSuperAdmin(user)).toBe(true);
  });
  
  test("role: 0 => superadmin false", () => {
    const user = { isAdmin: true, role: 0 };
    expect(isSuperAdmin(user)).toBe(false);
  });
  
  test('role: "0" => superadmin false', () => {
    const user = { isAdmin: true, role: "0" };
    expect(isSuperAdmin(user)).toBe(false);
  });
  
  test('role: "ADMIN" => superadmin false', () => {
    const user = { isAdmin: true, role: "ADMIN" };
    expect(isSuperAdmin(user)).toBe(false);
  });
  
  test("not admin => superadmin false", () => {
    const user = { isAdmin: false, role: 1 };
    expect(isSuperAdmin(user)).toBe(false);
  });
  
  test("null user => superadmin false", () => {
    expect(isSuperAdmin(null)).toBe(false);
  });
  
  test("undefined user => superadmin false", () => {
    expect(isSuperAdmin(undefined)).toBe(false);
  });
});

describe("isAdmin", () => {
  test("role: 0 => admin true", () => {
    const user = { isAdmin: true, role: 0 };
    expect(isAdmin(user)).toBe(true);
  });
  
  test('role: "0" => admin true', () => {
    const user = { isAdmin: true, role: "0" };
    expect(isAdmin(user)).toBe(true);
  });
  
  test('role: "ADMIN" => admin true', () => {
    const user = { isAdmin: true, role: "ADMIN" };
    expect(isAdmin(user)).toBe(true);
  });
  
  test("role: 1 => admin false", () => {
    const user = { isAdmin: true, role: 1 };
    expect(isAdmin(user)).toBe(false);
  });
  
  test('role: "1" => admin false', () => {
    const user = { isAdmin: true, role: "1" };
    expect(isAdmin(user)).toBe(false);
  });
  
  test("not admin => admin false", () => {
    const user = { isAdmin: false, role: 0 };
    expect(isAdmin(user)).toBe(false);
  });
  
  test("null user => admin false", () => {
    expect(isAdmin(null)).toBe(false);
  });
});

