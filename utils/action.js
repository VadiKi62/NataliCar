import { revalidateTag } from "next/cache";
import sendEmail from "./sendEmail";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { companyData } from "./companyData";

dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.tz.setDefault("Europe/Athens");

export const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_LOCAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

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
    const apiUrl = `${API_URL}/api/car/all`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cars");
    }
    const carsData = await response.json();
    return carsData;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

// Fetch all cars using fetch
export const fetchAllCars = async () => {
  try {
    const apiUrl = `${API_URL}/api/car/all`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cars");
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
    const response = await fetch(`${API_URL}/api/order/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
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
  placeOut
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
export const toggleConfirmedStatus = async (orderId) => {
  console.log("!!!!!!orderId", orderId);
  try {
    const response = await fetch(`/api/order/update/switchConfirm/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log("Order confirmation status updated:", data);
      return { updatedOrder: data.data, message: data.message };
    }
  } catch (error) {
    console.error("Error updating confirmation status:", error);
    return error;
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
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update customer information");
  }

  return await response.json();
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

export async function fetchCompany(companyId) {
  try {
    const response = await fetch(`${API_URL}/api/company/${companyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      // return companyData;
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
