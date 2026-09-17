"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({ children, ...props }: any) {
  const pathname = usePathname() || "";
  const isManagement = pathname.startsWith("/management") || pathname.startsWith("/login");
  
  // Force light theme on all non-management routes
  const forcedTheme = !isManagement ? "light" : undefined;

  return <NextThemesProvider {...props} forcedTheme={forcedTheme}>{children}</NextThemesProvider>;
}
