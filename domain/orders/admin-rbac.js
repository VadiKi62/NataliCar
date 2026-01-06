/**
 * admin-rbac.js
 * 
 * SINGLE SOURCE OF TRUTH for admin permissions (RBAC)
 * 
 * ARCHITECTURE INVARIANTS:
 * - Order NEVER determines role — roles are resolved from user/session ONLY
 * - Order type is determined by my_order flag:
 *   - Client order: my_order === true
 *   - Admin-created order: my_order === false
 * 
 * ALLOWED sources of truth:
 * ✅ session.user.isAdmin
 * ✅ session.user.role
 * ✅ ROLE.ADMIN / ROLE.SUPERADMIN
 * ✅ order.my_order
 * 
 * FORBIDDEN sources (do NOT use):
 * ❌ createdByRole
 * ❌ USER_ROLES (legacy)
 * ❌ normalizeUserRole (removed)
 */

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ROLE } from "@models/user";

dayjs.extend(utc);
dayjs.extend(timezone);

/* ======================================================
   RE-EXPORT ROLE CONSTANTS
====================================================== */

export { ROLE };

/* ======================================================
   USER ROLE CHECKS — SINGLE SOURCE OF TRUTH
====================================================== */

/**
 * Check if user is superadmin
 * 
 * SUPERADMIN bypasses all permission checks (always allowed).
 * 
 * @param {Object} user - User object with isAdmin and role properties
 * @returns {boolean} True if user is superadmin (role === ROLE.SUPERADMIN)
 */
export function isSuperAdmin(user) {
  return user?.isAdmin === true && user.role === ROLE.SUPERADMIN;
}

/**
 * Check if user is admin (not superadmin)
 * 
 * @param {Object} user - User object with isAdmin and role properties
 * @returns {boolean} True if user is admin (role === ROLE.ADMIN)
 */
export function isAdmin(user) {
  return user?.isAdmin === true && user.role === ROLE.ADMIN;
}

/* ======================================================
   ADMIN POLICY (CONFIG SWITCHES)
====================================================== */

/**
 * Admin Policy Configuration Object
 * 
 * Each switch controls a specific permission rule for ADMIN role.
 * SUPERADMIN bypasses all these checks (always allowed).
 * 
 * AXIOMS (always true, cannot be changed):
 * - SUPERADMIN (role === ROLE.SUPERADMIN = 2): ALWAYS allowed for ALL actions/fields
 * - ADMIN_CAN_DELETE_OTHERS_ORDERS: MUST be false ALWAYS
 * - ADMIN_CAN_TOGGLE_CONFIRMATION_ALWAYS: MUST be true ALWAYS
 */
export const ADMIN_POLICY = {
  // ============================================
  // DELETION RULES
  // ============================================
  
  /** AXIOM: Admin cannot delete orders created by clients. Always false. */
  ADMIN_CAN_DELETE_OTHERS_ORDERS: false,
  
  /** If true: Admin can delete confirmed orders that are in the past. */
  ADMIN_CAN_DELETE_PAST_CONFIRMED_ORDERS: false,
  
  /** If true: Admin can delete pending orders that are in the past. */
  ADMIN_CAN_DELETE_PAST_PENDING_ORDERS: false,
  
  // ============================================
  // CLIENT ORDER EDITING RULES
  // ============================================
  
  /** If true: Admin can edit totalPrice of client orders (my_order=true). */
  ADMIN_CAN_EDIT_CLIENT_ORDER_TOTAL_PRICE: false,
  
  /** If true: Admin can edit customer contact fields of client orders. */
  ADMIN_CAN_EDIT_CLIENT_CUSTOMER_CONTACT: true,
  
  /** If true: Admin can edit timeIn/timeOut of client orders. */
  ADMIN_CAN_EDIT_CLIENT_ORDER_TIMES: true,
  
  /** If true: Admin can edit rentalStartDate/rentalEndDate of client orders. */
  ADMIN_CAN_EDIT_CLIENT_ORDER_DATES: false,
  
  /** If true: Admin can edit extras fields of client orders. */
  ADMIN_CAN_EDIT_CLIENT_ORDER_EXTRAS: false,
  
  // ============================================
  // CONFIRMATION RULES
  // ============================================
  
  /** AXIOM: Both ADMIN and SUPERADMIN can confirm/unconfirm any order. Always true. */
  ADMIN_CAN_TOGGLE_CONFIRMATION_ALWAYS: true,
};

/* ======================================================
   ORDER TYPE HELPERS
====================================================== */

/**
 * Check if order is client-created (my_order=true)
 * This is the single source of truth for client orders.
 * 
 * @param {Object} order
 * @returns {boolean}
 */
export function isClientOrder(order) {
  return order?.my_order === true;
}

/**
 * Check if order is admin-created (my_order=false)
 * This is the single source of truth for admin orders.
 * 
 * @param {Object} order
 * @returns {boolean}
 */
export function isAdminCreatedOrder(order) {
  return order?.my_order === false;
}

/* ======================================================
   TIME HELPERS
====================================================== */

const ATHENS_TZ = "Europe/Athens";

/**
 * Check if order is in the past (rentalEndDate < today)
 * Uses Athens timezone for consistent day comparison.
 * 
 * @param {Object} order
 * @returns {boolean}
 */
export function isPastOrder(order) {
  if (!order?.rentalEndDate) return false;
  return dayjs(order.rentalEndDate).tz(ATHENS_TZ).startOf("day")
    .isBefore(dayjs().tz(ATHENS_TZ).startOf("day"));
}

/**
 * Check if order is in the future (rentalStartDate > today)
 * Uses Athens timezone for consistent day comparison.
 * 
 * @param {Object} order
 * @returns {boolean}
 */
export function isFutureOrder(order) {
  if (!order?.rentalStartDate) return false;
  return dayjs(order.rentalStartDate).tz(ATHENS_TZ).startOf("day")
    .isAfter(dayjs().tz(ATHENS_TZ).startOf("day"));
}

/* ======================================================
   OWNERSHIP HELPERS
====================================================== */

/**
 * Get the creator ID of an order
 * 
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
 * Check if order belongs to the user (user created this order)
 * 
 * @param {Object} order
 * @param {Object} user
 * @returns {boolean}
 */
export function isOwnOrder(order, user) {
  if (!order || !user?.id) return false;
  
  const creatorId = getOrderCreatorId(order);
  if (!creatorId) return false;
  
  return String(creatorId) === String(user.id);
}

/* ======================================================
   CORE PERMISSION CHECKS
====================================================== */

/**
 * Check if admin can view an order
 * Both ADMIN and SUPERADMIN can view all orders.
 * 
 * @param {Object} order
 * @param {Object} user
 * @returns {boolean}
 */
export function canViewOrder(order, user) {
  return user?.isAdmin === true;
}

/**
 * Check if admin can confirm/unconfirm an order
 * 
 * @param {Object} order
 * @param {Object} user
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function canConfirmOrder(order, user) {
  if (!user?.isAdmin) return deny("Not an admin");

  if (isSuperAdmin(user)) return allow();
  
  if (isAdmin(user) && ADMIN_POLICY.ADMIN_CAN_TOGGLE_CONFIRMATION_ALWAYS) {
    return allow();
  }

  return deny("Confirmation not allowed");
}

/**
 * Check if admin can delete an order
 * 
 * SUPERADMIN: ✅ Can delete any order
 * ADMIN: ❌ Cannot delete client orders
 *        ✅ Can delete own admin-created orders (with past order restrictions)
 * 
 * @param {Object} order
 * @param {Object} user
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function canDeleteOrder(order, user) {
  if (!user?.isAdmin) return deny("Not an admin");

  if (isSuperAdmin(user)) return allow();

  // Admin cannot delete client orders
  if (isClientOrder(order)) {
    return deny("Admin cannot delete client orders");
  }

  // Admin can only delete their own orders
  if (isAdminCreatedOrder(order) && !isOwnOrder(order, user)) {
    return deny("Admin cannot delete other admins' orders");
  }

  // Check past order deletion rules
  if (isPastOrder(order)) {
    if (order.confirmed && !ADMIN_POLICY.ADMIN_CAN_DELETE_PAST_CONFIRMED_ORDERS) {
      return deny("Admin cannot delete past confirmed orders");
    }
    if (!order.confirmed && !ADMIN_POLICY.ADMIN_CAN_DELETE_PAST_PENDING_ORDERS) {
      return deny("Admin cannot delete past pending orders");
    }
  }

  return allow();
}

/**
 * Check if admin can edit order (general check)
 * 
 * @param {Object} order
 * @param {Object} user
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function canEditOrder(order, user) {
  if (!user?.isAdmin) return deny("Not an admin");

  if (isSuperAdmin(user)) return allow();

  if (isAdminCreatedOrder(order)) return allow();

  if (isClientOrder(order)) {
    if (ADMIN_POLICY.ADMIN_CAN_EDIT_CLIENT_CUSTOMER_CONTACT) {
      return allow();
    }
    return deny("Admin cannot edit customer contact fields of client orders");
  }

  return deny("Invalid user role");
}

/**
 * Check if admin can edit pricing/dates/duration
 * 
 * @param {Object} order
 * @param {Object} user
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function canEditPricing(order, user) {
  if (!user?.isAdmin) return deny("Not an admin");

  if (isSuperAdmin(user)) return allow();

  if (isAdminCreatedOrder(order)) return allow();

  if (isClientOrder(order)) {
    return deny("Admin cannot edit dates, times, or prices of client orders");
  }

  return deny("Invalid user role");
}

/* ======================================================
   FIELD-LEVEL PERMISSION CHECK
====================================================== */

const DATE_FIELDS = ["rentalStartDate", "rentalEndDate"];
const TIME_FIELDS = ["timeIn", "timeOut"];
const CONTACT_FIELDS = ["customerName", "phone", "email"];
const PRICE_FIELDS = ["totalPrice", "price", "sum", "numberOfDays"];
const EXTRAS_FIELDS = ["placeIn", "placeOut", "insurance", "ChildSeats", "franchiseOrder", "flightNumber", "car"];

/**
 * Check if admin can edit a specific field of an order
 * 
 * SUPERADMIN: ✅ Can edit any field of any order
 * ADMIN: ✅ Can edit admin orders (my_order=false) always
 *        ✅ Can edit client orders based on field-specific config switches
 * 
 * @param {Object} order
 * @param {Object} user
 * @param {string} field - Field name
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function canEditOrderField(order, user, field) {
  if (!user?.isAdmin) return deny("Not an admin");

  if (isSuperAdmin(user)) return allow();

  if (isAdminCreatedOrder(order)) return allow();

  if (!isClientOrder(order)) return deny("Invalid order type");

  // Client order field-specific checks
  if (DATE_FIELDS.includes(field)) {
    return ADMIN_POLICY.ADMIN_CAN_EDIT_CLIENT_ORDER_DATES
      ? allow()
      : deny("Admin cannot edit client order dates");
  }

  if (TIME_FIELDS.includes(field)) {
    return ADMIN_POLICY.ADMIN_CAN_EDIT_CLIENT_ORDER_TIMES
      ? allow()
      : deny("Admin cannot edit client order times");
  }

  if (PRICE_FIELDS.includes(field)) {
    return ADMIN_POLICY.ADMIN_CAN_EDIT_CLIENT_ORDER_TOTAL_PRICE
      ? allow()
      : deny("Admin cannot edit client order price");
  }

  if (CONTACT_FIELDS.includes(field)) {
    return ADMIN_POLICY.ADMIN_CAN_EDIT_CLIENT_CUSTOMER_CONTACT
      ? allow()
      : deny("Admin cannot edit client contact info");
  }

  if (EXTRAS_FIELDS.includes(field)) {
    return ADMIN_POLICY.ADMIN_CAN_EDIT_CLIENT_ORDER_EXTRAS
      ? allow()
      : deny("Admin cannot edit client extras");
  }

  return deny("Field is not editable");
}

/* ======================================================
   LOCALIZATION
====================================================== */

/**
 * Get localized permission denied message
 * 
 * @param {string} reason
 * @param {string} locale - 'en' | 'ru' | 'el'
 * @returns {string}
 */
export function getPermissionDeniedMessage(reason, locale = "en") {
  const messages = {
    en: {
      "Admin cannot delete client orders": 
        "Admin cannot delete client orders",
      "Admin cannot delete other admins' orders": 
        "Admin cannot delete other admins' orders",
      "Admin cannot delete past confirmed orders": 
        "Admin cannot delete past confirmed orders",
      "Admin cannot delete past pending orders": 
        "Admin cannot delete past pending orders",
      "Admin cannot edit client order dates": 
        "Admin cannot edit client order dates",
      "Admin cannot edit client order times": 
        "Admin cannot edit client order times",
      "Admin cannot edit client order price": 
        "Admin cannot edit client order price",
      "Admin cannot edit client contact info": 
        "Admin cannot edit client contact info",
      "Admin cannot edit client extras": 
        "Admin cannot edit client extras",
    },
    ru: {
      "Admin cannot delete client orders": 
        "Админ не может удалять клиентские заказы",
      "Admin cannot delete other admins' orders": 
        "Админ не может удалять заказы других админов",
      "Admin cannot delete past confirmed orders": 
        "Админ не может удалять прошлые подтвержденные заказы",
      "Admin cannot delete past pending orders": 
        "Админ не может удалять прошлые неподтвержденные заказы",
      "Admin cannot edit client order dates": 
        "Админ не может редактировать даты клиентских заказов",
      "Admin cannot edit client order times": 
        "Админ не может редактировать время клиентских заказов",
      "Admin cannot edit client order price": 
        "Админ не может редактировать цену клиентских заказов",
      "Admin cannot edit client contact info": 
        "Админ не может редактировать контактные данные клиентов",
      "Admin cannot edit client extras": 
        "Админ не может редактировать доп. опции клиентских заказов",
    },
    el: {
      "Admin cannot delete client orders": 
        "Ο διαχειριστής δεν μπορεί να διαγράψει παραγγελίες πελατών",
      "Admin cannot delete other admins' orders": 
        "Ο διαχειριστής δεν μπορεί να διαγράψει παραγγελίες άλλων διαχειριστών",
      "Admin cannot delete past confirmed orders": 
        "Ο διαχειριστής δεν μπορεί να διαγράψει παρελθοντικές επιβεβαιωμένες παραγγελίες",
      "Admin cannot delete past pending orders": 
        "Ο διαχειριστής δεν μπορεί να διαγράψει παρελθοντικές εκκρεμείς παραγγελίες",
      "Admin cannot edit client order dates": 
        "Ο διαχειριστής δεν μπορεί να επεξεργαστεί ημερομηνίες παραγγελιών πελατών",
      "Admin cannot edit client order times": 
        "Ο διαχειριστής δεν μπορεί να επεξεργαστεί ώρες παραγγελιών πελατών",
      "Admin cannot edit client order price": 
        "Ο διαχειριστής δεν μπορεί να επεξεργαστεί τιμή παραγγελιών πελατών",
      "Admin cannot edit client contact info": 
        "Ο διαχειριστής δεν μπορεί να επεξεργαστεί στοιχεία επικοινωνίας πελατών",
      "Admin cannot edit client extras": 
        "Ο διαχειριστής δεν μπορεί να επεξεργαστεί επιπλέον επιλογές παραγγελιών πελατών",
    },
  };
  
  return messages[locale]?.[reason] || reason || messages.en[reason] || "Permission denied";
}

/* ======================================================
   HELPERS
====================================================== */

function allow() {
  return { allowed: true, reason: null };
}

function deny(reason) {
  return { allowed: false, reason };
}

