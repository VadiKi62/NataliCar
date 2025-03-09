import React from "react";
import Image from "next/image";
import Link from "next/link";

function loading() {
  return (
    <div className="loading-container">
      {" "}
      <Image
        src="/favicon.png"
        alt="bb qr code ki"
        className="spinning-icon loop-spinning"
        width={100}
        height={100}
        priority
      />
      {/* <Image
        src="/logos/5.png"
        alt="bb qr code ki"
        className="spinning-icon loop-spinning"
        width={70}
        height={70}
      />
      <Image
        src="/logos/5.png"
        alt="bb qr code ki"
        className="spinning-icon loop-spinning"
        width={70}
        height={70}
      /> */}
    </div>
  );
}

export default loading;
