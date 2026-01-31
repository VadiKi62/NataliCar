/**
 * orderNotificationDispatcher.js
 * 
 * ════════════════════════════════════════════════════════════════
 * ЕДИНАЯ ТОЧКА ОТПРАВКИ УВЕДОМЛЕНИЙ
 * ════════════════════════════════════════════════════════════════
 * 
 * 🔑 КЛЮЧЕВОЙ ПРИНЦИП:
 * UI и backend НЕ отправляют уведомления напрямую.
 * Они вызывают notifyOrderAction() — и всё.
 * 
 * 🧭 Схема:
 * notifyOrderAction()
 *     ↓
 * getOrderAccess()        ← ЕДИНАЯ логика прав
 *     ↓
 * isActionAllowedByAccess() ← 🛑 SAFETY CHECK
 *     ↓
 * getOrderNotifications() ← декларативно
 *     ↓
 * sanitizePayload()       ← PII firewall
 *     ↓
 * auditLog()              ← compliance
 *     ↓
 * dispatchOrderNotifications()
 */

import { 
  getOrderNotifications, 
  getActionIntent, 
  isActionAllowedByAccess,
  getPriorityByIntent,
} from "./orderNotificationPolicy";
import { getOrderAccess } from "./orderAccessPolicy";
import { ROLE } from "./admin-rbac";

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

/**
 * @typedef {"UI" | "BACKEND" | "CRON" | "SYSTEM"} NotificationSource
 */

/**
 * @typedef {Object} NotificationPayload
 * @property {string} orderId - Order ID
 * @property {string} [orderNumber] - Order number for display
 * @property {string} [carNumber] - Car registration number
 * @property {string} [customerName] - Customer name (if PII allowed)
 * @property {string} [phone] - Customer phone (if PII allowed)
 * @property {string} [email] - Customer email (if PII allowed)
 * @property {string} action - Action performed
 * @property {string} intent - Action intent (from ACTION_INTENT)
 * @property {string} [actorName] - Who performed the action
 * @property {NotificationSource} source - Where the action originated
 * @property {Date} timestamp - When the action was performed
 */

// ════════════════════════════════════════════════════════════════
// PII SANITIZER (ОБЯЗАТЕЛЬНЫЙ)
// ════════════════════════════════════════════════════════════════

/**
 * Список PII полей, которые могут быть в payload.
 */
const PII_FIELDS = ["customerName", "phone", "email", "Viber", "Whatsapp", "Telegram"];

/**
 * Санитайзер payload — гарантирует что PII не утечёт.
 * 
 * @param {NotificationPayload} payload
 * @param {import("./orderAccessPolicy").OrderAccess} access
 * @param {boolean} includePII - Флаг из notification
 * @returns {NotificationPayload}
 */
function sanitizePayload(payload, access, includePII) {
  // Если разрешено PII и access позволяет — возвращаем как есть
  if (includePII && access?.canSeeClientPII) {
    return payload;
  }

  // Иначе удаляем все PII поля
  const sanitized = { ...payload };
  for (const field of PII_FIELDS) {
    delete sanitized[field];
  }
  
  return sanitized;
}

// ════════════════════════════════════════════════════════════════
// AUDIT LOG (compliance-ready)
// ════════════════════════════════════════════════════════════════

/**
 * Audit log hook — логирует ВСЕ действия над заказами.
 * 
 * @param {Object} params
 * @param {Object} params.order
 * @param {Object} params.user
 * @param {string} params.action
 * @param {import("./orderAccessPolicy").OrderAccess} params.access
 * @param {string} params.intent
 * @param {NotificationSource} params.source
 */
async function auditLog({ order, user, action, access, intent, source }) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    orderId: order?._id?.toString?.() || order?._id,
    action,
    intent,
    source,
    actor: {
      email: user?.email,
      role: user?.role,
    },
    access: {
      canEdit: access?.canEdit,
      canDelete: access?.canDelete,
      canSeeClientPII: access?.canSeeClientPII,
    },
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("[AUDIT]", JSON.stringify(logEntry, null, 2));
    return;
  }

  // TODO: Интеграция с внешним audit storage
  // - MongoDB collection (AuditLog)
  // - S3 bucket
  // - External service (Datadog, Sentry, etc.)
  // 
  // Example:
  // await AuditLog.create(logEntry);
}

// ════════════════════════════════════════════════════════════════
// CHANNEL IMPLEMENTATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Отправляет уведомление в Telegram.
 * 
 * @param {string} target - Recipient (SUPERADMIN, DEVELOPERS, etc.)
 * @param {NotificationPayload} payload
 * @param {string} reason
 * @param {"CRITICAL" | "INFO" | "DEBUG"} priority
 */
async function sendTelegramNotification(target, payload, reason, priority) {
  // В production здесь будет реальный вызов Telegram API
  if (process.env.NODE_ENV !== "production") {
    console.log(`[TELEGRAM → ${target}] [${priority}]`, reason, payload);
    return;
  }
  
  // TODO: Интеграция с Telegram Bot API
  // const chatId = getTelegramChatId(target);
  // const emoji = priority === "CRITICAL" ? "🚨" : priority === "INFO" ? "ℹ️" : "🔍";
  // await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
  //   method: "POST",
  //   body: JSON.stringify({
  //     chat_id: chatId,
  //     text: `${emoji} ${reason}\n\n${formatPayload(payload)}`,
  //   }),
  // });
}

/**
 * Отправляет уведомление по email.
 * 
 * @param {string} target - Recipient
 * @param {NotificationPayload} payload
 * @param {string} reason
 * @param {"CRITICAL" | "INFO" | "DEBUG"} priority
 */
async function sendEmailNotification(target, payload, reason, priority) {
  // В production здесь будет реальный вызов email API
  if (process.env.NODE_ENV !== "production") {
    console.log(`[EMAIL → ${target}] [${priority}]`, reason, payload);
    return;
  }
  
  // TODO: Интеграция с email сервисом
  // const email = getEmailAddress(target, payload);
  // await sendEmail({
  //   to: email,
  //   subject: `[${priority}] ${reason}`,
  //   body: formatEmailBody(payload, reason),
  // });
}

// ════════════════════════════════════════════════════════════════
// DISPATCHER (internal, не экспортируем напрямую)
// ════════════════════════════════════════════════════════════════

/**
 * Отправляет все уведомления для действия над заказом.
 * 
 * @param {import("./orderNotificationPolicy").Notification[]} notifications
 * @param {NotificationPayload} payload
 * @param {import("./orderAccessPolicy").OrderAccess} access
 */
async function dispatchOrderNotifications(notifications, payload, access) {
  if (!notifications || notifications.length === 0) {
    return;
  }
  
  const intent = payload.intent;
  const promises = [];
  
  for (const notification of notifications) {
    const { target, channels, reason, includePII } = notification;
    
    // Priority вычисляется декларативно по intent
    const priority = getPriorityByIntent(intent);
    
    // 🔒 ОБЯЗАТЕЛЬНО: санитайзим payload
    const safePayload = sanitizePayload(payload, access, includePII);
    
    for (const channel of channels) {
      if (channel === "TELEGRAM") {
        promises.push(
          sendTelegramNotification(target, safePayload, reason, priority)
            .catch(err => console.error(`[Notification Error] TELEGRAM → ${target}:`, err))
        );
      }
      
      if (channel === "EMAIL") {
        promises.push(
          sendEmailNotification(target, safePayload, reason, priority)
            .catch(err => console.error(`[Notification Error] EMAIL → ${target}:`, err))
        );
      }
    }
  }
  
  // Отправляем параллельно, не блокируем основной flow
  await Promise.allSettled(promises);
}

// ════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT (ЕДИНСТВЕННЫЙ ЭКСПОРТ)
// ════════════════════════════════════════════════════════════════

/**
 * 🔑 ЕДИНСТВЕННАЯ ФУНКЦИЯ, КОТОРУЮ НУЖНО ВЫЗЫВАТЬ.
 * 
 * Вычисляет и отправляет уведомления для действия над заказом.
 * 
 * @param {Object} params
 * @param {Object} params.order - Order object
 * @param {Object} params.user - User from session
 * @param {import("./orderNotificationPolicy").OrderAction} params.action
 * @param {string} [params.actorName] - Who performed the action
 * @param {NotificationSource} [params.source="UI"] - Where the action originated
 */
export async function notifyOrderAction({
  order,
  user,
  action,
  actorName,
  source = "UI",
}) {
  if (!order || !user) {
    return;
  }
  
  // Вычисляем access из orderAccessPolicy
  const isSuperAdmin = user.role === ROLE.SUPERADMIN;
  const access = getOrderAccess({
    role: isSuperAdmin ? "SUPERADMIN" : "ADMIN",
    isClientOrder: order.my_order === true,
    confirmed: order.confirmed === true,
    isPast: false, // Для уведомлений past не важен
  });
  
  const intent = getActionIntent(action);
  
  // ════════════════════════════════════════════════════════════════
  // 🛑 SAFETY CHECK: действие должно быть разрешено access policy
  // ════════════════════════════════════════════════════════════════
  if (!isActionAllowedByAccess(action, access)) {
    console.warn(
      `[NOTIFY BLOCKED] Action ${action} is not allowed by access policy`,
      { 
        orderId: order._id, 
        intent,
        source,
        access: {
          canEdit: access?.canEdit,
          canDelete: access?.canDelete,
          canConfirm: access?.canConfirm,
        },
      }
    );
    return;
  }
  
  // ════════════════════════════════════════════════════════════════
  // 📝 AUDIT LOG (всегда, даже если нет уведомлений)
  // ════════════════════════════════════════════════════════════════
  await auditLog({ order, user, action, access, intent, source });
  
  // Получаем список уведомлений
  const notifications = getOrderNotifications({
    action,
    access,
    order,
  });
  
  if (notifications.length === 0) {
    return;
  }
  
  // Формируем payload
  const payload = {
    orderId: order._id?.toString?.() || order._id,
    orderNumber: order.orderNumber,
    carNumber: order.carNumber,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    action,
    intent,
    actorName,
    source,
    timestamp: new Date(),
  };
  
  await dispatchOrderNotifications(notifications, payload, access);
}
