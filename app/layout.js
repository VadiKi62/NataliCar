import "@styles/globals.css";
import "antd/dist/reset.css";
import { MainContextProvider } from "./Context";
export const metadata = {
  title: "Natali Car Rent",
  description: "Generated by NataliaKi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" translate="no">
      <body
        style={{ position: "relative", minHeight: "100vh", minWidth: "100%" }}
      >
        {children}
      </body>
    </html>
  );
}
