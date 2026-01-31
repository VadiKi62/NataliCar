/**
 * useOrderAccess.js
 * 
 * ════════════════════════════════════════════════════════════════
 * REACT HOOK: Single Entry Point for Order Access
 * ════════════════════════════════════════════════════════════════
 * 
 * ❗ UI никогда не вычисляет права сам
 * ❗ Использует orderAccessPolicy как единый источник истины
 * 
 * Использование:
 * ```js
 * const access = useOrderAccess(editedOrder);
 * 
 * {access.canSeeClientPII && <ClientContacts />}
 * {access.canEditDates && <DateEditor />}
 * {access.canEditReturn && <ReturnPlaceEditor />}
 * {!access.canEdit && <ReadOnlyBanner />}
 * ```
 */

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { getOrderAccess, ROLE } from "@/domain/orders/orderAccessPolicy";

// Extend dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Athens timezone for consistent date comparison
const ATHENS_TZ = "Europe/Athens";

// ════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Проверяет, является ли заказ прошлым (rentalEndDate < today в Athens TZ)
 * 
 * @param {Object} order - Order object
 * @returns {boolean}
 */
function isOrderPast(order) {
  if (!order?.rentalEndDate) return false;
  
  const endDate = dayjs(order.rentalEndDate);
  const today = dayjs().tz(ATHENS_TZ).startOf("day");
  
  return endDate.isBefore(today, "day");
}

/**
 * Создаёт OrderContext из order и session.
 * 
 * @param {Object} order
 * @param {Object} session
 * @returns {import("@/domain/orders/orderAccessPolicy").OrderContext}
 */
function createContext(order, session) {
  if (!order || !session?.user) {
    return {
      role: "ADMIN",
      isClientOrder: false,
      confirmed: false,
      isPast: false,
    };
  }
  
  const isSuperAdmin = session.user.role === ROLE.SUPERADMIN;
  
  return {
    role: isSuperAdmin ? "SUPERADMIN" : "ADMIN",
    isClientOrder: order.my_order === true,
    confirmed: order.confirmed === true,
    isPast: isOrderPast(order),
  };
}

// ════════════════════════════════════════════════════════════════
// MAIN HOOK
// ════════════════════════════════════════════════════════════════

/**
 * React hook для получения доступов к заказу.
 * 
 * Автоматически:
 * - Получает роль из сессии
 * - Определяет isPast по Athens timezone
 * - Мемоизирует результат
 * 
 * @param {Object} order - Order object (can be editedOrder)
 * @param {Object} options - Optional overrides
 * @param {boolean} options.forceViewOnly - Force view-only mode
 * @returns {import("@/domain/orders/orderAccessPolicy").OrderAccess | null}
 */
export function useOrderAccess(order, options = {}) {
  const { data: session } = useSession();
  const { forceViewOnly = false } = options;

  return useMemo(() => {
    // Если нет order или session — возвращаем null
    if (!order || !session?.user) {
      return null;
    }
    
    // Создаём контекст
    const ctx = createContext(order, session);
    
    // Получаем доступы
    const access = getOrderAccess(ctx);
    
    // Применяем forceViewOnly если нужно
    if (forceViewOnly && access.canEdit) {
      return {
        ...access,
        canEdit: false,
        canEditDates: false,
        canEditReturn: false,
        canEditInsurance: false,
        canEditPricing: false,
        isViewOnly: true,
      };
    }
    
    return access;
  }, [
    order?._id,
    order?.my_order,
    order?.confirmed,
    order?.rentalEndDate,
    session?.user?.role,
    forceViewOnly,
  ]);
}

// ════════════════════════════════════════════════════════════════
// HELPER EXPORTS
// ════════════════════════════════════════════════════════════════

/**
 * Возвращает человекочитаемую причину ограничения доступа.
 * 
 * @param {import("@/domain/orders/orderAccessPolicy").OrderAccess} access
 * @param {Object} order
 * @returns {string|null}
 */
export function getAccessRestrictionReason(access, order) {
  if (!access) return null;
  
  if (access.isViewOnly) {
    if (isOrderPast(order)) {
      return "Прошлый заказ — только просмотр";
    }
    if (order?.my_order && !order?.confirmed) {
      return "Неподтверждённый клиентский заказ — только просмотр";
    }
  }
  
  if (!access.canEditDates && order?.my_order) {
    return "Даты клиентского заказа нельзя изменять";
  }
  
  return null;
}

/**
 * Возвращает список полей, которые нельзя редактировать.
 * 
 * @param {import("@/domain/orders/orderAccessPolicy").OrderAccess} access
 * @returns {string[]}
 */
export function getDisabledFields(access) {
  if (!access) return [];
  
  const disabled = [];
  
  if (!access.canEditDates) {
    disabled.push("rentalStartDate", "rentalEndDate", "timeIn", "timeOut", "numberOfDays");
  }
  if (!access.canEditReturn) {
    disabled.push("placeOut");
  }
  if (!access.canEditInsurance) {
    disabled.push("insurance");
  }
  if (!access.canEditPricing) {
    disabled.push("totalPrice", "OverridePrice");
  }
  if (!access.canSeeClientPII) {
    disabled.push("customerName", "phone", "email", "Viber", "Whatsapp", "Telegram");
  }
  
  return disabled;
}

/**
 * Проверяет, можно ли редактировать конкретное поле.
 * 
 * @param {import("@/domain/orders/orderAccessPolicy").OrderAccess} access
 * @param {string} fieldName
 * @returns {boolean}
 */
export function canEditField(access, fieldName) {
  if (!access || !access.canEdit) return false;
  
  const disabledFields = getDisabledFields(access);
  return !disabledFields.includes(fieldName);
}

export default useOrderAccess;
