import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import LoadingSpinner from "@app/loading";
import Feed from "@app/components/Feed";
import Contacts from "@app/components/Contacts/Contacts";

export default function TermsPage() {
  unstable_noStore();
  return (
    <Feed>
      <Suspense fallback={<LoadingSpinner />}>
        {" "}
        <Contacts />
      </Suspense>
    </Feed>
  );
}
