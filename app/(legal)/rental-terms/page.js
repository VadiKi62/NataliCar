import { getSeoConfig } from "@config/seo";
import RentalTermsContent from "../_components/RentalTermsContent";

const seoConfig = getSeoConfig();

export const metadata = {
  title: "Rental Terms and Conditions - Car Rental Halkidiki",
  description:
    "Read the rental terms and conditions for renting a car with Natali Cars in Halkidiki, Greece. Understand our rental policies, requirements, and responsibilities.",
  alternates: {
    canonical: `${seoConfig.baseUrl}/rental-terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RentalTermsPage() {
  return <RentalTermsContent />;
}
