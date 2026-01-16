import React from "react";
import { fetchCar } from "@utils/action";
import Link from "next/link";
// import Feed from "@app/components/Feed";
import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import Loading from "@app/loading";
import Feed from "@app/components/Feed";
import { getSeoConfig } from "@config/seo";

// export const generateMetadata = async ({ params }) => {
//   const { id } = params;

//   try {
//     const car = await fetchCar(id);
//     const carTitle = car?.model || "Car";
//     const title = `${carTitle} Rental in Halkidiki | Natali Cars`;
//     const description = `Rent ${carTitle} in Halkidiki, Greece with Natali Cars. Affordable rates, flexible pickup and return in Nea Kallikratia. Book online today.`;
//     const seoConfig = getSeoConfig();

//     return {
//       title,
//       description,
//       alternates: {
//         canonical: `${seoConfig.baseUrl}/car/${id}`,
//       },
//       openGraph: {
//         title,
//         description,
//         url: `${seoConfig.baseUrl}/car/${id}`,
//         type: "website",
//       },
//     };
//   } catch (error) {
//     const seoConfig = getSeoConfig();
//     return {
//       title: "Car Rental in Halkidiki | Natali Cars",
//       description: seoConfig.defaultDescription,
//     };
//   }
// };

async function CarPageMain({ params }) {
  // unstable_noStore();

  // const carData = await fetchCar(params.id);

  return (
    <>
      <h1>Car Page</h1>
      {/* <Suspense fallback={<Loading />}>
        <Feed car={carData} />
      </Suspense> */}
    </>
  );
}

export default CarPageMain;
