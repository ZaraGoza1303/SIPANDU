"use client";

import React, { useEffect, useRef, useState } from "react";
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
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        setShowLogoutCard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutCard(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-screen flex-col
          border-r border-gray-100 bg-white
          transition-all duration-300
          ${isCollapsed ? "w-[88px]" : "w-[260px]"}
        `}
      >
        {/* ================= HEADER ================= */}
        <div className={`${isCollapsed ? "px-2" : "px-4"} pt-6`}>
          <div
            className={`
              flex items-start flex-nowrap w-full
              ${isCollapsed ? "justify-center" : "justify-between gap-1"}
            `}
          >
            <Link
              href="/dashboard"
              className={`
                flex items-center gap-2 min-w-0 flex-1
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              {/* Logo dengan Container Kotak (Glow lebih menonjol di bawah) */}
              <div
                className="
                  flex h-13 w-13 shrink-0 items-center justify-center
                "
              >
                <Image
                  src="/pandulog.png"
                  alt="Logo SIPANDU"
                  width={45}
                  height={45}
                  className="object-contain scale-[1.3] transition-transform hover:scale-[1.4]"
                />
              </div>

              {/* Brand */}
              {!isCollapsed && (
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-[20px] font-bold leading-none tracking-tight text-blue-700">
                    SIPANDU
                  </p>
                  <p className="mt-1.5 text-[12px] font-medium text-gray-400 whitespace-nowrap leading-none">
                    Sistem Informasi Posyandu
                  </p>
                </div>
              )}
            </Link>

            {/* Collapse Button (Sejajar dengan teks SIPANDU) */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="
                  flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-lg
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-600
                  mt-0.5
                "
                title="Ciutkan Sidebar"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <polyline points="16 15 13 12 16 9" />
                </svg>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="mt-5 border-b border-gray-100" />
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2.5">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  className={`
                    group relative flex w-full items-center
                    rounded-xl
                    transition-all duration-200
                    ${
                      isCollapsed
                        ? "justify-center px-3 py-3.5"
                        : "gap-4 px-4 py-3.5"
                    }
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[22px] w-[22px] shrink-0
                      ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-blue-600"
                      }
                    `}
                    strokeWidth={2}
                  />

                  {!isCollapsed && (
                    <>
                      <span className="truncate text-[15px] font-medium flex-1">
                        {label}
                      </span>

                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ================= PROFILE ================= */}
        <div
          ref={cardRef}
          className="relative border-t border-gray-100 px-4 py-5"
        >
          {/* Logout Card */}
          {showLogoutCard && (
            <div
              className={`
                absolute z-50
                ${
                  isCollapsed
                    ? "bottom-2 left-[88px] ml-2 w-52"
                    : "bottom-[88px] left-4 right-4"
                }
                rounded-2xl
                border border-red-100
                bg-red-50
                p-2
                shadow-xl
              `}
            >
              {!isCollapsed && (
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {user.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {user.role}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex w-full items-center gap-3
                  rounded-xl
                  px-3 py-2.5
                  text-left
                  text-sm font-semibold
                  text-red-600
                  transition
                  hover:bg-red-100
                "
              >
                <FiLogOut size={18} />

                <span>{isCollapsed ? "Logout" : "Keluar Aplikasi"}</span>
              </button>

              {!isCollapsed && (
                <p className="px-3 pb-2 text-[11px] text-red-400">
                  Kembali ke halaman login.
                </p>
              )}
            </div>
          )}

          {/* Profile Button */}
          <button
            type="button"
            onClick={() => setShowLogoutCard((prev) => !prev)}
            title="Menu Profil"
            className={`
              flex w-full items-center
              rounded-2xl
              border border-transparent
              p-2.5
              text-left
              transition
              hover:border-gray-100
              hover:bg-gray-50
              ${isCollapsed ? "justify-center" : "gap-3"}
            `}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
              {user.initials}
            </div>

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-gray-400">
                    {user.role}
                  </p>
                </div>

                <FiChevronUp
                  size={18}
                  className={`
                    shrink-0
                    text-gray-400
                    transition-transform duration-200
                    ${showLogoutCard ? "rotate-180" : ""}
                  `}
                />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <div
        className={`
          min-h-screen
          transition-all duration-300
          ${isCollapsed ? "ml-[88px]" : "ml-[260px]"}
        `}
      >
        <main className="min-h-screen bg-gray-50 p-7 md:p-8">
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

      {/* ================= COLLAPSED OPEN BUTTON ================= */}
      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="
            fixed left-[67px] top-7 z-50
            flex h-8 w-8
            items-center justify-center
            rounded-lg
            bg-white
            text-gray-400
            shadow-sm
            ring-1 ring-gray-100
            transition
            hover:bg-gray-50
            hover:text-gray-600
          "
          title="Buka Sidebar"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <polyline points="8 9 11 12 8 15" />
          </svg>
        </button>
      )}
    </div>
  );
}