"use client";

import React, { createContext, useContext } from "react";

const NavLocationsContext = createContext({
  hubLinks: [],
  navLocationsDescription: "",
});

export function useNavLocations() {
  return useContext(NavLocationsContext);
}

export function NavLocationsProvider({ hubLinks = [], navLocationsDescription = "", children }) {
  const value = React.useMemo(
    () => ({ hubLinks, navLocationsDescription }),
    [hubLinks, navLocationsDescription]
  );
  return (
    <NavLocationsContext.Provider value={value}>
      {children}
    </NavLocationsContext.Provider>
  );
}
