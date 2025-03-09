import Company from "@models/company";
import { connectToDB } from "@utils/database";
import { companyData } from "@utils/companyData";

export const POST = async (request) => {
  try {
    await connectToDB();

    // const companyData = await request.json();
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
