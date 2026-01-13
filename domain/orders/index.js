/**
 * domain/orders
 * 
 * Доменная логика для работы с заказами.
 */

export {
  getOrderColor,
  getOrderMainColor,
  getOrderLightColor,
  getOrderBgColor,
  getOrderType,
} from "./getOrderColor";

export { buildPendingConfirmBlockMap } from "./buildPendingConfirmBlockMap";

// ============================================
// PRICE HELPERS (Single Source of Truth)
// ============================================

export {
  getEffectivePrice,
  hasPriceOverride,
  getPriceInfo,
} from "./orderPriceHelpers";

// ============================================
// RBAC (Single Source of Truth)
// ============================================

export {
  // Role constants
  ROLE,
  
  // User role checks
  isSuperAdmin,
  isAdmin,
  
  // Order type checks
  isClientOrder,
  isAdminCreatedOrder,
  
  // Time helpers
  isPastOrder,
  isFutureOrder,
  
  // Ownership helpers
  getOrderCreatorId,
  isOwnOrder,
  
  // Permission checks
  canViewOrder,
  canEditOrder,
  canEditPricing,
  canDeleteOrder,
  canConfirmOrder,
  canEditOrderField,
  
  // Policy config
  ADMIN_POLICY,
  
  // Localization
  getPermissionDeniedMessage,
} from "./admin-rbac";

// ============================================
// DEPRECATED EXPORTS (for backward compatibility)
// Do NOT use in new code
// ============================================

/**
 * @deprecated Use isClientOrder or isAdminCreatedOrder instead
 */
export function isSuperadminOrder(order) {
  return false;
}

/**
 * @deprecated Use isAdminCreatedOrder instead
 */
export function isAdminOrder(order) {
  return order?.my_order === false;
}

/**
 * @deprecated Use canDeleteOrder or canEditOrder instead
 */
export function canAdminModifyOrder({ order, adminRole }) {
  // Legacy compatibility: always allow for superadmin
  const { ROLE } = require("./admin-rbac");
  if (adminRole === ROLE.SUPERADMIN) {
    return { allowed: true, reason: null, isProtected: order?.my_order === true };
  }
  // Admin can only modify admin-created orders
  if (order?.my_order === true) {
    return { allowed: false, reason: "Only superadmin can modify client orders", isProtected: true };
  }
  return { allowed: true, reason: null, isProtected: false };
}

/**
 * @deprecated Use isClientOrder instead
 */
export function isOrderProtected(order) {
  return order?.my_order === true;
}

/**
 * @deprecated Use getPermissionDeniedMessage instead
 */
export function getLegacyPermissionDeniedMessage(locale = "en") {
  const messages = {
    en: "Only superadmin can modify client orders.",
    ru: "Только суперадмин может редактировать клиентские заказы.",
    el: "Μόνο ο υπερδιαχειριστής μπορεί να τροποποιήσει παραγγελίες πελατών.",
  };
  return messages[locale] || messages.en;
}

/**
 * @deprecated Use ADMIN_POLICY directly
 */
export function getAdminPolicy() {
  const { ADMIN_POLICY: policy } = require("./admin-rbac");
  return policy;
}

/**
 * @deprecated Role normalization is no longer needed.
 * Use ROLE.ADMIN and ROLE.SUPERADMIN directly.
 * 
 * ⚠️ This function is kept for backward compatibility only.
 * Returns ROLE.ADMIN (1) or ROLE.SUPERADMIN (2).
 */
export function normalizeUserRole(input) {
  const { ROLE } = require("./admin-rbac");
  if (input === null || input === undefined) return ROLE.ADMIN;
  if (typeof input === "number") {
    return input === ROLE.SUPERADMIN ? ROLE.SUPERADMIN : ROLE.ADMIN;
  }
  if (typeof input === "string") {
    const upper = input.toUpperCase().trim();
    if (upper === "SUPERADMIN" || upper === "SUPER_ADMIN") return ROLE.SUPERADMIN;
    if (upper === "ADMIN") return ROLE.ADMIN;
    const num = Number(upper);
    if (!isNaN(num)) {
      return num === ROLE.SUPERADMIN ? ROLE.SUPERADMIN : ROLE.ADMIN;
    }
  }
  return ROLE.ADMIN;
}
