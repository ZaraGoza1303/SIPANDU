"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
  FiSettings,
  FiUser,
  FiBell,
  FiSearch,
  FiHelpCircle,
  FiFileText,
  FiLogOut,
  FiChevronUp
} from "react-icons/fi";

// ─── Search Context ────────────────────────────────────────────────────────
interface SearchContextType {
  search: string;
  setSearch: (value: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within MainLayout");
  }
  return context;
}

// ─── Nav items ──────────────────────────────────────────────────────────────
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getUserFromToken(): UserInfo {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("no token");

    const payload = JSON.parse(atob(token.split(".")[1]));
    const name = payload.email ?? payload.sub ?? payload.username ?? "Pengguna";
    const role = payload.role ?? "Kader Posyandu";

    return { name, role, initials: getInitials(name) };
  } catch {
    return { name: "Pengguna", role: "Kader Posyandu", initials: "KP" };
  }
}

// ─── Main Export: wraps everything with the Context Provider ──────────────
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <LayoutContent>{children}</LayoutContent>
    </SearchContext.Provider>
  );
}

// ─── Layout content ────────────────────────────────────────────────────────
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { search, setSearch } = useSearch();
  const isDashboard = pathname === "/dashboard";

  const isPatient =
    pathname === "/patient" ||
    pathname.startsWith("/patient/");

  const [user, setUser] = useState<UserInfo>({
    name: "Pengguna",
    role: "Kader Posyandu",
    initials: "KP",
  });

  // State untuk mengontrol buka/tutup card menu logout
  const [showLogoutCard, setShowLogoutCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUserFromToken());

    // Event listener untuk menutup card jika diklik di luar area card/profil
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

  // Fungsi Eksekusi Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed h-screen w-60 border-r bg-white px-4 py-5 flex flex-col justify-between">
        <div>
          <div className="pb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500">
                <Image src="/IconSipanduPutih.png" alt="Icon" width={34} height={34} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-blue-600">SIPANDU</p>
                <p className="text-xs text-gray-400">Sistem Informasi Posyandu</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                  ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"}`} />
                  {label}
                  {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bagian Profil di Bawah Sidebar dengan Card Logout */}
        <div className="relative pb-2" ref={cardRef}>
          {/* Card Popover Logout */}
          {showLogoutCard && (
            <div className="absolute bottom-16 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition text-left"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Tombol Profil */}
          <button
            onClick={() => setShowLogoutCard((prev) => !prev)}
            title="Menu Profil"
            className="w-full flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50 transition text-left cursor-pointer border border-transparent hover:border-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              {user.initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="truncate text-xs text-gray-400">{user.role}</p>
            </div>
            <FiChevronUp
              className={`text-gray-400 transition-transform duration-200 ${
                showLogoutCard ? "rotate-180" : ""
              }`}
              size={16}
            />
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-60 flex-1">
        {/* HEADER DASHBOARD */}
        {isDashboard && (
          <header className="flex h-17 items-center justify-between border-b bg-white px-8">
            <div className="relative w-[550px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari data pasien atau jadwal..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-5">
              <FiBell size={20} className="text-gray-500" />
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-gray-700">Posyandu Kliningan 04</span>
              <FiUser size={20} className="text-gray-500" />
            </div>
          </header>
        )}

        {/* HEADER PATIENT */}
        {isPatient && (
          <header className="flex h-17 items-center justify-between border-b bg-white px-6">
            <h1 className="text-2xl font-bold text-blue-600">
              Posyandu Care
            </h1>

            <div className="flex items-center gap-5 text-gray-500">
              <button className="hover:text-gray-700">
                <FiBell size={20} />
              </button>

              <button className="hover:text-gray-700">
                <FiHelpCircle size={20} />
              </button>

              <div className="h-6 w-px bg-gray-300" />

              <span className="text-sm font-medium text-gray-600 capitalize">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </header>
        )}

        <main className="min-h-screen bg-gray-50 p-6">
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