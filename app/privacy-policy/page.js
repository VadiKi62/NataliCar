import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import LoadingSpinner from "@app/loading";
import Feed from "@app/components/Feed";
import LegalDoc from "@app/components/Legal/LegalDoc";
import { getSeoConfig } from "@config/seo";

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
  unstable_noStore();
  return (
    <Feed>
      <Suspense fallback={<LoadingSpinner />}>
        <LegalDoc docType="privacy-policy" />
      </Suspense>
    </Feed>
  );
}
