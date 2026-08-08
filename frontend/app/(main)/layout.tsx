"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Toaster } from "sonner";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid,
  FiUsers,
  FiClipboard,
  FiCalendar,
  FiBarChart2,
  FiLogOut,
  FiChevronUp,
} from "react-icons/fi";

const navItems = [
  { href: "/dashboard", icon: FiGrid, label: "Dashboard" },
  { href: "/patient", icon: FiUsers, label: "Pasien" },
  { href: "/jadwal", icon: FiCalendar, label: "Jadwal" },
  { href: "/pemeriksaan", icon: FiClipboard, label: "Pemeriksaan" },
  { href: "/laporan", icon: FiBarChart2, label: "Laporan" },
];

interface UserInfo {
  name: string;
  role: string;
  initials: string;
}

function getUserFromToken(): UserInfo {
  return {
    name: "Kader Posyandu",
    role: "Posyandu Kliningan 04",
    initials: "KP",
  };
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserInfo>({
    name: "Kader Posyandu",
    role: "Posyandu Kliningan 04",
    initials: "KP",
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutCard, setShowLogoutCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUserFromToken());

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowLogoutCard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed h-screen border-r bg-white px-4 py-5 flex flex-col justify-between z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-[240px]"
        }`}
      >
        <div>
          {/* Header Sidebar */}
          <div className="pt-3 pb-6 border-b border-gray-100 flex items-center justify-between">
            <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "justify-center w-full" : ""}`}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 shadow-sm">
                <Image src="/IconSipanduPutih.png" alt="Icon" width={36} height={36} />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xl font-bold tracking-tight text-blue-600 leading-tight">SIPANDU</p>
                  <p className="text-[11px] text-gray-400">Sistem Informasi Posyandu</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer shrink-0 flex items-center justify-center"
                title="Tutup Sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <polyline points="16 15 13 12 16 9"></polyline>
                </svg>
              </button>
            )}
          </div>

          {isCollapsed && (
            <div className="pt-3 pb-2 flex justify-center border-b border-gray-100 mb-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer flex items-center justify-center"
                title="Buka Sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <polyline points="13 9 16 12 13 15"></polyline>
                </svg>
              </button>
            </div>
          )}

          {/* Navigasi Menu */}
          <nav className="space-y-2 mt-5">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <Icon className={`h-[22px] w-[22px] shrink-0 ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"}`} />
                  
                  {!isCollapsed && <span className="truncate">{label}</span>}
                  
                  {isActive && !isCollapsed && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50 shadow-md">
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bagian Profil */}
        <div className="relative pt-3 border-t border-gray-100" ref={cardRef}>
          {showLogoutCard && (
            <div className={`absolute bottom-16 ${isCollapsed ? "left-0 w-48" : "left-0 right-0"} bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150`}>
              {!isCollapsed && (
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.role}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition text-left cursor-pointer"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowLogoutCard((prev) => !prev)}
            title="Menu Profil"
            className={`w-full flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50 transition text-left cursor-pointer border border-transparent hover:border-gray-100 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white shadow-sm">
              {user.initials}
            </div>
            
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="truncate text-xs text-gray-400">{user.role}</p>
                </div>
                <FiChevronUp
                  className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                    showLogoutCard ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-[240px]"}`}>
        <main className="min-h-screen bg-gray-50 p-8">
          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="light"
            duration={3000}
          />
        </main>
      </div>
    </div>
  );
}