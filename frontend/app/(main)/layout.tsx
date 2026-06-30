"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  FiHelpCircle
} from "react-icons/fi";

const navItems = [
  { href: "/dashboard", icon: FiGrid, label: "Dashboard" },
  { href: "/patient", icon: FiUsers, label: "Pasien" },
  { href: "/pemeriksaan", icon: FiClipboard, label: "Pemeriksaan" },
  { href: "/jadwal", icon: FiCalendar, label: "Jadwal" },
  { href: "/laporan", icon: FiBarChart2, label: "Laporan" },
  { href: "/pengaturan", icon: FiSettings, label: "Pengaturan" },
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

    const name =
      payload.email ??
      payload.sub ??
      payload.username ??
      "Pengguna";

    const role =
      payload.role ??
      "Kader Posyandu";

    return {
      name,
      role,
      initials: getInitials(name),
    };
  } catch {
    return {
      name: "Pengguna",
      role: "Kader Posyandu",
      initials: "KP",
    };
  }
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

    const isPatient =
    pathname === "/patient" ||
    pathname.startsWith("/patient/");

  const [user, setUser] = useState<UserInfo>({
    name: "Pengguna",
    role: "Kader Posyandu",
    initials: "KP",
  });

  useEffect(() => {
    setUser(getUserFromToken());
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed h-screen w-60 border-r bg-white px-5 py-6">
        {/* Logo */}
        <div className="pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <Image
                src="/IconSipanduPutih.png"
                alt="Icon"
                width={24}
                height={24}
                unoptimized
              />
            </div>

            <div>
              <p className="text-lg font-bold text-blue-600">
                SIPANDU
              </p>

              <p className="text-xs text-gray-400">
                Sistem Informasi Posyandu
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive =
              pathname === href ||
              pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon
                  className={`h-4 w-4
                  ${
                    isActive
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-blue-500"
                  }`}
                />

                {label}

                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User bawah */}
        <div className="absolute bottom-6 left-5 right-5 border-t pt-4">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              {user.initials}
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user.name}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user.role}
              </p>
            </div>

            <FiUser className="text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-60 flex-1">
        {/* HEADER DASHBOARD */}
{isDashboard && (
  <header className="flex h-20 items-center justify-between border-b bg-white px-8">
    <div className="relative w-[550px]">
      <FiSearch
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        placeholder="Cari data pasien atau jadwal..."
        className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500"
      />
    </div>

    <div className="flex items-center gap-5">
      <FiBell
        size={20}
        className="text-gray-500"
      />

      <div className="h-6 w-px bg-gray-300" />

      <span className="text-gray-700">
        Posyandu Kliningan 04
      </span>

      <FiUser
        size={20}
        className="text-gray-500"
      />
    </div>
  </header>
)}

{/* HEADER PATIENT */}
{isPatient && (
  <header className="flex h-20 items-center justify-between border-b bg-white px-8">
    <h1 className="text-3xl font-bold text-blue-600">
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

        {/* Page */}
        <main className="min-h-screen bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}