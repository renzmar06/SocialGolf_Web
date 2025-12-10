"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar";
import { StoreProvider } from "@/store/StoreProvider";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/useAuth";

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth(); // Initialize auth state
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" attribute="class">
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
