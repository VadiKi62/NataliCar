import { Order } from "@models/order";
import { connectToDB } from "@utils/database";

export const PUT = async (req) => {
  try {
    await connectToDB();

    const { _id, phone, email, customerName } = await req.json(); // Destructure only the allowed fields

    // Filter the update to only include allowed fields
    const updateFields = {};
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (customerName) updateFields.customerName = customerName;

    // Update the order with only the allowed fields
    const updatedOrder = await Order.findByIdAndUpdate(_id, updateFields, {
      new: true, // return the updated document
    });

    if (!updatedOrder) {
      return new Response(JSON.stringify({ message: "Заказ не найден" }), {
        status: 404,
        success: false,
      });
    }

    return new Response(
      JSON.stringify({
        updatedOrder,
        message: "Данные клиента обновлены успешно",
      }),
      {
        status: 200,
        success: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Ошибка. Данные клиента не обновлены" }),
      { status: 500, success: false }
    );
  }
};
