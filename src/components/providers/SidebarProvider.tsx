"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext({
  isCollapsed: false,
  setIsCollapsed: (val: boolean) => {},
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsedState] = useState(false);

  useEffect(() => {
    // Read persisted state on mount to prevent SSR mismatch on page load
    const saved = localStorage.getItem("amk_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsedState(saved === "true");
    }
  }, []);

  const setIsCollapsed = (val: boolean) => {
    setIsCollapsedState(val);
    localStorage.setItem("amk_sidebar_collapsed", String(val));
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
