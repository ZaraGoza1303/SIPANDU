"use client";

import React, { useState, useEffect } from "react";
import { FaStethoscope } from "react-icons/fa6";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  FiUsers,
  FiAlertTriangle,
  FiCalendar,
  FiChevronDown,
  FiLoader,
  FiPlus,
  FiSearch,
  FiEye,
  FiHome,
} from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useRouter } from "next/navigation";

// ─── Types & Constants ────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

interface TrendStuntingItem { month: string; total: number; stunting: number; percentage: number; }
interface DistribusiItem { label: string; pct: number; color: string; }
interface DashboardStats {
  totalPatients: number;
  totalExaminations: number;
  stuntingCount: number;
  normalCount: number;
  ageGroupDistribution: { range: string; count: number }[];
}
interface Patient {
  id: string;
  nik?: string;
  name: string;
  birth_date: string;
  gender: string;
  mother_name?: string;
  phone_parent?: string;
  service_type?: string;
  is_examined_today?: boolean;
  today_examination_count?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
  };
}

function calcAgeMonths(birthDate: string): string {
  if (!birthDate) return "-";

  const birth = new Date(birthDate);
  const now = new Date();

  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (months < 1) return "< 1 bln";
  if (months < 12) return `${months} bln`;

  const years = Math.floor(months / 12);
  const rem = months % 12;

  return rem > 0 ? `${years} thn ${rem} bln` : `${years} thn`;
}

function buildDistribusi(
  dist: { range: string; count: number }[]
): DistribusiItem[] {
  const colors = ["#3B82F6", "#60A5FA", "#BFDBFE", "#93C5FD", "#E5E7EB"];
  const total = dist.reduce((sum, item) => sum + item.count, 0) || 1;

  return dist.map((item, index) => ({
    label: item.range,
    pct: Math.round((item.count / total) * 100),
    color: colors[index % colors.length],
  }));
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;    
  label: string;
  value: string | number;
  sub?: string;
  badge?: string;
  trend?: string;
  trendUp?: boolean;
  progress?: number;
  progressLabel?: string;
  avatarCount?: number;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, badge, trend, trendUp, progress, progressLabel, avatarCount }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between mb-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} strokeWidth={2} />
        </div>
        {trend ? (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              trendUp ? "text-green-600" : "text-red-600"
            }`}
          >
            <span>{trend}</span>
            {trendUp ? (
              <TrendingUp size={13} strokeWidth={2.3} />
            ) : (
              <TrendingDown size={13} strokeWidth={2.3} />
            )}
          </span>
        ) : (
          sub && (
            <span className="text-xs text-gray-400">
              {sub}
            </span>
          )
        )}
      </div>

      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>

      {badge && (
        <span className="self-start text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full tracking-wide">
          {badge}
        </span>
      )}

      {progress !== undefined && (
        <div className="mt-1">
          <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(progress, 100)}%`, background: iconColor }} />
          </div>
          {progressLabel && <p className="text-[11px] text-gray-400 mt-1">{progressLabel}</p>}
        </div>
      )}

      {avatarCount !== undefined && avatarCount > 0 && (
        <div className="flex items-center mt-1">
          {Array.from({ length: Math.min(avatarCount, 3) }).map((_, i) => (
            <div key={i}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold"
              style={{ marginLeft: i === 0 ? 0 : -6, background: "#BFDBFE", color: "#1D4ED8" }}>
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          {avatarCount > 3 && <span className="text-xs text-gray-400 ml-1.5">+{avatarCount - 3}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ data, total }: { data: DistribusiItem[]; total: number }) {
  const r = 54, cx = 70, cy = 70, circumference = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {data.length === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="16" />
      ) : (
        data.map((d) => {
          const dash = (d.pct / 100) * circumference;
          const offset = circumference - (acc / 100) * circumference;
          acc += d.pct;
          return (
            <circle key={d.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth="16"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          );
        })
      )}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1F2937">
        {total.toLocaleString("id-ID")}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9CA3AF">Balita</text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({ 
    totalPasien: 0, 
    pemeriksaanBulan: 0, 
    kasusStunting: 0, 
    pasienNormal: 0, 
    jadwalHariIni: 0 
  });
  const [distribusiUmur, setDistribusiUmur] = useState<DistribusiItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [, setAllPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [trendData, setTrendData] = useState<TrendStuntingItem[]>([]);
  const [trendFilter, setTrendFilter] = useState("6 Bulan Terakhir");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(localSearch.toLowerCase())
  );

  const stuntingTrendPercent =
    trendData.length >= 2 &&
    trendData[trendData.length - 2].stunting > 0
      ? ((trendData[trendData.length - 1].stunting -
          trendData[trendData.length - 2].stunting) /
          trendData[trendData.length - 2].stunting) *
        100
      : 0;

  const stuntingTrend =
    trendData.length >= 2
      ? trendData[trendData.length - 1].stunting -
        trendData[trendData.length - 2].stunting
      : 0;

  const stuntingPct =
    stats.totalPasien > 0
      ? (stats.kasusStunting / stats.totalPasien) * 100
      : 0;

  // Fetch Trend Stunting Data
  useEffect(() => {
    fetch(`${BASE_URL}/api/dashboard/trend-stunting`, {
      credentials: "include",
      headers: authHeaders(),
    })
      .then(r => r.json())
      .then(json => { if (json.success) setTrendData(json.data ?? []); })
      .catch(console.error);
  }, []);

  // Fetch Dashboard Stats
  useEffect(() => {
    fetch(`${BASE_URL}/api/dashboard/stats`, {
      credentials: "include",
      headers: authHeaders(),
    })
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const d: DashboardStats = json.data;
        const targets = {
          totalPasien: d.totalPatients ?? 0,
          pemeriksaanBulan: d.totalExaminations ?? 0,
          kasusStunting: d.stuntingCount ?? 0,
          pasienNormal: d.normalCount ?? 0,
        };
        let step = 0; const steps = 40;
        const timer = setInterval(() => {
          step++; const ease = 1 - Math.pow(1 - step / steps, 3);
          setStats(prev => ({
            totalPasien: Math.round(targets.totalPasien * ease),
            pemeriksaanBulan: Math.round(targets.pemeriksaanBulan * ease),
            kasusStunting: Math.round(targets.kasusStunting * ease),
            pasienNormal: Math.round(targets.pasienNormal * ease),
            jadwalHariIni: prev.jadwalHariIni,
          }));
          if (step >= steps) clearInterval(timer);
        }, 900 / steps);
        if (d.ageGroupDistribution?.length) setDistribusiUmur(buildDistribusi(d.ageGroupDistribution));
      })
      .catch(console.error);
  }, []);

  // Fetch Today's Scheduled Patients
  useEffect(() => {
    async function fetchTodayExaminations() {
      try {
        setLoadingPatients(true);

        const response = await fetch(
          `${BASE_URL}/api/pemeriksaan/all?page=1&limit=100`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json?.message ||
              `Gagal mengambil data pemeriksaan (HTTP ${response.status})`
          );
        }

        const items = Array.isArray(json.data?.items)
          ? json.data.items
          : [];

        const today = new Date().toISOString().split("T")[0];

        const todayExaminations = items.filter((exam: any) => {
          if (!exam.exam_date) return false;
          return exam.exam_date.split("T")[0] === today;
        });

        const patientsToday: Patient[] = todayExaminations
          .filter((exam: any) => exam.patient)
          .map((exam: any) => ({
            id: exam.patient.id,
            nik: exam.patient.nik,
            name: exam.patient.name,
            birth_date: exam.patient.birth_date,
            gender: exam.patient.gender,
            mother_name: exam.patient.mother_name,
            phone_parent: exam.patient.phone_parent,
            is_examined_today: true,
            today_examination_count: 1,
            service_type: "Pemeriksaan Rutin",
          }));

        setPatients(patientsToday);

        setStats((prev) => ({
          ...prev,
          jadwalHariIni: patientsToday.length,
        }));
      } catch (err) {
        console.error("Fetch Today Examinations Error:", err);
        setPatients([]);
        setStats((prev) => ({
          ...prev,
          jadwalHariIni: 0,
        }));
      } finally {
        setLoadingPatients(false);
      }
    }

    fetchTodayExaminations();
  }, []);

  // Fetch All Patients (Master list)
  useEffect(() => {
    fetch(`${BASE_URL}/api/pasien/all`, {
      credentials: "include",
      headers: authHeaders(),
    })
      .then(r => r.json())
      .then(json => { if (json.success) setAllPatients(json.data.items ?? []); })
      .catch(console.error);
  }, []);

  const todayStr = new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6 pt-2">
      
      {/* ─── CUSTOM HEADER DASHBOARD ─── */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 sm:block">
              <h1 className="whitespace-nowrap text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                Dashboard Ringkasan
              </h1>

              {/* Posyandu khusus mobile */}
              <div className="flex shrink-0 items-center gap-1 text-gray-700 sm:hidden">
                <FiHome
                  size={13}
                  className="shrink-0 text-gray-500"
                />
                <span className="whitespace-nowrap text-[9px] font-medium text-gray-500">
                  Posyandu Kliningan
                </span>
              </div>
            </div>

            <p className="mt-1 whitespace-nowrap text-xs text-gray-400 sm:text-sm">
              Selamat datang kembali, berikut statistik kesehatan terkini.
            </p>
          </div>

          {/* Posyandu desktop */}
          <div className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-gray-700 sm:flex">
            <FiHome
              size={16}
              className="shrink-0 text-gray-500"
            />
            <span className="whitespace-nowrap">
              Posyandu Kliningan
            </span>
          </div>
        </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1 min-w-0">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari data pasien atau jadwal..."
              className="
                w-full
                rounded-xl
                border border-gray-200
                bg-white
                py-3
                pl-11
                pr-4
                text-sm
                text-gray-600
                outline-none
                shadow-sm
                focus:border-blue-500
              "
            />
          </div>

          <button
            onClick={() => router.push("/pemeriksaan/add")}
            className="
              flex
              w-full
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-medium
              text-white
              shadow-sm
              shadow-blue-200
              transition
              hover:bg-blue-700
              sm:w-auto
            "
          >
            <FiPlus className="h-4 w-4" />
            <span className="whitespace-nowrap">
              Tambah Pemeriksaan
            </span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiUsers}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
          label="Total Pasien"
          value={stats.totalPasien.toLocaleString("id-ID")}
          trend="+4%" trendUp={true}
        />

        <StatCard
          icon={FaStethoscope}
          iconBg="#DCEFF8"
          iconColor="#0F5E84"
          label="Pemeriksaan Bulan Ini"
          value={stats.pemeriksaanBulan}
          trend="+12%" trendUp={true}
        />

        <StatCard
          icon={FiAlertTriangle}
          iconBg="#FEE2E2"
          iconColor="#DC2626"
          label="Kasus Stunting Aktif"
          value={stats.kasusStunting}
          trend={
            trendData.length >= 2
              ? `${stuntingTrendPercent > 0 ? "+" : ""}${stuntingTrendPercent.toFixed(1)}%`
              : undefined
          }
          trendUp={stuntingTrend < 0}
          badge={
            stuntingPct > 14
              ? "PERLU INTERVENSI"
              : undefined
          }
        />

        <StatCard
          icon={FiCalendar}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
          label="Jadwal Hari Ini"
          value={stats.jadwalHariIni}
          sub={todayStr}
          avatarCount={stats.jadwalHariIni}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Tren Stunting Bulanan</h2>
            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                {trendFilter} <FiChevronDown size={12} />
              </button>
              {showPeriodMenu && (
                <div className="absolute right-0 top-10 z-20 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                  {["Bulan Ini","1 Bulan Sebelumnya","3 Bulan Terakhir","6 Bulan Terakhir","Tahun Ini"].map(item => (
                    <button key={item} onClick={() => { setTrendFilter(item); setShowPeriodMenu(false); }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${trendFilter === item ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 10, color: "#F9FAFB", fontSize: 12 }}
                itemStyle={{ color: "#60A5FA" }} cursor={{ stroke: "#E5E7EB" }} />
              <Line type="monotone" dataKey="stunting" stroke="#3B82F6" strokeWidth={2.5}
                dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Distribusi Kelompok Umur</h2>
          <div className="flex flex-col items-center gap-5">
            <DonutChart data={distribusiUmur} total={stats.totalPasien} />
            <div className="w-full space-y-2.5">
              {distribusiUmur.map(d => (
                <div key={d.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Riwayat Pasien Hari ini</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loadingPatients ? "Memuat..." : `Menampilkan ${filteredPatients.length} jadwal terdekat`}
            </p>
          </div>
          <button 
            onClick={() => router.push("/pemeriksaan")}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Lihat Semua
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 border-b border-gray-100">
              <th className="px-6 py-3">Nama Pasien</th>
              <th className="px-6 py-3">Usia</th>
              <th className="px-6 py-3">Jenis Layanan</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loadingPatients ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                <FiLoader className="w-5 h-5 animate-spin mx-auto mb-2" />
                <span className="text-sm">Memuat data pasien...</span>
              </td></tr>
            ) : filteredPatients.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                Tidak ada jadwal pemeriksaan hari ini.
              </td></tr>
            ) : (
              filteredPatients.map(row => {
                const isChecked = row.is_examined_today === true;
                const initials   = row.name ? row.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "PS";
                const colors     = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
                const colorCls   = colors[row.name.charCodeAt(0) % colors.length];

                return (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${colorCls}`}>
                          {initials}
                        </div>
                        <span className="font-medium text-gray-800">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{calcAgeMonths(row.birth_date)}</td>
                    <td className="px-6 py-4 text-gray-600">{row.service_type ?? "Rutin Bulanan"}</td>
                    <td className="px-6 py-4">
                      {isChecked ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                          Sudah Diperiksa
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          Belum Diperiksa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/patient/${row.id}`)}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <FiEye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}