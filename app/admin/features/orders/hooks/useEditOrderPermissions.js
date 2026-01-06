/**
 * useEditOrderPermissions
 * 
 * 🎯 DOMAIN / LOGIC LAYER — Pure permission logic, no UI, no state
 * 
 * Responsibilities:
 * - Permission checks (delegates to RBAC helpers)
 * - Business rules (isCompletedOrder, isCurrentOrder, viewOnly)
 * - Derived flags (canEditField map)
 * 
 * Rules:
 * - MUST NOT use React state
 * - MUST NOT fetch data
 * - MUST NOT mutate order
 * - ONLY returns booleans and derived flags
 */

import { useMemo, useCallback } from "react";
import dayjs from "dayjs";
import {
  canEditOrder,
  canEditPricing,
  canDeleteOrder,
  canConfirmOrder,
  canEditOrderField,
} from "@/domain/orders/orderPermissions";
import { isSuperAdmin } from "@/domain/orders/admin-rbac";

/**
 * Hook for order permission checks and derived flags
 * 
 * @param {Object} order - Order object
 * @param {Object} currentUser - Current user object (from session)
 * @param {boolean} isViewOnly - External view-only flag (from props)
 * @returns {Object} Permission flags and derived state
 */
export function useEditOrderPermissions(order, currentUser, isViewOnly = false) {
  // Field-level permission helper
  const canEditField = useCallback(
    (field) => {
      if (!order || !currentUser) return false;
      return canEditOrderField(order, currentUser, field).allowed;
    },
    [order, currentUser]
  );

  // Field-level permissions (computed for all editable fields)
  const fieldPermissions = useMemo(
    () => ({
      rentalStartDate: canEditField("rentalStartDate"),
      rentalEndDate: canEditField("rentalEndDate"),
      timeIn: canEditField("timeIn"),
      timeOut: canEditField("timeOut"),
      totalPrice: canEditField("totalPrice"),
      placeIn: canEditField("placeIn"),
      placeOut: canEditField("placeOut"),
      car: canEditField("car"),
      insurance: canEditField("insurance"),
      ChildSeats: canEditField("ChildSeats"),
      franchiseOrder: canEditField("franchiseOrder"),
      customerName: canEditField("customerName"),
      phone: canEditField("phone"),
      email: canEditField("email"),
      flightNumber: canEditField("flightNumber"),
    }),
    [canEditField]
  );

  // Legacy permissions (kept for backward compatibility)
  const canEdit = useMemo(() => {
    if (!order || !currentUser) return false;
    return canEditOrder(order, currentUser).allowed;
  }, [order, currentUser]);

  const canEditDatesPrice = useMemo(() => {
    if (!order || !currentUser) return false;
    return canEditPricing(order, currentUser).allowed;
  }, [order, currentUser]);

  const canDelete = useMemo(() => {
    if (!order || !currentUser) return false;
    return canDeleteOrder(order, currentUser).allowed;
  }, [order, currentUser]);

  const canConfirm = useMemo(() => {
    if (!order || !currentUser) return false;
    return canConfirmOrder(order, currentUser).allowed;
  }, [order, currentUser]);

  // Business rule: Is order completed? (end date before today)
  const isCompletedOrder = useMemo(() => {
    if (!order) return false;
    return dayjs(order.rentalEndDate).isBefore(dayjs(), "day");
  }, [order]);

  // Business rule: Is order current? (start before today, end today or later)
  const isCurrentOrder = useMemo(() => {
    if (!order) return false;
    return (
      dayjs(order.rentalStartDate).isBefore(dayjs(), "day") &&
      !dayjs(order.rentalEndDate).isBefore(dayjs(), "day")
    );
  }, [order]);

  // View-only flag: external flag OR completed order (unless superadmin)
  // IMPORTANT: Superadmin can edit even completed orders (axiom: superadmin always allowed)
  const viewOnly = useMemo(() => {
    return (isViewOnly || isCompletedOrder) && !isSuperAdmin(currentUser);
  }, [isViewOnly, isCompletedOrder, currentUser]);

  return {
    // Field-level permissions
    fieldPermissions,
    canEditField,

    // Legacy permissions
    canEdit,
    canEditDatesPrice,
    canDelete,
    canConfirm,

    // Derived flags
    isCompletedOrder,
    isCurrentOrder,
    viewOnly,
  };
}

export default useEditOrderPermissions;

