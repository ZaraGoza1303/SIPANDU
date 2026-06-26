"use client";

import React, { useState, useEffect } from "react";
import {FiUsers, FiActivity, FiAlertTriangle, FiCalendar, FiPlus, FiMoreVertical, FiTrendingUp, FiTrendingDown, FiChevronDown, } from "react-icons/fi";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrendItem {
    bulan: string;
    kasus: number;
}

interface DistribusiItem {
    label: string;
    pct: number;
    color: string;
}

interface JadwalItem {
    id: number;
    inisial: string;
    nama: string;
    usia: string;
    jenis: string;
    status: string;
    warna: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const stuntingTrend: TrendItem[] = [
    { bulan: "Mei", kasus: 10 },
    { bulan: "Jun", kasus: 15 },
    { bulan: "Jul", kasus: 20 },
    { bulan: "Agu", kasus: 14 },
    { bulan: "Sep", kasus: 11 },
    { bulan: "Okt", kasus: 12 },
];

const distribusiUmur: DistribusiItem[] = [
    { label: "0–6 bln",  pct: 30, color: "#3B82F6" },
    { label: "6–12 bln", pct: 25, color: "#60A5FA" },
    { label: "1–2 thn",  pct: 30, color: "#BFDBFE" },
    { label: "2–5 thn",  pct: 15, color: "#E5E7EB" },
];

const jadwalData: JadwalItem[] = [
    { id: 1, inisial: "AS", nama: "Aditya Syahputra",  usia: "14 bln", jenis: "Timbang & Imunisasi", status: "Normal",   warna: "#3B82F6" },
    { id: 2, inisial: "BK", nama: "Bunga Kirana",       usia: "6 bln",  jenis: "Rutin Bulanan",        status: "Stunting", warna: "#F97316" },
    { id: 3, inisial: "EL", nama: "Eka Larasati",       usia: "3 bln",  jenis: "Imunisasi DPT",        status: "Normal",   warna: "#10B981" },
    { id: 4, inisial: "FM", nama: "Farah Maheswari",    usia: "48 bln", jenis: "Cek Gizi Berkala",     status: "Normal",   warna: "#8B5CF6" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    icon: React.ElementType;
    iconBg: string;
    label: string;
    value: string | number;
    delta?: number;
    deltaLabel?: string;
    sub?: string;
    badge?: string;
}

function StatCard({ icon: Icon, iconBg, label, value, delta, deltaLabel, sub, badge }: StatCardProps) {
    const isPositive = (delta ?? 0) >= 0;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
                <Icon className="w-4 h-4 text-white" />
                </div>

                {delta !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                    {Math.abs(delta)}%
                </span>
                )}
                {badge && (
                <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {badge}
                </span>
                )}
            </div>

            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                {sub        && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                {deltaLabel && <p className="text-xs text-gray-400 mt-1">{deltaLabel}</p>}
            </div>
        </div>
    );
}

// ─── Donut Chart (pure SVG) ───────────────────────────────────────────────────

interface DonutChartProps {
    data: DistribusiItem[];
    total: number;
}

function DonutChart({ data, total }: DonutChartProps) {
    const r = 54;
    const cx = 70;
    const cy = 70;
    const circumference = 2 * Math.PI * r;
    let acc = 0;

    return (
        <svg width="140" height="140" viewBox="0 0 140 140">
            {data.map((d) => {
                const dash   = (d.pct / 100) * circumference;
                const gap    = circumference - dash;
                const offset = circumference - (acc / 100) * circumference;
                acc += d.pct;
                return (
                <circle
                    key={d.label}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={d.color}
                    strokeWidth="16"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
                );
            })}

            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1F2937">
                {total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </text>

            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9CA3AF">
                Balita
            </text>
        </svg>
    );
    }

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusMap: Record<string, string> = {
    Normal:   "bg-green-100 text-green-700",
    Stunting: "bg-red-100 text-red-600",
    Risiko:   "bg-yellow-100 text-yellow-700",
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusMap[status] ?? "bg-gray-100 text-gray-600"}`}>
        {status}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalPasien: 0,
        pemeriksaanBulan: 0,
        kasusStunting: 0,
        jadwalHariIni: 0,
    });

    const [trendFilter] = useState("6 Bulan Terakhir");
    const trendData: TrendItem[] = stuntingTrend;

    useEffect(() => {
        const targets = { totalPasien: 1240, pemeriksaanBulan: 85, kasusStunting: 12, jadwalHariIni: 8 };
        const steps = 40;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            const ease = 1 - Math.pow(1 - step / steps, 3);

            setStats({
                totalPasien:       Math.round(targets.totalPasien       * ease),
                pemeriksaanBulan:  Math.round(targets.pemeriksaanBulan  * ease),
                kasusStunting:     Math.round(targets.kasusStunting     * ease),
                jadwalHariIni:     Math.round(targets.jadwalHariIni     * ease),
            });

            if (step >= steps) clearInterval(timer);
        }, 900 / steps);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Ringkasan</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Selamat datang kembali, berikut statistik kesehatan terkini.
                    </p>
                </div>

                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <FiPlus className="w-4 h-4" /> Tambah Pemeriksaan
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FiUsers}         iconBg="#3B82F6" label="Total Pasien"            value={stats.totalPasien.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} delta={4}  />
                <StatCard icon={FiActivity}      iconBg="#8B5CF6" label="Pemeriksaan Bulan Ini"   value={stats.pemeriksaanBulan}             delta={12} deltaLabel="🎯 Target: 100 pemeriksaan" />
                <StatCard icon={FiAlertTriangle} iconBg="#EF4444" label="Kasus Stunting Aktif"    value={stats.kasusStunting}                delta={-2} badge="PERLU INTERVENSI" />
                <StatCard icon={FiCalendar}      iconBg="#10B981" label="Jadwal Hari Ini"          value={stats.jadwalHariIni}                sub="Sen, 24 Okt" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Trend Line Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-800">Tren Stunting Bulanan</h2>
                    <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                    {trendFilter}
                    <FiChevronDown className="w-3 h-3" />
                    </button>
                </div>
                
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, color: "#F9FAFB", fontSize: 12 }}
                        itemStyle={{ color: "#60A5FA" }}
                        cursor={{ stroke: "#E5E7EB" }}
                    />
                    <Line type="monotone" dataKey="kasus" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
                </div>

                {/* Donut */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="font-semibold text-gray-800 mb-4">Distribusi Kelompok Umur</h2>
                    <div className="flex flex-col items-center gap-4">
                        <DonutChart data={distribusiUmur} total={stats.totalPasien || 1240} />
                        <div className="w-full space-y-2">
                        {distribusiUmur.map((d) => (
                            <div key={d.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                                <span className="text-gray-600">{d.label}</span>
                            </div>
                            <span className="font-semibold text-gray-700">{d.pct}%</span>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Jadwal Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="font-semibold text-gray-800">Jadwal Pemeriksaan Mendatang</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Menampilkan 5 jadwal terdekat</p>
                    </div>

                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">Lihat Semua</button>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="px-5 py-3 text-left font-semibold">Nama Pasien</th>
                        <th className="px-5 py-3 text-left font-semibold">Usia</th>
                        <th className="px-5 py-3 text-left font-semibold">Jenis Pemeriksaan</th>
                        <th className="px-5 py-3 text-left font-semibold">Status Kesehatan</th>
                        <th className="px-5 py-3 text-left font-semibold">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {jadwalData.map((row) => (
                        <tr key={row.id} className="border-t border-gray-50 hover:bg-blue-50/40 transition-colors">
                            <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: row.warna }}>
                                {row.inisial}
                                </div>
                                <span className="font-medium text-gray-800">{row.nama}</span>
                            </div>
                            </td>
                            <td className="px-5 py-3 text-gray-500">{row.usia}</td>
                            <td className="px-5 py-3 text-gray-600">{row.jenis}</td>
                            <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                            <td className="px-5 py-3">
                            <button className="text-gray-400 hover:text-gray-600"><FiMoreVertical className="w-4 h-4" /></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}