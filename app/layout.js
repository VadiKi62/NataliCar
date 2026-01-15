import "@styles/globals.css";
import "antd/dist/reset.css";
import Providers from "./providers";
import { Suspense } from "react";
import LoaderWrapper from "./components/Loader/LoaderWrapper";
import { getSeoConfig } from "@config/seo";

// Use fallback data for global layout metadata (layout loads before pages)
const seoConfig = getSeoConfig();

export const metadata = {
  metadataBase: new URL(seoConfig.baseUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  keywords: [
    "car rental Halkidiki",
    "car hire Halkidiki",
    "rent a car Greece",
    "car rental Nea Kallikratia",
    "Natali Cars",
  ],
  authors: [{ name: seoConfig.siteName }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,
  openGraph: {
    type: "website",
    locale: seoConfig.defaultLocale,
    url: seoConfig.baseUrl,
    siteName: seoConfig.siteName,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [
      {
        url: `${seoConfig.baseUrl}/favicon.png`,
        width: 1200,
        height: 630,
        alt: seoConfig.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [`${seoConfig.baseUrl}/favicon.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification if available
    // google: "your-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" translate="no">
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="prefers-color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* <meta name="color-scheme" content="light" /> */}
        <meta name="color-scheme" content="only light" />
      </head>
      <body>
        <Providers>
          <LoaderWrapper>{children}</LoaderWrapper>
        </Providers>
      </body>
    </html>
  );
}
