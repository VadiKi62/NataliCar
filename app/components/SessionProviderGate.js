"use client";

import { useState, useEffect } from "react";

/**
 * Wraps children in next-auth's SessionProvider only after the component has
 * mounted on the client. During SSG/prerender (and any server render) we render
 * children without loading next-auth, avoiding:
 *   TypeError: Cannot destructure property 'auth' of 'e' as it is undefined.
 * Consumers of useSession() (Navbar, admin) guard with value?.data (see Navbar).
 */
export default function SessionProviderGate({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isServer = typeof window === "undefined";
  if (isServer || !mounted) {
    return children;
  }

  const { SessionProvider } = require("next-auth/react");
  return <SessionProvider>{children}</SessionProvider>;
}
