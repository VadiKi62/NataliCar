"use client";

/**
 * Analytics Component
 * 
 * GDPR-compliant analytics wrapper:
 * - Only initializes if cookie consent === "accepted"
 * - No scripts, requests, or cookies before consent
 * - Lazy loads analytics script AFTER accept
 * - No duplicate initialization on re-renders
 * 
 * ⚠️ This component must be placed inside CookieConsentProvider
 */

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useCookieConsent } from "@app/components/CookieBanner";

// Your Google Analytics ID (replace with actual)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Analytics() {
  const { isAccepted, isLoaded } = useCookieConsent();
  const isInitialized = useRef(false);

  // Track consent state for analytics events
  useEffect(() => {
    // Only run if consent is loaded and accepted
    if (!isLoaded || !isAccepted) {
      return;
    }

    // Prevent duplicate initialization
    if (isInitialized.current) {
      return;
    }

    // No GA ID configured - skip initialization
    if (!GA_MEASUREMENT_ID) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] No GA_MEASUREMENT_ID configured, skipping");
      }
      return;
    }

    isInitialized.current = true;

    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Consent accepted, initializing analytics");
    }
  }, [isLoaded, isAccepted]);

  // Don't render anything if:
  // - Consent is not yet loaded (still checking localStorage)
  // - User has not accepted cookies
  // - No GA ID is configured
  if (!isLoaded || !isAccepted || !GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics - loaded ONLY after consent */}
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
            });
          `,
        }}
      />
    </>
  );
}
