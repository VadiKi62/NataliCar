/**
 * PRICE ARCHITECTURE (SINGLE SOURCE OF TRUTH)
 *
 * totalPrice      → ALWAYS auto-calculated price (never overridden)
 * OverridePrice   → Manual price set by admin (optional)
 *
 * effectivePrice =
 *   OverridePrice !== null
 *     ? OverridePrice
 *     : totalPrice
 *
 * Rules:
 * - totalPrice is recalculated whenever rental params change
 * - OverridePrice NEVER changes automatically
 * - UI, invoices, and payments ALWAYS use effectivePrice
 * - Admin can explicitly reset OverridePrice to return to auto pricing
 */

/**
 * Returns the effective price used by UI, invoices, and payments
 * 
 * @param {Object} order - Order object with totalPrice and OverridePrice
 * @returns {number} Effective price (OverridePrice if set, otherwise totalPrice)
 */
export function getEffectivePrice(order) {
  if (!order) return 0;
  
  // If OverridePrice is set (not null/undefined/0), use it
  // Note: 0 is a valid override value, so we check for null/undefined explicitly
  if (order.OverridePrice !== null && order.OverridePrice !== undefined) {
    return Number(order.OverridePrice);
  }
  
  // Otherwise use auto-calculated totalPrice
  return Number(order.totalPrice) || 0;
}

/**
 * Check if order has manual price override
 * 
 * @param {Object} order - Order object
 * @returns {boolean} True if OverridePrice is set
 */
export function hasPriceOverride(order) {
  if (!order) return false;
  return order.OverridePrice !== null && order.OverridePrice !== undefined;
}

/**
 * Get both prices for display/comparison
 * 
 * @param {Object} order - Order object
 * @returns {{effective: number, calculated: number, hasOverride: boolean}}
 */
export function getPriceInfo(order) {
  if (!order) {
    return {
      effective: 0,
      calculated: 0,
      hasOverride: false,
    };
  }
  
  const calculated = Number(order.totalPrice) || 0;
  const override = order.OverridePrice !== null && order.OverridePrice !== undefined
    ? Number(order.OverridePrice)
    : null;
  const hasOverride = override !== null;
  
  return {
    effective: hasOverride ? override : calculated,
    calculated,
    override,
    hasOverride,
  };
}

