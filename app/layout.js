import { Inter } from "next/font/google";
import "@styles/globals.css";

export const metadata = {
  title: "Car Rent",
  description: "Generated by NataliaKi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" translate="no">
      <body style={{ position: "relative", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
