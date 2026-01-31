/**
 * admin-rbac.js
 * 
 * ════════════════════════════════════════════════════════════════
 * ⚠️ DEPRECATED: BACKWARD COMPATIBILITY SHIM
 * ════════════════════════════════════════════════════════════════
 * 
 * 🔥 ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ: orderAccessPolicy.js
 * 
 * Этот файл — THIN WRAPPER для обратной совместимости.
 * ВСЕ бизнес-правила находятся в orderAccessPolicy.js.
 * 
 * НЕ ДОБАВЛЯЙ СЮДА ЛОГИКУ. Только проксируй policy.
 * 
 * Для WRITE routes используй напрямую:
 *   import { getOrderAccess } from "@/domain/orders/orderAccessPolicy";
 *   import { checkFieldAccess } from "@/middleware/withOrderAccess";
 * 
 * ════════════════════════════════════════════════════════════════
 */

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ROLE } from "@models/user";
import { getOrderAccess } from "./orderAccessPolicy";

dayjs.extend(utc);
dayjs.extend(timezone);

const ATHENS_TZ = "Europe/Athens";

// ════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ════════════════════════════════════════════════════════════════

export { ROLE };
export { getOrderAccess } from "./orderAccessPolicy";

// ════════════════════════════════════════════════════════════════
// ROLE CHECKS (pure helpers, NOT deprecated)
// ════════════════════════════════════════════════════════════════

/**
 * Check if user is superadmin
 * @param {Object} user
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  return user?.isAdmin === true && user.role === ROLE.SUPERADMIN;
}

/**
 * Check if user is admin (not superadmin)
 * @param {Object} user
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user?.isAdmin === true && user.role === ROLE.ADMIN;
}

// ════════════════════════════════════════════════════════════════
// ORDER TYPE HELPERS (pure helpers, NOT deprecated)
// ════════════════════════════════════════════════════════════════

/**
 * Check if order is client-created (my_order=true)
 * @param {Object} order
 * @returns {boolean}
 */
export function isClientOrder(order) {
  return order?.my_order === true;
}

/**
 * Check if order is admin-created (my_order=false)
 * @param {Object} order
 * @returns {boolean}
 */
export function isAdminCreatedOrder(order) {
  return order?.my_order === false;
}

// ════════════════════════════════════════════════════════════════
// TIME HELPERS (pure helpers, NOT deprecated)
// ════════════════════════════════════════════════════════════════

/**
 * Get order time bucket
 * @param {Object} order
 * @returns {"completed" | "current" | "future" | null}
 */
export function getOrderTimeBucket(order) {
  if (!order) return null;
  
  const now = dayjs().tz(ATHENS_TZ).startOf("day");
  
  // Handle partial dates
  const hasStart = order.rentalStartDate != null;
  const hasEnd = order.rentalEndDate != null;
  
  if (!hasStart && !hasEnd) return null;
  
  const start = hasStart ? dayjs(order.rentalStartDate).tz(ATHENS_TZ).startOf("day") : null;
  const end = hasEnd ? dayjs(order.rentalEndDate).tz(ATHENS_TZ).startOf("day") : null;
  
  // If only end date: check if completed
  if (!hasStart && hasEnd) {
    return end.isBefore(now) ? "completed" : "current";
  }
  
  // If only start date: check if future
  if (hasStart && !hasEnd) {
    return start.isAfter(now) ? "future" : "current";
  }
  
  // Both dates present
  if (end.isBefore(now)) return "completed";
  if (start.isAfter(now)) return "future";
  return "current";
}

/**
 * Check if order is past (completed)
 * @param {Object} order
 * @returns {boolean}
 */
export function isPastOrder(order) {
  const bucket = getOrderTimeBucket(order);
  return bucket === "completed";
}

/**
 * Check if order is future
 * @param {Object} order
 * @returns {boolean}
 */
export function isFutureOrder(order) {
  const bucket = getOrderTimeBucket(order);
  return bucket === "future";
}

/**
 * Check if order is current
 * @param {Object} order
 * @returns {boolean}
 */
export function isCurrentOrder(order) {
  const bucket = getOrderTimeBucket(order);
  return bucket === "current";
}

// ════════════════════════════════════════════════════════════════
// OWNERSHIP HELPERS (pure helpers, NOT deprecated)
// ════════════════════════════════════════════════════════════════

/**
 * Get the creator ID of an order
 * @param {Object} order
 * @returns {string|null}
 */
export function getOrderCreatorId(order) {
  if (!order) return null;
  if (order.createdByAdminId) return String(order.createdByAdminId);
  if (order.createdById) return String(order.createdById);
  if (order.createdBy?.id) return String(order.createdBy.id);
  if (order.createdByUserId) return String(order.createdByUserId);
  return null;
}

/**
 * Check if order belongs to the user
 * @param {Object} order
 * @param {Object} user
 * @returns {boolean}
 */
export function isOwnOrder(order, user) {
  if (!order || !user?.id) return false;
  const creatorId = getOrderCreatorId(order);
  return creatorId ? String(creatorId) === String(user.id) : false;
}

// ════════════════════════════════════════════════════════════════
// PERMISSION SHIMS (thin wrappers over orderAccessPolicy)
// ════════════════════════════════════════════════════════════════

/**
 * Creates OrderContext from order and user.
 * @private
 */
function createContext(order, user) {
  const bucket = getOrderTimeBucket(order);
  return {
    role: isSuperAdmin(user) ? "SUPERADMIN" : "ADMIN",
    isClientOrder: order?.my_order === true,
    confirmed: order?.confirmed === true,
    isPast: bucket === "completed",
  };
}

/**
 * @deprecated Use getOrderAccess(ctx).canView instead
 * Check if admin can view an order (always true for admins)
 */
export function canViewOrder(order, user) {
  if (!user?.isAdmin) return false;
  return true; // admins can always view
}

/**
 * @deprecated Use getOrderAccess(ctx).canConfirm instead
 * Check if user can confirm/unconfirm an order
 */
export function canConfirmOrder(order, user, newConfirmedState = true) {
  if (!user?.isAdmin) return deny("Not an admin");
  
  const ctx = createContext(order, user);
  const access = getOrderAccess(ctx);
  
  return access.canConfirm ? allow() : deny("Only superadmin can confirm or unconfirm orders");
}

/**
 * @deprecated Use getOrderAccess(ctx).canDelete instead
 * Check if admin can delete an order
 */
export function canDeleteOrder(order, user) {
  if (!user?.isAdmin) return deny("Not an admin");
  
  const ctx = createContext(order, user);
  const access = getOrderAccess(ctx);
  
  if (access.canDelete) return allow();
  
  // Provide specific reason based on order type
  if (isClientOrder(order)) {
    return deny("Admin cannot delete client orders");
  }
  if (isPastOrder(order)) {
    return deny("Admin cannot delete past orders");
  }
  if (isCurrentOrder(order)) {
    return deny("Admin cannot delete current orders");
  }
  return deny("Cannot delete this order");
}

/**
 * @deprecated Use getOrderAccess(ctx).canEdit instead
 * Check if admin can edit order (general check)
 */
export function canEditOrder(order, user) {
  if (!user?.isAdmin) return deny("Not an admin");
  
  const ctx = createContext(order, user);
  const access = getOrderAccess(ctx);
  
  if (access.canEdit) return allow();
  if (access.isViewOnly) return deny("Order is view-only");
  
  return deny("Cannot edit this order");
}

/**
 * @deprecated Use getOrderAccess(ctx).canEditPricing instead
 * Check if admin can edit pricing
 */
export function canEditPricing(order, user) {
  if (!user?.isAdmin) return deny("Not an admin");
  
  const ctx = createContext(order, user);
  const access = getOrderAccess(ctx);
  
  if (access.canEditPricing) return allow();
  
  if (isClientOrder(order)) {
    return deny("Admin cannot edit pricing of client orders");
  }
  if (isPastOrder(order)) {
    return deny("Admin cannot edit past internal orders");
  }
  if (isCurrentOrder(order)) {
    return deny("Admin cannot edit pricing of current orders");
  }
  return deny("Cannot edit pricing");
}

/**
 * @deprecated Use checkFieldAccess from middleware/withOrderAccess.js
 * Check if admin can edit a specific field
 */
export function canEditOrderField(order, user, field) {
  if (!user?.isAdmin) return deny("Not an admin");
  
  const ctx = createContext(order, user);
  const access = getOrderAccess(ctx);
  
  // SUPERADMIN: always allowed
  if (ctx.role === "SUPERADMIN") return allow();
  
  // Field-level checks based on access policy
  const dateFields = ["rentalStartDate", "rentalEndDate", "timeIn", "numberOfDays"];
  const returnFields = ["placeOut", "timeOut"];
  const insuranceFields = ["insurance"];
  const pricingFields = ["totalPrice", "OverridePrice", "price", "sum"];
  const confirmFields = ["confirmed"];
  const piiFields = ["customerName", "phone", "email", "Viber", "Whatsapp", "Telegram"];
  
  // Check by field category
  if (dateFields.includes(field)) {
    return access.canEditDates ? allow() : deny("Cannot edit dates");
  }
  if (returnFields.includes(field)) {
    return access.canEditReturn ? allow() : deny("Cannot edit return fields");
  }
  if (insuranceFields.includes(field)) {
    return access.canEditInsurance ? allow() : deny("Cannot edit insurance");
  }
  if (pricingFields.includes(field)) {
    return access.canEditPricing ? allow() : deny("Cannot edit price fields");
  }
  if (confirmFields.includes(field)) {
    return access.canConfirm ? allow() : deny("Cannot confirm/unconfirm");
  }
  if (piiFields.includes(field)) {
    return access.canSeeClientPII ? allow() : deny("Cannot edit client PII");
  }
  
  // Default: check general edit permission
  return access.canEdit ? allow() : deny("Cannot edit this field");
}

// ════════════════════════════════════════════════════════════════
// LEGACY CONFIG (kept for compatibility, NOT used in policy)
// ════════════════════════════════════════════════════════════════

/**
 * @deprecated Not used. Policy lives in orderAccessPolicy.js
 */
export const ADMIN_POLICY = {
  ADMIN_CAN_DELETE_CLIENT_ORDERS: false,
  ADMIN_CAN_DELETE_PAST_INTERNAL_ORDERS: false,
  ADMIN_CAN_DELETE_CURRENT_INTERNAL_ORDERS: false,
  ADMIN_CAN_EDIT_PAST_INTERNAL_ORDERS: false,
};

// ════════════════════════════════════════════════════════════════
// LOCALIZATION (kept for backward compatibility)
// ════════════════════════════════════════════════════════════════

/**
 * Get localized permission denied message
 */
export function getPermissionDeniedMessage(reason, locale = "en") {
  const messages = {
    en: {
      "Admin cannot delete client orders": "Admin cannot delete client orders",
      "Admin cannot delete past orders": "Admin cannot delete past orders",
      "Admin cannot delete current orders": "Admin cannot delete current orders",
      "Only superadmin can confirm or unconfirm orders": "Only superadmin can confirm or unconfirm orders",
      "Cannot edit this order": "Cannot edit this order",
      "Order is view-only": "Order is view-only",
    },
    ru: {
      "Admin cannot delete client orders": "Админ не может удалять клиентские заказы",
      "Admin cannot delete past orders": "Админ не может удалять прошлые заказы",
      "Admin cannot delete current orders": "Админ не может удалять текущие заказы",
      "Only superadmin can confirm or unconfirm orders": "Только суперадмин может подтверждать заказы",
      "Cannot edit this order": "Невозможно редактировать заказ",
      "Order is view-only": "Заказ только для просмотра",
    },
  };
  
  return messages[locale]?.[reason] || reason || "Permission denied";
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

function allow() {
  return { allowed: true, reason: null };
}

function deny(reason) {
  return { allowed: false, reason };
}
