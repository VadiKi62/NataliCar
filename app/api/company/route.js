import Company from "@models/company";
import { connectToDB } from "@utils/database";
import { COMPANY_ID } from "@config/company";

/**
 * POST /api/company
 * Creates a new company from request body.
 */
export const POST = async (request) => {
  try {
    await connectToDB();

    const companyData = await request.json();
    const newCompany = new Company(companyData);
    await newCompany.save();

    return new Response(JSON.stringify(newCompany), { status: 201 });
  } catch (error) {
    console.error("Error adding company:", error);
    return new Response(`Failed to add company: ${error.message}`, {
      status: 500,
    });
  }
};

/**
 * GET /api/company
 * Returns the company data by COMPANY_ID.
 */
export const GET = async () => {
  try {
    await connectToDB();

    const company = await Company.findById(COMPANY_ID);
    
    if (!company) {
      return new Response("Company not found", { status: 404 });
    }

    return new Response(JSON.stringify(company), { 
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return new Response(`Failed to fetch company: ${error.message}`, {
      status: 500,
    });
  }
};
