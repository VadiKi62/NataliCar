import { revalidateTag } from "next/cache";
import sendEmail from "./sendEmail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { companyData } from "./companyData";

dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.tz.setDefault("Europe/Athens");

// Normalize API base URL from env. Trim whitespace and remove trailing slash.
const RAW_API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_LOCAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_URL = RAW_API_URL
  ? String(RAW_API_URL).trim().replace(/\/$/, "")
  : "";

// Fetch a single car by ID using fetch
export const fetchCar = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/car/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      throw new Error("Car not found");
    }

    const data = await response.json();
    console.log("Fetched Car:", data);
    return data;
  } catch (error) {
    console.error("Error fetching car:", error.message);
    throw error;
  }
};

// Fetch all cars using fetch
export const fetchAll = async () => {
  try {
    const apiUrl = API_URL ? `${API_URL}/api/car/all` : `/api/car/all`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      next: { cache: "no-store" },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "<no body>");
      console.error("Fetch /api/car/all failed", {
        apiUrl,
        status: response.status,
        body,
      });
      // Return empty array instead of throwing to avoid unhandled runtime errors in the UI
      return [];
    }
    const carsData = await response.json();
    return carsData;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

// Fetch all cars using fetch
// Используем кеширование для статических данных (revalidate: 600 секунд = 10 минут)
export const fetchAllCars = async () => {
  try {
    const apiUrl = API_URL ? `${API_URL}/api/car/all` : `/api/car/all`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Кеширование: данные обновляются каждые 10 минут
      next: { revalidate: 600 },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "<no body>");
      console.error("Fetch /api/car/all failed", {
        apiUrl,
        status: response.status,
        body,
      });
      // Return empty array instead of throwing to avoid unhandled runtime errors in the UI
      return [];
    }
    const carsData = await response.json();
    return carsData;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

// REFetch all orders using fetch
export const reFetchAllOrders = async () => {
  try {
    const apiUrl = `${API_URL}/api/order/refetch`;
    const response = await fetch(apiUrl, {
      next: { cache: "no-store" },
      method: "POST",
      // headers: {
      //   "Content-Type": "application/json",
      // },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    const ordersData = await response.json();
    return ordersData;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

//Adding new order using new order api
export const addOrderNew = async (orderData) => {
  try {
    // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ДЛЯ ОТСЛЕЖИВАНИЯ РАЗЛИЧИЙ
    console.log("=== ACTION.JS: АНАЛИЗ ВРЕМЕНИ ===");
    console.log(
      "Источник:",
      orderData.my_order ? "BookingModal" : "AddOrderModal"
    );
    console.log("orderData.timeIn тип:", typeof orderData.timeIn);
    console.log("orderData.timeIn значение:", orderData.timeIn);
    console.log("orderData.timeOut тип:", typeof orderData.timeOut);
    console.log("orderData.timeOut значение:", orderData.timeOut);

    // Проверяем, является ли объект dayjs
    if (orderData.timeIn && typeof orderData.timeIn.format === "function") {
      console.log("timeIn это dayjs объект:");
      console.log(
        "  timeIn.format('HH:mm'):",
        orderData.timeIn.format("HH:mm")
      );
      console.log(
        "  timeIn.format('YYYY-MM-DD HH:mm'):",
        orderData.timeIn.format("YYYY-MM-DD HH:mm")
      );
      console.log("  timeIn.toISOString():", orderData.timeIn.toISOString());
      console.log("  timeIn.$d (нативная дата):", orderData.timeIn.$d);
    }

    if (orderData.timeOut && typeof orderData.timeOut.format === "function") {
      console.log("timeOut это dayjs объект:");
      console.log(
        "  timeOut.format('HH:mm'):",
        orderData.timeOut.format("HH:mm")
      );
      console.log(
        "  timeOut.format('YYYY-MM-DD HH:mm'):",
        orderData.timeOut.format("YYYY-MM-DD HH:mm")
      );
      console.log("  timeOut.toISOString():", orderData.timeOut.toISOString());
      console.log("  timeOut.$d (нативная дата):", orderData.timeOut.$d);
    }

    const stringifiedData = JSON.stringify(orderData);
    const parsedBack = JSON.parse(stringifiedData);
    console.log("После JSON.stringify -> JSON.parse:");
    console.log("  timeIn:", parsedBack.timeIn);
    console.log("  timeOut:", parsedBack.timeOut);
    console.log("=== КОНЕЦ АНАЛИЗА ===");

    const response = await fetch(`${API_URL}/api/order/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: stringifiedData,
    });

    const result = await response.json();
    console.log("ADDING ORDER RESULT", result);

    if (response.status === 201) {
      console.log("Order added:", result);
      return { status: "success", data: result };
    } else if (response.status === 200) {
      // Non-confirmed dates conflict
      return {
        status: "startEndConflict",
        message: result.message,
        data: result.data,
      };
    } else if (response.status === 202) {
      // Non-confirmed dates conflict
      return {
        status: "pending",
        message: result.message,
        data: result.data,
      };
    } else if (response.status === 409) {
      // Confirmed dates conflict
      return { status: "conflict", message: result.message };
    } else {
      return { status: "error", message: result.message };
      // throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error occurred:", error.message);
    // Handling fetch-specific errors
    if (error.message === "Failed to fetch") {
      return { status: "error", message: "No response received from server." };
    } else {
      return {
        status: "error",
        message: error.message || "An error occurred.",
      };
    }
  }
};

// Fetch orders by car ID using fetch
export const fetchOrdersByCar = async (carId) => {
  try {
    const response = await fetch(`${API_URL}/api/order/${carId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orders = await response.json();
    return orders; // Return the orders data
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Fetch all orders using fetch
export const fetchAllOrders = async () => {
  try {
    const apiUrl = `${API_URL}/api/order/all?timestamp=${new Date().getTime()}`;
    const response = await fetch(apiUrl, {
      next: { cache: "no-store" },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    const ordersData = await response.json();
    return ordersData;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// UPDATE 1. action for changing rental dates
export const changeRentalDates = async (
  orderId,
  newStartDate,
  newEndDate,
  timeIn,
  timeOut,
  placeIn,
  placeOut,
  car,
  carNumber, // <-- добавьте этот аргумент!
  ChildSeats,
  insurance,
  franchiseOrder,
  numberOrder,
  insuranceOrder,
  totalPrice, // <-- добавить
  numberOfDays // <-- добавить
) => {
  try {
    const response = await fetch("/api/order/update/changeDates", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: orderId,
        rentalStartDate: newStartDate,
        rentalEndDate: newEndDate,
        timeIn: timeIn || null,
        timeOut: timeOut || null,
        placeIn: placeIn || null,
        placeOut: placeOut || null,
        car: car || null, // <-- обязательно!
        carNumber: carNumber || null, // <-- обязательно!
        ChildSeats: ChildSeats, // ДОБАВИТЬ!
        insurance: insurance, // ДОБАВИТЬ!
        franchiseOrder: franchiseOrder, // <-- добавляем франшизу заказа!
        numberOrder: numberOrder,
        insuranceOrder: insuranceOrder,
        // Новое: сохраняем стоимость и дни
        totalPrice,
        numberOfDays,
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      // Handle success, no conflicts
      console.log("Заказ обновлен!:", data.message);
      return {
        status: 201,
        message: data.message,
        updatedOrder: data.data,
      };
    } else if (response.status === 202) {
      // Handle non-confirmed conflict dates (partial update)
      console.log("Заказ обновлен но есть pending conflicts:", data);
      return {
        status: 202,
        message: data.message,
        conflicts: data.data.nonConfirmedOrders,
        updatedOrder: data.data.updatedOrder,
      };
    } else if (response.status === 408) {
      // Handle non-confirmed conflict dates (partial update)
      console.log("Заказ не обновлен - time-conflicts:", data);
      return {
        status: 408,
        message: data.message,
        conflicts: data.conflictDates,
      };
    } else if (response.status === 409) {
      // Handle confirmed conflict dates (no update)
      console.log("Confirmed conflicting dates:", data);
      return {
        status: 409,
        message: data.message,
        conflicts: data.confirmedOrders,
      };
    } else if (response.status === 403) {
      // Handle permission denied (protected order)
      console.log("Permission denied:", data);
      return {
        status: 403,
        message: data.message || "Permission denied: Only superadmin can modify this order",
        code: data.code || "PERMISSION_DENIED",
      };
    } else if (response.status === 401) {
      // Handle unauthorized
      console.log("Unauthorized:", data);
      return {
        status: 401,
        message: data.message || "Unauthorized",
      };
    } else {
      // Handle unexpected responses
      console.error("Unexpected response:", data);
      return {
        status: response.status,
        message: data.message || "Unexpected response",
        data: data,
      };
    }
  } catch (error) {
    // Handle fetch or server errors
    console.error("Error updating order:", error);
    return {
      status: 500,
      message: "Error updating order: " + error.message,
    };
  }
};

// UPDATE 2.  action for switching confirmed status
/**
 * Переключает статус подтверждения заказа
 *
 * @returns {{
 *   success: boolean,
 *   updatedOrder?: Object,
 *   message: string,
 *   level?: "block" | "warning" | null,
 *   affectedOrders?: Array,
 *   conflicts?: Array
 * }}
 */
export const toggleConfirmedStatus = async (orderId) => {
  console.log("toggleConfirmedStatus orderId:", orderId);
  try {
    const response = await fetch(`/api/order/update/switchConfirm/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "include",
    });

    const data = await response.json();

    // ✅ Успех (200) или успех с предупреждением (202)
    if (response.status === 200 || response.status === 202) {
      console.log("Order confirmation status updated:", data);
      return {
        success: true,
        updatedOrder: data.data,
        message: data.message,
        level: data.level || null,
        affectedOrders: data.affectedOrders || [],
      };
    }

    // ⛔ Блок (409) — нельзя подтвердить
    if (response.status === 409) {
      console.log("Order confirmation blocked:", data);
      return {
        success: false,
        message: data.message,
        level: data.level || "block",
        conflicts: data.conflicts || [],
      };
    }

    // ⛔ Permission denied (403) — только суперадмин может изменить
    if (response.status === 403) {
      console.log("Permission denied:", data);
      return {
        success: false,
        message: data.message || "Permission denied: Only superadmin can modify this order",
        level: "block",
        code: data.code || "PERMISSION_DENIED",
      };
    }

    // Другие ошибки
    return {
      success: false,
      message: data.message || "Ошибка при обновлении статуса",
      level: "block",
    };
  } catch (error) {
    console.error("Error updating confirmation status:", error);
    return {
      success: false,
      message: error.message || "Ошибка сети",
      level: "block",
    };
  }
};

// UPDATE 3.  action for changing customer information
export const updateCustomerInfo = async (orderId, updateData) => {
  const response = await fetch("/api/order/update/customer", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      _id: orderId,
      phone: updateData.phone,
      email: updateData.email,
      customerName: updateData.customerName,
      flightNumber: updateData.flightNumber,
    }),
  });

  const data = await response.json();

  // Handle permission denied (403)
  if (response.status === 403) {
    throw new Error(data.message || "Permission denied: Only superadmin can modify this order");
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to update customer information");
  }

  return data;
};

/**
 * Unified order update action - single source of truth for all order updates
 * 
 * @param {string} orderId - The order ID to update
 * @param {Object} payload - Partial update payload with any order fields:
 *   - rentalStartDate?, rentalEndDate?, timeIn?, timeOut?
 *   - car?, carNumber?, placeIn?, placeOut?
 *   - insurance?, ChildSeats?, franchiseOrder?
 *   - totalPrice?, numberOfDays?
 *   - customerName?, phone?, email?, flightNumber?
 *   - confirmed?
 * 
 * @returns {Promise<Object>} Response object with status, message, updatedOrder, etc.
 */
export const updateOrder = async (orderId, payload) => {
  try {
    const response = await fetch(`/api/order/update/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle success responses
    if (response.status === 200 || response.status === 201) {
      return {
        status: response.status,
        message: data.message || "Order updated successfully",
        updatedOrder: data.updatedOrder || data.data,
        success: data.success !== false, // Default to true if not specified
      };
    }

    // Handle partial success with conflicts (202)
    if (response.status === 202) {
      return {
        status: 202,
        message: data.message,
        conflicts: data.conflicts,
        updatedOrder: data.updatedOrder || data.data,
        level: data.level || null,
        affectedOrders: data.affectedOrders || [],
        success: true, // Still a success, just with warnings
      };
    }

    // Handle conflict errors (408, 409)
    if (response.status === 408 || response.status === 409) {
      return {
        status: response.status,
        message: data.message || "Conflict detected",
        conflicts: data.conflicts || data.conflictDates,
        success: false,
      };
    }

    // Handle permission denied (403)
    if (response.status === 403) {
      return {
        status: 403,
        message: data.message || "Permission denied",
        code: data.code || "PERMISSION_DENIED",
        success: false,
        level: data.level || "block",
      };
    }

    // Handle unauthorized (401)
    if (response.status === 401) {
      return {
        status: 401,
        message: data.message || "Unauthorized",
        success: false,
      };
    }

    // Handle other errors
    return {
      status: response.status,
      message: data.message || "Unexpected response",
      data: data,
      success: false,
    };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      status: 500,
      message: "Error updating order: " + error.message,
      success: false,
    };
  }
};

// UPDATE 4. Inline order update action (for table inline editing)
/**
 * Update order fields inline (supports customer info, dates, and times)
 * 
 * @param {string} orderId - Order ID
 * @param {Object} fields - Fields to update: 
 *   - Customer: { customerName?, phone?, email?, flightNumber? }
 *   - Dates/Times: { rentalStartDate?, rentalEndDate?, timeIn?, timeOut? }
 * @returns {Promise<Object>} Normalized response with updated order
 */
export const updateOrderInline = async (orderId, fields) => {
  // Determine which endpoint to use based on fields
  const dateTimeFields = ["rentalStartDate", "rentalEndDate", "timeIn", "timeOut"];
  const pricingFields = ["totalPrice", "price", "numberOfDays"];
  const hasDateTimeFields = Object.keys(fields).some(key => dateTimeFields.includes(key));
  const hasPricingFields = Object.keys(fields).some(key => pricingFields.includes(key));
  
  // Use changeDates endpoint for date/time/pricing fields, customer endpoint for customer fields only
  const endpoint = (hasDateTimeFields || hasPricingFields) 
    ? "/api/order/update/changeDates" 
    : "/api/order/update/customer";
  
  // Debug logging (dev only)
  if (process.env.NODE_ENV !== "production") {
    console.log("[updateOrderInline] Request:", {
      orderId,
      endpoint,
      fields,
      hasDateTimeFields,
    });
  }
  
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
    body: JSON.stringify({
      _id: orderId,
      ...fields,
    }),
  });

  const data = await response.json();

  // Debug logging (dev only)
  if (process.env.NODE_ENV !== "production") {
    console.log("[updateOrderInline] Response:", {
      orderId,
      status: response.status,
      success: data.success,
      dataKeys: data.data ? Object.keys(data.data) : data.updatedOrder ? Object.keys(data.updatedOrder) : [],
      data: data.data || data.updatedOrder || data,
    });
  }

  // Normalize response to match unified contract
  if (response.status === 403) {
    return {
      success: false,
      data: null,
      message: data.message || "Permission denied",
      level: "block",
      conflicts: [],
      affectedOrders: [],
      bufferHours: 2,
    };
  }

  if (!response.ok) {
    // For 409 conflicts, return normalized structure
    if (response.status === 409 || response.status === 408) {
      return {
        success: false,
        data: null,
        message: data.message || "Update blocked by conflict",
        level: "block",
        conflicts: data.conflicts ?? data.conflictDates ?? [],
        affectedOrders: data.affectedOrders ?? [],
        bufferHours: data.bufferHours ?? 2,
      };
    }
    throw new Error(data.message || "Failed to update order");
  }

  // Success - return normalized structure
  // changeDates endpoint returns { data: order } or { updatedOrder: order }
  // customer endpoint returns { updatedOrder: order }
  const updatedOrder = data.data || data.updatedOrder || data;
  
  return {
    success: true,
    data: updatedOrder,
    message: data.message || "Order updated successfully",
    level: null,
    conflicts: [],
    affectedOrders: [],
    bufferHours: 2,
  };
};

// UPDATE 5. Inline confirmation toggle action
/**
 * Toggle order confirmation status inline
 * 
 * @param {string} orderId - Order ID
 * @returns {Promise<{ success: boolean, updatedOrder: Object|null, level: string|null, message: string }>}
 *   - success: true if toggle succeeded, false if blocked/denied (403/409)
 *   - updatedOrder: updated order object from server (only if success=true)
 *   - level: "warning" | "block" | null
 *   - message: status message
 * @throws {Error} if request fails (network error, 500, etc.)
 */
export const updateOrderConfirmation = async (orderId) => {
  const response = await fetch(`/api/order/update/switchConfirm/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
  });

  const data = await response.json();

  // Pass through normalized response structure from backend
  // Backend always returns: { success, data, message, level, conflicts, affectedOrders, bufferHours }
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[updateOrderConfirmation] result:", {
      status: response.status,
      success: data.success,
      level: data.level,
      orderId,
    });
  }

  // Check if response is ok
  if (!response.ok) {
    // For 403, 409, etc. - return error result, don't throw
    if (response.status === 403 || response.status === 409) {
      return {
        success: false,
        data: null,
        message: data.message || "Cannot update order confirmation",
        level: data.level || "block",
        conflicts: data.conflicts ?? [],
        affectedOrders: data.affectedOrders ?? [],
        bufferHours: data.bufferHours ?? 2,
      };
    }
    // For other errors, throw
    throw new Error(data.message || "Failed to toggle confirmation");
  }

  // Success (200 or 202)
  if (response.status === 200 || response.status === 202) {
    return {
      success: true,
      data: data.data, // Server returns { success: true, data: updatedOrder }
      message: data.message,
      level: data.level ?? null,
      conflicts: data.conflicts ?? [],
      affectedOrders: data.affectedOrders ?? [],
      bufferHours: data.bufferHours ?? 2,
    };
  }

  // Unexpected status
  throw new Error(data.message || "Unexpected response from server");
};

export const addCar = async (formData) => {
  console.log("carDae from actions", formData);
  try {
    const response = await fetch("/api/car/addOne", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log("Car added successfully:", result.data);
      return { message: result.message, data: result.data, type: 200 };
    } else {
      console.error("Failed to add car:", result.message);
      return { message: result.message, data: result.data, type: 400 };
    }
  } catch (error) {
    console.error("Error adding car:", error);
    return { message: error.message, data: error, type: 500 };
  }
};

export const deleteCar = async (carId) => {
  try {
    const response = await fetch(`api/car/delete/${carId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(data);

    return { message: data.message, type: 200, data: carId };
  } catch (error) {
    console.error("Error deleting car", error);
    return {
      message: error.message || "Error deleting car",
      data: error,
      type: 500,
    };
  }
};

// UPDATE car
export const updateCar = async (updatedCar) => {
  console.log("updatedCar passing to backend from action", updatedCar);
  try {
    const response = await fetch(`/api/car/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCar),
    });

    if (!response.ok) {
      throw new Error("Failed to update car");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating car:", error);
    throw error;
  }
};

export async function getOrderById(orderId) {
  try {
    const response = await fetch(`/api/order/refetch/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed toget order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
}

// aункции, которая принимает массив ID заказов и возвращает подтвержденные заказы
export async function getConfirmedOrders(orderIds) {
  try {
    const orders = await Promise.all(orderIds.map(getOrderById));
    // Фильтруем заказы, оставляя только подтвержденные
    const confirmedOrders = orders.filter(
      (order) => order.status === "confirmed"
    );
    // Если подтвержденные заказы есть, возвращаем их, иначе возвращаем false
    return confirmedOrders.length > 0 ? confirmedOrders : false;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return false; // Возвращаем false в случае ошибки
  }
}

// Fetch company with caching (revalidate: 3600 секунд = 1 час)
export async function fetchCompany(companyId) {
  try {
    const apiUrl = API_URL 
      ? `${API_URL}/api/company/${companyId}` 
      : `/api/company/${companyId}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Кеширование: данные обновляются каждый час
      next: { revalidate: 3600 },
    });

    if (response.status === 404) {
      throw new Error("Company not found");
    }

    const data = await response.json();
    console.log("Fetched Company:", data);
    return data;
  } catch (error) {
    console.error("Error fetching company:", error.message);
    throw error;
  }
}

/**
 * Обновляет bufferTime компании
 * @param {string} companyId - ID компании
 * @param {number} bufferTime - Буферное время в часах (0-24)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function updateCompanyBuffer(companyId, bufferTime) {
  try {
    // Валидация
    if (!companyId) {
      return { success: false, error: "Company ID is required" };
    }

    const bufferTimeNumber = Number(bufferTime);
    if (isNaN(bufferTimeNumber) || bufferTimeNumber < 0 || bufferTimeNumber > 24) {
      return { success: false, error: "bufferTime must be a number between 0 and 24 hours" };
    }

    const apiUrl = API_URL 
      ? `${API_URL}/api/company/buffer/${companyId}` 
      : `/api/company/buffer/${companyId}`;
    
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bufferTime: bufferTimeNumber }),
      // Не кешируем мутации
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to update buffer" };
    }

    console.log(`✅ Buffer updated: ${companyId} → ${bufferTimeNumber}h`);
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error updating company buffer:", error.message);
    return { success: false, error: error.message || "Network error" };
  }
}
