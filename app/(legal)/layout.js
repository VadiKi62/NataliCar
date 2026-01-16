/**
 * Minimal Layout for Legal Pages
 * 
 * This layout is used for static legal pages to reduce JS bundle size:
 * - /privacy-policy
 * - /terms-of-service
 * - /cookie-policy
 * - /rental-terms
 * 
 * ✅ Benefits:
 * - NO heavy MUI providers
 * - NO analytics
 * - NO heavy client components
 * - Minimal JavaScript footprint
 * - SEO-friendly (SSR)
 * - Same URL structure maintained
 * 
 * ⚠️ Note: This layout uses minimal CSS-only styling.
 * For MUI components, use the main layout.
 */

import "@styles/globals.css";
import { getSeoConfig } from "@config/seo";

const seoConfig = getSeoConfig();

export const metadata = {
  metadataBase: new URL(seoConfig.baseUrl),
  robots: {
    index: true,
    follow: true,
  },
};

// Minimal header component (no client-side JS)
function MinimalHeader() {
  return (
    <header
      style={{
        backgroundColor: "#008989",
        padding: "16px 24px",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href="/"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          NATALI CARS
        </a>
        <div style={{ display: "flex", gap: "24px" }}>
          <a
            href="/"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Home
          </a>
          <a
            href="/contacts"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Contacts
          </a>
        </div>
      </nav>
    </header>
  );
}

// Minimal footer component (no client-side JS)
function MinimalFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#008989",
        color: "#ffffff",
        padding: "32px 24px",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 16px 0", fontSize: "14px" }}>
          © {new Date().getFullYear()} Natali Cars. All rights reserved.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
          <a
            href="/privacy-policy"
            style={{ color: "#b0bec5", textDecoration: "none", fontSize: "12px" }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms-of-service"
            style={{ color: "#b0bec5", textDecoration: "none", fontSize: "12px" }}
          >
            Terms of Service
          </a>
          <a
            href="/cookie-policy"
            style={{ color: "#b0bec5", textDecoration: "none", fontSize: "12px" }}
          >
            Cookie Policy
          </a>
          <a
            href="/rental-terms"
            style={{ color: "#b0bec5", textDecoration: "none", fontSize: "12px" }}
          >
            Rental Terms
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LegalLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light only" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1a237e",
        }}
      >
        <MinimalHeader />
        <main
          style={{
            flex: 1,
            maxWidth: "800px",
            margin: "0 auto",
            padding: "48px 24px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>
        <MinimalFooter />
      </body>
    </html>
  );
}
