/**
 * orderPermissions.js
 * 
 * ⚠️ DEPRECATED: This file is now a simple re-export wrapper.
 * 
 * All RBAC logic is centralized in admin-rbac.js.
 * This file exists only for backward compatibility.
 * 
 * DO NOT add any logic here — use admin-rbac.js directly.
 */

// Re-export all permission functions from admin-rbac.js
export {
  // Order type checks
  isClientOrder,
  isAdminCreatedOrder,
  
  // Permission checks
  canViewOrder,
  canEditOrder,
  canEditPricing,
  canDeleteOrder,
  canConfirmOrder,
  canEditOrderField,
  
  // Time helpers
  getOrderTimeBucket,
  isPastOrder,
  isFutureOrder,
  isCurrentOrder,
  
  // Ownership helpers
  getOrderCreatorId,
  isOwnOrder,
  
  // Localization
  getPermissionDeniedMessage,
  
  // Role constants
  ROLE,
  
  // Role checks
  isSuperAdmin,
  isAdmin,
  
  // Policy config
  ADMIN_POLICY,
} from "./admin-rbac";

// Deprecated functions (kept for backward compatibility only)
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
