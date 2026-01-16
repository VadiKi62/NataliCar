import { getSeoConfig } from "@config/seo";
import LegalPageContent from "../_components/LegalPageContent";

const seoConfig = getSeoConfig();

export const metadata = {
  title: "Cookie Policy - Car Rental Halkidiki",
  description:
    "Learn about how Natali Cars uses cookies and similar technologies on our car rental website in Halkidiki, Greece.",
  alternates: {
    canonical: `${seoConfig.baseUrl}/cookie-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiePolicyPage() {
  return <LegalPageContent docType="cookie-policy" />;
}
