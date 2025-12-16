// components/Header.tsx
"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Mail,
  MoonIcon,
  Menu,
  SunIcon,
  User,
  Settings,
  MessageSquare,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSidebarContext } from "@/components/Layouts/sidebar/page";
import { useAuth } from "@/hooks/useAuth";

import avatar from "../../../../public/images/user/user-02.png";

export default function Header() {
  const THEMES = [
    {
      name: "light",
      Icon: SunIcon,
    },
    {
      name: "dark",
      Icon: MoonIcon,
    },
  ];
  const [profileOpen, setProfileOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { toggleSidebar } = useSidebarContext();
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.name || payload.email || payload.businessName || "User");
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="box-shadow-md border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          {/* Sidebar Toggle */}
          <button 
            onClick={toggleSidebar}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="group rounded-full bg-gray-3 p-[5px] text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current"
          >
            <span className="sr-only">
              Switch to {theme === "light" ? "dark" : "light"} mode
            </span>

            <span aria-hidden className="relative flex gap-2.5">
              {/* Indicator */}
              <span className="absolute size-[30px] rounded-full border border-gray-200 bg-white transition-all dark:translate-x-[38px] dark:border-none dark:bg-dark-2 dark:group-hover:bg-dark-3" />

              {THEMES.map(({ name, Icon }) => (
                <span
                  key={name}
                  className={cn(
                    "relative grid size-[30px] place-items-center rounded-full",
                    name === "dark" && "dark:text-white",
                  )}
                >
                  <Icon />
                </span>
              ))}
            </span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-[#0db2de] to-[#005bea] px-4 py-2 text-white shadow-lg transition-all hover:shadow-xl"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white">
                <Image
                  src={avatar}
                  alt="Petey Cruiser"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">{userName}</div>
                <div className="text-xs opacity-90">Premium Member</div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute z-50 right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full">
                        <Image
                          src={avatar}
                          alt="Petey Cruiser"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {userName}
                        </h4>
                        <p className="text-sm text-gray-500">Premium Member</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800">
                    
                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Link>
                    
                    
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800">
                    <button 
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
