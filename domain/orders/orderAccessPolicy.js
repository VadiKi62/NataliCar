/**
 * orderAccessPolicy.js
 * 
 * ════════════════════════════════════════════════════════════════
 * ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ ДЛЯ ВСЕХ ДОСТУПОВ К ЗАКАЗАМ
 * ════════════════════════════════════════════════════════════════
 * 
 * ❗ Без React. Без UI. Только бизнес-правила.
 * ❗ ВСЕ изменения доступов делаются ТОЛЬКО здесь.
 * ❗ UI и backend — тупые потребители.
 * 
 * ROLES:
 * - SUPERADMIN: полный доступ ко всему
 * - ADMIN: ограниченный доступ согласно правилам ниже
 * 
 * ORDER TYPES:
 * - Client order (my_order === true): заказ от клиента
 * - Internal order (my_order === false): внутренний заказ админа
 * 
 * TIME BUCKETS:
 * - Past (isPast): rentalEndDate < today → только просмотр
 * - Current/Future: активные заказы
 */

import { ROLE } from "./admin-rbac";

// ════════════════════════════════════════════════════════════════
// TYPES (JSDoc for JS, but structured like TS)
// ════════════════════════════════════════════════════════════════

/**
 * @typedef {"ADMIN" | "SUPERADMIN"} PolicyRole
 */

/**
 * @typedef {Object} OrderContext
 * @property {PolicyRole} role - User role
 * @property {boolean} isClientOrder - my_order === true
 * @property {boolean} confirmed - Order confirmed by superadmin
 * @property {boolean} isPast - rentalEndDate < today (Athens TZ)
 */

/**
 * @typedef {Object} OrderAccess
 * @property {boolean} canView - Can open/view the order
 * @property {boolean} canEdit - Can edit any field
 * @property {boolean} canDelete - Can delete the order
 * @property {boolean} canEditDates - Can edit pickup/return dates
 * @property {boolean} canEditReturn - Can edit return place/time
 * @property {boolean} canEditInsurance - Can edit insurance type
 * @property {boolean} canEditPricing - Can edit price fields
 * @property {boolean} canConfirm - Can confirm/unconfirm order
 * @property {boolean} canSeeClientPII - Can see client contact info
 * @property {boolean} notifySuperadminOnEdit - Should notify superadmin on edit
 * @property {boolean} isViewOnly - Convenience flag: !canEdit
 */

// ════════════════════════════════════════════════════════════════
// POLICY IMPLEMENTATION
// ════════════════════════════════════════════════════════════════

/**
 * Единая функция определения доступов к заказу.
 * 
 * ЧИТАЕТСЯ КАК БИЗНЕС-ДОКУМЕНТАЦИЯ.
 * 
 * @param {OrderContext} ctx - Order context
 * @returns {OrderAccess} - Access permissions
 */
export function getOrderAccess(ctx) {
  const { role, isClientOrder, confirmed, isPast } = ctx;

  // ════════════════════════════════════════════════════════════════
  // 🟣 SUPERADMIN — полный доступ ко всему
  // ════════════════════════════════════════════════════════════════
  if (role === "SUPERADMIN") {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canEditDates: true,
      canEditReturn: true,
      canEditInsurance: true,
      canEditPricing: true,
      canConfirm: true,
      canSeeClientPII: true,
      notifySuperadminOnEdit: false,
      isViewOnly: false,
    };
  }

  // ════════════════════════════════════════════════════════════════
  // 🟡 ADMIN — ограниченные права
  // ════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────
  // ⛔ PAST ORDERS — только просмотр (для любого типа заказа)
  // ────────────────────────────────────────────────────────────────
  if (isPast) {
    return {
      canView: true,
      canEdit: false,
      canDelete: false,
      canEditDates: false,
      canEditReturn: false,
      canEditInsurance: false,
      canEditPricing: false,
      canConfirm: false,
      // 🔥 PII видно только для confirmed client orders
      canSeeClientPII: !isClientOrder || confirmed,
      notifySuperadminOnEdit: false,
      isViewOnly: true,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 🔴 CLIENT ORDERS (my_order === true)
  // ────────────────────────────────────────────────────────────────
  if (isClientOrder) {
    if (!confirmed) {
      // UNCONFIRMED client order
      return {
        canView: true,
        canEdit: false,           // ❌ нельзя редактировать
        canDelete: true,           // ✅ можно удалить (спам, ошибочные заказы)
        canEditDates: false,
        canEditReturn: false,
        canEditInsurance: false,
        canEditPricing: false,
        canConfirm: false,        // ❌ только superadmin подтверждает
        canSeeClientPII: false,   // 🔥 КЛЮЧЕВОЕ: PII скрыты
        notifySuperadminOnEdit: false,
        isViewOnly: true,
      };
    }

    // CONFIRMED client order
    return {
      canView: true,
      canEdit: true,              // ✅ частичный edit
      canDelete: false,           // ❌ нельзя удалить confirmed
      canEditDates: false,        // ❌ даты нельзя
      canEditReturn: true,        // ✅ место/время возврата
      canEditInsurance: true,      // ✅ страховка можно
      canEditPricing: false,      // ❌ цена нельзя
      canConfirm: false,          // ❌ только superadmin отменяет
      canSeeClientPII: true,      // 🔥 КЛЮЧЕВОЕ: PII видны
      notifySuperadminOnEdit: true, // 🔔 уведомлять superadmin
      isViewOnly: false,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // 🟢 INTERNAL ORDERS (my_order === false) — полный контроль
  // ────────────────────────────────────────────────────────────────
  return {
    canView: true,
    canEdit: true,
    canDelete: true,
    canEditDates: true,
    canEditReturn: true,
    canEditInsurance: true,
    canEditPricing: true,
    canConfirm: false,            // internal orders не требуют подтверждения
    canSeeClientPII: true,        // internal = всегда видно
    notifySuperadminOnEdit: false,
    isViewOnly: false,
  };
}

// ════════════════════════════════════════════════════════════════
// HELPER: Create context from order and user
// ════════════════════════════════════════════════════════════════

/**
 * Создаёт OrderContext из order и user объектов.
 * 
 * @param {Object} order - Order object
 * @param {Object} user - User object from session
 * @param {Function} isPastFn - Function to check if order is past
 * @returns {OrderContext}
 */
export function createOrderContext(order, user, isPastFn) {
  if (!order || !user) {
    return {
      role: "ADMIN",
      isClientOrder: false,
      confirmed: false,
      isPast: false,
    };
  }

  const isSuperAdmin = user.role === ROLE.SUPERADMIN;
  
  return {
    role: isSuperAdmin ? "SUPERADMIN" : "ADMIN",
    isClientOrder: order.my_order === true,
    confirmed: order.confirmed === true,
    isPast: isPastFn ? isPastFn(order) : false,
  };
}

// ════════════════════════════════════════════════════════════════
// EXPORTS for backward compatibility
// ════════════════════════════════════════════════════════════════

export { ROLE };
