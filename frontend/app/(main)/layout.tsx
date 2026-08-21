"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

import {
  FiGrid,
  FiUsers,
  FiClipboard,
  FiCalendar,
  FiBarChart2,
  FiLogOut,
  FiChevronUp,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

const navItems = [
  { href: "/dashboard", icon: FiGrid, label: "Dashboard" },
  { href: "/patient", icon: FiUsers, label: "Pasien" },
  { href: "/jadwal", icon: FiCalendar, label: "Jadwal" },
  { href: "/pemeriksaan", icon: FiClipboard, label: "Pemeriksaan" },
  { href: "/laporan", icon: FiBarChart2, label: "Laporan" },
];

interface UserInfo {
  role: string;
  posyandu: string;
  initials: string;
}

function getUserFromToken(): UserInfo | null {
  const defaultUser: UserInfo = {
    role: "Kader",
    posyandu: "Posyandu Kliningan 04",
    initials: "KA",
  };

  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");

    const payload = JSON.parse(atob(base64));

    // Cek expired token
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem("token");
      return null;
    }

    const role = payload.role
      ? payload.role.charAt(0).toUpperCase() + payload.role.slice(1)
      : defaultUser.role;

    return {
      role,
      posyandu: "Posyandu Kliningan 04",
      initials: role.slice(0, 2).toUpperCase(),
    };
  } catch (error) {
    console.error("Gagal membaca JWT:", error);
    return null;
  }
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserInfo>({
    role: "Kader",
    posyandu: "Posyandu Kliningan 04",
    initials: "KA",
  });

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutCard, setShowLogoutCard] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // =========================================================
  // AUTH + ROLE CHECK
  // =========================================================
  useEffect(() => {
    let mounted = true;

    const checkAuthentication = () => {
      const currentUser = getUserFromToken();

      if (!currentUser) {
        const currentPath = pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (!mounted) return;

      setUser(currentUser);
      setIsAuthChecking(false);

      if (currentUser.role.toLowerCase() === "kader" && pathname === "/dashboard") {
        router.replace("/patient");
        return;
      }
    };

    checkAuthentication();

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowLogoutCard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      mounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname, router]);

  // =========================================================
  // MOBILE: Tutup menu saat pindah halaman & Kunci Scroll
  // =========================================================
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowLogoutCard(false);
  }, [pathname]);

  useEffect(() => {
    // Mencegah body scroll saat sidebar mobile terbuka
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        skipAuthRedirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setShowLogoutCard(false);
      setIsMobileMenuOpen(false);
      router.replace("/login");
    }
  };

  const filteredNavItems = navItems.filter((item) => {
    if (user.role.toLowerCase() === "kader") {
      return item.label !== "Dashboard" && item.label !== "Laporan";
    }
    return true;
  });

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-medium text-gray-500">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  const isKader = user.role.toLowerCase() === "kader";
  const logoHref = isKader ? "/patient" : "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================================
          MOBILE TOP BAR
      ====================================================== */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100"
            title="Buka Menu"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link href={logoHref} className="flex items-center gap-2">
            <Image
              src="/pandulog.png"
              alt="Logo SIPANDU"
              width={36}
              height={36}
              className="object-contain"
            />
            <div>
              <p className="text-[18px] font-bold leading-none text-blue-700">SIPANDU</p>
              <p className="mt-1 text-[9px] leading-none text-gray-400">Sistem Informasi Posyandu</p>
            </div>
          </Link>
        </div>

        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
          {user.role}
        </div>
      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-[100dvh] /* <--- UBAH h-screen MENJADI h-[100dvh] */
          flex-col border-r border-gray-100
          bg-white shadow-sm
          transition-all duration-300
          w-[260px] 
          ${isCollapsed ? "md:w-[88px]" : "md:w-[260px]"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* ================= HEADER ================= */}
        <div className={`pt-6 px-4 ${isCollapsed ? "md:px-2" : ""}`}>
          <div className={`flex w-full flex-nowrap items-start gap-1 ${isCollapsed ? "md:justify-center" : "md:justify-between"}`}>
            <Link
              href={logoHref}
              className={`flex min-w-0 flex-1 items-center gap-2 ${isCollapsed ? "md:justify-center" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex h-13 w-13 shrink-0 items-center justify-center">
                <Image
                  src="/pandulog.png"
                  alt="Logo SIPANDU"
                  width={45}
                  height={45}
                  className="scale-[1.3] object-contain transition-transform hover:scale-[1.4]"
                />
              </div>

              {/* Teks Logo: Disembunyikan hanya di Desktop ketika collapsed */}
              <div className={`min-w-0 flex-1 pt-0.5 ${isCollapsed ? "md:hidden" : ""}`}>
                <p className="truncate text-[20px] font-bold leading-none tracking-tight text-blue-700">
                  SIPANDU
                </p>
                <p className="mt-1.5 whitespace-nowrap text-[12px] font-medium leading-none text-gray-400">
                  Sistem Informasi Posyandu
                </p>
              </div>
            </Link>

            {/* Tombol Collapse: Sembunyikan di Mobile, tampilkan di Desktop jika belum collapsed */}
            <button
              type="button"
              onClick={() => {
                setIsCollapsed(true);
                setIsMobileMenuOpen(false);
              }}
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 hidden md:flex ${isCollapsed ? "md:hidden" : ""}`}
              title="Ciutkan Sidebar"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <polyline points="16 15 13 12 16 9" />
              </svg>
            </button>
          </div>
          <div className="mt-5 border-b border-gray-100" />
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2.5">
            {filteredNavItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group relative flex w-full items-center rounded-xl transition-all duration-200
                    gap-4 px-4 py-3.5
                    ${isCollapsed ? "md:justify-center md:px-3 md:gap-0" : ""}
                    ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}
                  `}
                >
                  <Icon
                    className={`h-[22px] w-[22px] shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`}
                    strokeWidth={2}
                  />

                  {/* Label Menu: Sembunyikan hanya di Desktop ketika collapsed */}
                  <span className={`flex-1 truncate text-[15px] font-medium ${isCollapsed ? "md:hidden" : ""}`}>
                    {label}
                  </span>
                  
                  {isActive && (
                    <span className={`h-2 w-2 shrink-0 rounded-full bg-blue-600 ${isCollapsed ? "md:hidden" : ""}`} />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ================= PROFILE ================= */}
        <div ref={cardRef} className="relative border-t border-gray-100 px-4 py-5">
          {showLogoutCard && (
            <div
              className={`
                absolute z-50 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl
                bottom-[88px] left-4 right-4
                ${isCollapsed ? "md:bottom-2 md:left-[88px] md:ml-2 md:w-52 md:right-auto" : ""}
              `}
            >
              <div className={`mb-1 border-b border-gray-100 px-3 py-2.5 ${isCollapsed ? "md:hidden" : ""}`}>
                <p className="truncate text-sm font-semibold text-gray-800">{user.role}</p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{user.posyandu}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => {
                  setShowLogoutCard(false);
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <FiUser size={18} className="text-gray-400" />
                <span>Edit Profil</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <FiLogOut size={18} />
                <span className={`${isCollapsed ? "md:hidden" : ""}`}>Keluar Aplikasi</span>
                <span className={`hidden ${isCollapsed ? "md:block" : ""}`}>Logout</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLogoutCard((prev) => !prev)}
            title="Menu Profil"
            className={`
              flex w-full items-center rounded-2xl border border-transparent p-2.5 text-left transition hover:border-gray-100 hover:bg-gray-50
              gap-3
              ${isCollapsed ? "md:justify-center md:gap-0" : ""}
            `}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
              {user.initials}
            </div>

            <div className={`flex min-w-0 flex-1 flex-col items-start ${isCollapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-semibold leading-tight text-gray-800">{user.role}</p>
              <p className="mt-0.5 truncate text-xs leading-tight text-gray-400">{user.posyandu}</p>
            </div>

            <FiChevronUp
              size={18}
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${showLogoutCard ? "rotate-180" : ""} ${isCollapsed ? "md:hidden" : ""}`}
            />
          </button>
        </div>
      </aside>

      {/* =====================================================
          DESKTOP COLLAPSE BUTTON (Tombol Buka Sidebar)
      ====================================================== */}
      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="fixed left-[67px] top-7 z-[60] hidden h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-400 shadow-sm ring-1 ring-gray-100 transition hover:bg-gray-50 hover:text-gray-600 md:flex"
          title="Buka Sidebar"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <polyline points="8 9 11 12 8 15" />
          </svg>
        </button>
      )}

      {/* =====================================================
          CONTENT AREA
      ====================================================== */}
      <div
        className={`
          min-h-screen transition-all duration-300
          ${isCollapsed ? "md:ml-[88px]" : "md:ml-[260px]"}
        `}
      >
        <main className="min-h-screen bg-gray-50 px-4 pb-6 pt-20 sm:px-5 md:px-7 md:pt-8">
          {children}
          <Toaster position="top-right" richColors closeButton theme="light" duration={3000} />
        </main>
      </div>
    </div>
  );
}