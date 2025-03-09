import React from "react";
import { fetchCar } from "@utils/action";
import Link from "next/link";
// import Feed from "@app/components/Feed";
import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import Loading from "@app/loading";
import Feed from "@app/components/Feed";

export const generateMetadata = async ({ params }) => {
  console.log(params);
  const { id } = params;

  const car = await fetchCar(id);
  let title = `${car.model}`;

  return {
    title: { title },
    description: `${title} for rent in Nea Kallikratia.  Natali Cars. Best Car Rent Prices. Best Services.`,
  };
};

async function CarPageMain({ params }) {
  unstable_noStore();

  const carData = await fetchCar(params.id);

  return (
    <Suspense fallback={<Loading />}>
      <Feed car={carData} />
    </Suspense>
  );
}

export default CarPageMain;
