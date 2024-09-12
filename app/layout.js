import "@styles/globals.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export const metadata = {
  title: "Car Rent",
  description: "Generated by NataliaKi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" translate="no">
      <body
        style={{
          width: "100vw",
          // height: "100vh",
          // padding: "2rem",
          // display: "flex",
          // alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {children}
      </body>
    </html>
  );
}
