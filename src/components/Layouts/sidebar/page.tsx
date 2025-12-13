"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { Home, FileText, ChevronDown, Calendar } from "lucide-react";

import logo from "@/assets/logos/Social-golf-logo.png";
import darkLogo from "@/assets/logos/Social-golf-logo.png";

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

// Context
const SidebarContext = createContext<{ isOpen: boolean; toggleSidebar: () => void } | null>(null);
const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebarContext must be used within SidebarProvider");
  return context;
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(prev => !prev);
  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export { useSidebarContext };

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
          <Icon className="size-5 shrink-0" />
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
  const [pagesOpen, setPagesOpen] = useState(true);

  const isPageActive = pathname === "/" || pathname === "/blog";

  return (
    <aside
      className={cn(
        "border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark transition-all duration-300",
        isOpen ? "w-[250px]" : "w-0",
        "overflow-hidden"
      )}
    >
      <div className="flex h-screen flex-col font-midium text-sm">
        {/* Logo */}
        <div className="px-6 py-2">
          <Link href="/dashboard">
            <div className="">
              <Image src={logo} alt="Logo"  className="dark:hidden w-30 h-auto" />
              <Image src={darkLogo} alt="Logo" className="hidden dark:block" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 mt-4">
          {/* Dashboard */}
          <MenuLink href="/dashboard" isActive={pathname === "/dashboard"}>
            <Home className="size-5" />
            <span>Dashboard</span>
          </MenuLink>

          {/* Pages Dropdown */}
          {/* <DropdownMenu
            title="Pages"
            icon={FileText}
            isOpen={pagesOpen}
            onToggle={() => setPagesOpen(!pagesOpen)}
            isAnyActive={isPageActive}
          >
            <MenuLink href="/" isActive={pathname === "/"}>
              <span className="text-sm">Home Page</span>
            </MenuLink>
            <MenuLink href="/blog" isActive={pathname === "/blog"}>
              <span className="text-sm">Blog Page</span>
            </MenuLink>
          </DropdownMenu> */}
          <MenuLink href="/events" isActive={pathname === "/events"}>
            <Calendar className="size-5" />
            <span>Events</span>
          </MenuLink>
          <MenuLink href="/bookings" isActive={pathname === "/bookings"}>
            <Calendar className="size-5" />
            <span>Bookings</span>
          </MenuLink>
          <MenuLink href="/promotions" isActive={pathname === "/promotions"}>
            <Calendar className="size-5" />
            <span>Promotions</span>
          </MenuLink>
          <MenuLink href="/social-posts" isActive={pathname === "/social-posts"}>
            <Calendar className="size-5" />
            <span>Social Post</span>
          </MenuLink>
        </nav>
      </div>
    </aside>
  );
}