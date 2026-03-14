// import { connectToDB } from "@lib/database";
// import DiscountSetting from "@models/DiscountSetting";

// export const POST = async (req) => {
//   console.log("🔵 [POST /api/discount/save] Request received");

//   try {
//     // Подключение к БД
//     console.log("🟠 Connecting to DB...");
//     await connectToDB();
//     console.log("🟢 DB connected successfully");

//     // Парсинг тела запроса
//     console.log("🟠 Parsing request body...");
//     const body = await req.json();
//     console.log("📦 Request body:", JSON.stringify(body, null, 2));

//     // Валидация данных
//     if (
//       typeof body.discount !== "number" ||
//       body.discount < 0 ||
//       body.discount > 100
//     ) {
//       console.error("🔴 Invalid discount value:", body.discount);
//       return new Response(
//         JSON.stringify({
//           error: "Discount must be a number between 0 and 100",
//         }),
//         { status: 400 }
//       );
//     }

//     if (!body.startDate || !body.endDate) {
//       console.error("🔴 Missing dates:", {
//         startDate: body.startDate,
//         endDate: body.endDate,
//       });
//       return new Response(
//         JSON.stringify({
//           error: "Both start and end dates are required",
//         }),
//         { status: 400 }
//       );
//     }

//     // Поиск существующей записи
//     console.log("🟠 Searching for existing discount setting...");
//     const existing = await DiscountSetting.findOne();
//     console.log(
//       existing ? "🟢 Found existing setting" : "🟡 No existing setting found"
//     );

//     const discountData = {
//       discount: body.discount,
//       startDate: new Date(body.startDate),
//       endDate: new Date(body.endDate),
//       updatedAt: new Date(),
//     };

//     // Сохранение данных
//     let result;
//     if (existing) {
//       console.log("🟠 Updating existing setting...");
//       Object.assign(existing, discountData);
//       result = await existing.save();
//       console.log("🟢 Setting updated:", result);
//     } else {
//       console.log("🟠 Creating new setting...");
//       result = await DiscountSetting.create(discountData);
//       console.log("🟢 New setting created:", result);
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         data: result,
//       }),
//       {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error("🔴 ERROR:", error);
//     return new Response(
//       JSON.stringify({
//         error: error.message || "Server error occurred",
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// };

import { connectToDB } from "@lib/database";
import DiscountSetting from "@models/DiscountSetting";

// POST — сохраняет скидку
export const POST = async (req) => {
  console.log("🔵 [POST /api/discount/save] Request received");

  try {
    console.log("🟠 Connecting to DB...");
    await connectToDB();
    console.log("🟢 DB connected successfully");

    console.log("🟠 Parsing request body...");
    const body = await req.json();
    console.log("📦 Request body:", JSON.stringify(body, null, 2));

    if (
      typeof body.discount !== "number" ||
      body.discount < 0 ||
      body.discount > 100
    ) {
      return new Response(
        JSON.stringify({
          error: "Discount must be a number between 0 and 100",
        }),
        { status: 400 }
      );
    }

    if (!body.startDate || !body.endDate) {
      return new Response(
        JSON.stringify({ error: "Both start and end dates are required" }),
        { status: 400 }
      );
    }

    const existing = await DiscountSetting.findOne();
    const discountData = {
      discount: body.discount,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      updatedAt: new Date(),
    };

    let result;
    if (existing) {
      Object.assign(existing, discountData);
      result = await existing.save();
    } else {
      result = await DiscountSetting.create(discountData);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Server error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// ✅ GET — загружает скидку
export const GET = async () => {
  console.log("🔵 [GET /api/discount] Request received");

  try {
    await connectToDB();
    const discount = await DiscountSetting.findOne();

    return new Response(JSON.stringify(discount), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔴 GET discount error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch discount" }), {
      status: 500,
    });
  }
};
