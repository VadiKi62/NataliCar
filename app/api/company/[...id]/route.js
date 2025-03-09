import Company from "@models/company";
import { connectToDB } from "@utils/database";

export const GET = async (request, { params }) => {
  try {
    await connectToDB();

    const { id } = params; // Extract the company ID from the query parameter

    if (!id) {
      return new Response("Company ID is required", { status: 400 });
    }

    const company = await Company.findById(id);

    if (!company) {
      return new Response("Company not found", { status: 404 });
    }

    return new Response(JSON.stringify(company), { status: 200 });
  } catch (error) {
    console.error("Error retrieving company:", error);
    return new Response(`Failed to retrieve company: ${error.message}`, {
      status: 500,
    });
  }
};
