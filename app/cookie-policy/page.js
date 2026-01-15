import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import LoadingSpinner from "@app/loading";
import Feed from "@app/components/Feed";
import LegalDoc from "@app/components/Legal/LegalDoc";
import { getSeoConfig } from "@config/seo";

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
  unstable_noStore();
  return (
    <Feed>
      <Suspense fallback={<LoadingSpinner />}>
        <LegalDoc docType="cookie-policy" />
      </Suspense>
    </Feed>
  );
}
