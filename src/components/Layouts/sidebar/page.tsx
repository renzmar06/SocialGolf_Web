"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { Home, FileText, ChevronDown } from "lucide-react";
import logo from "@/assets/logos/main.svg";
import darkLogo from "@/assets/logos/dark.svg";

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

// Context
const SidebarContext = createContext<{ isOpen: boolean } | null>(null);
const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebarContext must be used within SidebarProvider");
  return context;
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen] = useState(true);
  return (
    <SidebarContext.Provider value={{ isOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Reusable Menu Item Link
function MenuLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3.5 py-2 font-medium transition-all duration-200",
        isActive
          ? "bg-[rgba(87,80,241,0.07)] text-primary dark:bg-white/10 dark:text-white"
          : "text-dark-4 hover:bg-gray-100 dark:text-dark-6 dark:hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}

// Dropdown Menu Item
function DropdownMenu({ title, icon: Icon, isOpen, onToggle, children, isAnyActive }: any) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3.5 py-2 font-medium transition-all duration-200",
          isAnyActive
            ? "bg-[rgba(87,80,241,0.07)]  dark:bg-white/10 dark:text-white"
            : "text-dark-4 hover:bg-gray-100 dark:text-dark-6 dark:hover:bg-white/5"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="size-6 shrink-0" />
          <span>{title}</span>
        </div>
        <ChevronDown
          className={cn("size-5 transition-transform duration-300", isOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown Items */}
      <div
        className={cn(
          "mt-0 space-y-1 overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-6">{children}</div>
      </div>
    </div>
  );
}

// Main Sidebar Component
export function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebarContext();
  const [pagesOpen, setPagesOpen] = useState(true); // Change to false if you want collapsed by default

  const isPageActive = pathname === "/" || pathname === "/blog";

  return (
    <aside
      className={cn(
        "max-w-[250px] border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark",
        isOpen ? "w-full" : "w-0",
        "overflow-hidden transition-all duration-200"
      )}
    >
      <div className="flex h-screen flex-col">
        {/* Logo */}
        <div className="px-6 py-8">
          <Link href="/">
            <div className="relative h-8 w-40">
              <Image src={logo} alt="Logo" fill className="dark:hidden" />
              <Image src={darkLogo} alt="Logo" fill className="hidden dark:block" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4">
          {/* Dashboard */}
          <MenuLink href="/" isActive={pathname === "/"}>
            <Home className="size-6" />
            <span>Dashboard</span>
          </MenuLink>

          {/* Pages Dropdown */}
          <DropdownMenu
            title="Pages"
            icon={FileText}
            isOpen={pagesOpen}
            onToggle={() => setPagesOpen(!pagesOpen)}
            isAnyActive={isPageActive}
          >
            <MenuLink href="/" isActive={pathname === "/homepage"}>
              <span className="text-sm">Home Page</span>
            </MenuLink>
            <MenuLink href="/blog" isActive={pathname === "/blog"}>
              <span className="text-sm">Blog Page</span>
            </MenuLink>
          </DropdownMenu>
          
        </nav>
      </div>
    </aside>
  );
}