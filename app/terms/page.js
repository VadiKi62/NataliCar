import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import LoadingSpinner from "@app/loading";
import Feed from "@app/components/Feed";
import Terms from "@app/components/Terms/Terms";

export default function TermsPage() {
  unstable_noStore();
  return (
    <Feed>
      <Suspense fallback={<LoadingSpinner />}>
        {" "}
        <Terms />
      </Suspense>
    </Feed>
  );
}
