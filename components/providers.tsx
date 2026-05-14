"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={60 * 5} refetchOnWindowFocus>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster richColors closeButton position="top-center" />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
