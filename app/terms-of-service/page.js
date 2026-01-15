import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import LoadingSpinner from "@app/loading";
import Feed from "@app/components/Feed";
import LegalDoc from "@app/components/Legal/LegalDoc";
import { getSeoConfig } from "@config/seo";

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
  unstable_noStore();
  return (
    <Feed>
      <Suspense fallback={<LoadingSpinner />}>
        <LegalDoc docType="terms-of-service" />
      </Suspense>
    </Feed>
  );
}
