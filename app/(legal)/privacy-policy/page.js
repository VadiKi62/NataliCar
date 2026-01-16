import { getSeoConfig } from "@config/seo";
import LegalPageContent from "../_components/LegalPageContent";

const seoConfig = getSeoConfig();

export const metadata = {
  title: "Privacy Policy - Car Rental Halkidiki",
  description:
    "Read our privacy policy to understand how Natali Cars collects, uses, and protects your personal information when you rent a car in Halkidiki, Greece.",
  alternates: {
    canonical: `${seoConfig.baseUrl}/privacy-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <LegalPageContent docType="privacy-policy" />;
}
