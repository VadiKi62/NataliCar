import { getSeoConfig } from "@config/seo";
import LegalPageContent from "../_components/LegalPageContent";

const seoConfig = getSeoConfig();

export const metadata = {
  title: "Terms of Service - Car Rental Halkidiki",
  description:
    "Read the terms and conditions for renting a car with Natali Cars in Halkidiki, Greece. Understand our rental policies, requirements, and responsibilities.",
  alternates: {
    canonical: `${seoConfig.baseUrl}/terms-of-service`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return <LegalPageContent docType="terms-of-service" />;
}
