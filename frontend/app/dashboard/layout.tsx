import React from "react"; 
import Link from "next/link";
import { FiGrid, FiUsers, FiClipboard, FiCalendar, FiBarChart2, FiSettings, FiUser, FiBell, FiSearch } from "react-icons/fi";

const navItems = [
    { href: "/dashboard",   icon: FiGrid,       label: "Dashboard"   },
    { href: "/pasien",      icon: FiUsers,      label: "Pasien"      },
    { href: "/pemeriksaan", icon: FiClipboard,  label: "Pemeriksaan" },
    { href: "/jadwal",      icon: FiCalendar,   label: "Jadwal"      },
    { href: "/laporan",     icon: FiBarChart2,  label: "Laporan"     },
    { href: "/pengaturan",  icon: FiSettings,   label: "Pengaturan"  },
];

//nnti ganti dengan data dari session/auth (NextAuth, Clerk, dll.)
const currentUser = {
    name: "Dr. Siti Aminah",
    role: "Administrator",
    initials: "SA",
};

export default function DashboardPage( {
    children, }:{
        children: React.ReactNode;  
    }) {
        return (
            /*--navigasi di kiri*/
            <div className= "flex min-h-screen">
                <aside className= "h-full w-60 bg-white p-5 fixed  border-b">
                    <div className="px-1 py-2 pb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold"></span>
                            </div>
                            <div>
                            <p className="text-lg font-bold text-blue-500 leading-tight">SIPANDU</p>
                            <p className="text-[10px] text-gray-400 leading-tight">Sistem Informasi Posyandu</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-4 font-bold text-gray-600">
                        {navItems.map(({ href, icon: Icon, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                            >
                                <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <div className="px-3 py-3 border-t border-gray-100 mt-78">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {currentUser.initials}
                            </div>

                            <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</p>
                            <p className="text-xs text-gray-400 truncate">{currentUser.role}</p>
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
