"use client";

import React, { useEffect, useState } from "react"; 
import Link from "next/link";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { FiGrid, FiUsers, FiClipboard, FiCalendar, FiBarChart2, FiSettings, FiUser, FiBell, FiSearch } from "react-icons/fi";

const navItems = [
    { href: "/dashboard",   icon: FiGrid,       label: "Dashboard"   },
    { href: "/pasien",      icon: FiUsers,      label: "Pasien"      },
    { href: "/pemeriksaan", icon: FiClipboard,  label: "Pemeriksaan" },
    { href: "/jadwal",      icon: FiCalendar,   label: "Jadwal"      },
    { href: "/laporan",     icon: FiBarChart2,  label: "Laporan"     },
    { href: "/pengaturan",  icon: FiSettings,   label: "Pengaturan"  },
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
        // Sesuaikan field berikut dengan claim JWT dari BE teman kamu
        // Cek dulu di Console: JSON.parse(atob(localStorage.getItem('token').split('.')[1]))
        const name = payload.email ?? payload.sub ?? payload.username ?? "Pengguna";
        const role = payload.role ?? "Kader Posyandu";
        return { name, role, initials: getInitials(name) };
    } catch {
        return { name: "Pengguna", role: "Kader Posyandu", initials: "KP" };
    }
}

export default function DashboardPage( {
    children, }:{
        children: React.ReactNode;  
    }) {
        const pathname = usePathname();
        const [user, setUser] = useState<UserInfo>({
        name: "Pengguna",
        role: "Kader Posyandu",
        initials: "KP",
    });
        return (
            /*--navigasi di kiri*/
            <div className= "flex min-h-screen">
                <aside className= "h-full w-60 bg-white p-5 fixed  border-b">
                    <div className="px-1 py-2 pb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                        <Image 
                                        src="/images/IconSipanduPutih.png" // Langsung mulai dari /images (Next.js tahu ini di dalam folder public)
                                        alt="Icon Sipandu"
                                        width={50} // Karena menggunakan string, wajib tentukan width & height
                                        height={50}
                                        unoptimized 
                                    />
                                </span>
                            </div>
                            <div>
                            <p className="text-lg font-bold text-blue-500 leading-tight">SIPANDU</p>
                            <p className="text-[10px] text-gray-400 leading-tight">Sistem Informasi Posyandu</p>
                            </div>
                        </div>
                    </div>

                 {/* Nav */}
                <nav className="space-y-4">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                                    ${isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                            >
                                <Icon
                                    className={`w-4 h-4 transition-colors
                                        ${isActive
                                            ? "text-blue-500"
                                            : "text-gray-400 group-hover:text-blue-500"
                                        }`}
                                />
                                {label}
                                {/* Indikator aktif di kanan */}
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                    <div className="px-3 py-3 border-t border-gray-100 mt-78">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.initials}
                            </div>

                            <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.role}</p>
                            </div>
                
                            {/* Icon */}
                            <FiUser className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                        </div>
                    </div>
                </aside>

                {/* Area kanan */}
                <div className="ml-60 flex-1">
                    <header className="sticky top-0 z-50 flex items-center justify-between bg-white border-b px-5 py-3">
                        <div className="relative flex-1 max-w-3xl">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Cari data pasien atau jadwal..."
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 text-gray-600"
                            />
                        </div>

                        <div className="flex items-center gap-4 ml-5">
                            <FiBell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-800" />

                            <div className="flex items-center gap-2 border-l pl-4 text-sm text-gray-600 cursor-pointer">
                                <span className="hover:text-gray-800">Posyandu Kliningan 04</span>
                                <FiUser className="w-4 h-4" />
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="bg-gray-50 p-5 min-h-screen">
                    {children}
                    </main>
                </div>
            </div>
    )}
