import { connectToDB } from "@utils/database";
import { Car } from "@models/car";
import { Order } from "@models/order";

export async function POST(request) {
  try {
    await connectToDB();

    // Оптимизация: выбираем только нужные поля для ускорения запроса
    const orders = await Order.find()
      .select('rentalStartDate rentalEndDate timeIn timeOut car carNumber confirmed customerName phone email numberOfDays totalPrice OverridePrice carModel date my_order placeIn placeOut flightNumber ChildSeats insurance franchiseOrder orderNumber')
      .lean(); // Используем lean() для ускорения - возвращает plain JS объекты вместо Mongoose документов

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(`Failed to fetch orders: ${error.message}`, {
      status: 500,
    });
  }
}
