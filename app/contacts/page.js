import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import LoadingSpinner from "@app/loading";
import Feed from "@app/components/Feed";
import Contacts from "@app/components/Contacts/Contacts";
import { getSeoConfig } from "@config/seo";

const seoConfig = getSeoConfig();

export const metadata = {
  title: "Contact Us - Car Rental in Halkidiki",
  description:
    "Contact Natali Cars for car rental inquiries in Halkidiki, Greece. Get in touch for bookings, questions, or support. We're here to help you find the perfect car for your trip.",
  alternates: {
    canonical: `${seoConfig.baseUrl}/contacts`,
  },
  openGraph: {
    title: "Contact Us - Car Rental in Halkidiki | Natali Cars",
    description:
      "Contact Natali Cars for car rental inquiries in Halkidiki, Greece. Get in touch for bookings, questions, or support.",
    url: `${seoConfig.baseUrl}/contacts`,
  },
};

export default function ContactsPage() {
  unstable_noStore();
  return (
    <Feed>
      <Suspense fallback={<LoadingSpinner />}>
        <Contacts />
      </Suspense>
    </Feed>
  );
}
