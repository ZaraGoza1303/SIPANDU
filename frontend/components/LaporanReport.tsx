"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { apiGet } from "@/lib/apiClient";
import type {
  DashboardStats,
  TrendStuntingItem,
  Patient,
  PaginationMeta,
} from "@/types/Api";

/**
 * Laporan (Report) — wired to the documented backend API.
 *
 * Endpoints used (see API-Documentation.md):
 *   GET /api/dashboard/stats
 *   GET /api/dashboard/trend-stunting
 *   GET /api/pasien/all?page=&limit=&search=
 *
 * Differences from the original mockup, and why (endpoints not documented
 * for these, so real ones were used instead of fabricated data):
 *   1. "Jumlah Stunting per RW/Wilayah" → replaced with "Ringkasan Status
 *      Gizi" (stuntingCount vs normalCount from /dashboard/stats).
 *   2. "Coverage Rate" → replaced with "Pemeriksaan Bulan Ini"
 *      (totalExaminationsThisMonth from /dashboard/stats).
 *   3. "Tren Stunting 12 Bulan" → shows 6 bulan, matching what
 *      /dashboard/trend-stunting actually returns.
 *   4. Table columns BB/TB/Z-Score/Status per anak → not available from
 *      /pasien/all (that's biodata only); would need something like
 *      GET /api/pemeriksaan/all?patient_id= to join in.
 *   5. Period filter / Export → filter is display-only (no date query
 *      param documented); Excel/PDF export run client-side (CSV download +
 *      print-to-PDF) against loaded data.
 */

interface LaporanReportProps {
  token: string;
}

const DEFAULT_META: PaginationMeta = {
  total_items: 0,
  current_page: 1,
  limit: 10,
  total_pages: 1,
};

function calcUsia(birthDateStr: string | null | undefined): string {
  if (!birthDateStr) return "-";
  const birth = new Date(birthDateStr);
  if (Number.isNaN(birth.getTime())) return "-";
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) months = 0;
  if (months < 24) return `${months} Bulan`;
  return `${Math.floor(months / 12)} Thn ${months % 12} Bln`;
}

interface CsvColumn<T> {
  label: string;
  value: (row: T) => string | number | null | undefined;
}

function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => `"${String(c.value(row) ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LaporanReport({ token }: LaporanReportProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [trend, setTrend] = useState<TrendStuntingItem[]>([]);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [patientsLoading, setPatientsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const periode = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
    []
  );

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      setStats(await apiGet<DashboardStats>("/api/dashboard/stats", token));
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const loadTrend = useCallback(async () => {
    setTrendLoading(true);
    setTrendError(null);
    try {
      const data = await apiGet<TrendStuntingItem[]>(
        "api/dashboard/trend-stunting",
        token
      );
      setTrend(Array.isArray(data) ? data : []);
    } catch (e) {
      setTrendError(e instanceof Error ? e.message : String(e));
    } finally {
      setTrendLoading(false);
    }
  }, [token]);

  const loadPatients = useCallback(async () => {
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(meta.limit || 10),
        search,
      });
      const data = await apiGet<{ items: Patient[]; meta: PaginationMeta }>(
        `api/pasien/all?${qs.toString()}`,
        token
      );
      setPatients(data.items || []);
      setMeta(data.meta || DEFAULT_META);
    } catch (e) {
      setPatientsError(e instanceof Error ? e.message : String(e));
    } finally {
      setPatientsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, search]);

  useEffect(() => {
    loadStats();
    loadTrend();
  }, [loadStats, loadTrend]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const stuntingPct =
    stats && stats.totalPatients
      ? ((stats.stuntingCount / stats.totalPatients) * 100).toFixed(1)
      : "0.0";

  const giziSummary = stats
    ? [
        { name: "Normal", value: stats.normalCount || 0 },
        { name: "Stunting", value: stats.stuntingCount || 0 },
      ]
    : [];

  const handleExportCsv = () => {
    const columns: CsvColumn<Patient>[] = [
      { label: "Nama", value: (r) => r.name },
      { label: "NIK", value: (r) => r.nik },
      { label: "Usia", value: (r) => calcUsia(r.birth_date) },
      { label: "Jenis Kelamin", value: (r) => r.gender },
      { label: "Nama Ibu", value: (r) => r.mother_name },
      { label: "Alamat", value: (r) => r.address },
      { label: "No. HP Orang Tua", value: (r) => r.phone_parent },
    ];
    downloadFile(
      `laporan-pasien-${Date.now()}.csv`,
      toCsv(patients, columns),
      "text/csv;charset=utf-8;"
    );
  };

  const handleExportPdf = () => window.print();

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Laporan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Statistik kesehatan dan pemantauan stunting wilayah Posyandu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            title="dashboard/stats & dashboard/trend-stunting belum mendukung query parameter periode — filter ini hanya tampilan."
            className="cursor-help rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            📅 {periode}
          </span>
          <button
            onClick={handleExportCsv}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm hover:bg-slate-50 print:hidden"
          >
            ⬇ Excel (CSV)
          </button>
          <button
            onClick={handleExportPdf}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm hover:bg-slate-50 print:hidden"
          >
            🖨 PDF
          </button>
        </div>
      </div>

      {(statsError || trendError) && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {statsError && <div>Dashboard stats: {statsError}</div>}
          {trendError && <div>Trend stunting: {trendError}</div>}
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Pasien"
          value={statsLoading ? "…" : stats?.totalPatients ?? "-"}
          icon="👥"
          accent="blue"
        />
        <StatCard
          label="Prevalensi Stunting"
          value={statsLoading ? "…" : `${stuntingPct}%`}
          icon="📉"
          accent="red"
        />
        <StatCard
          label="Kasus Stunting"
          value={statsLoading ? "…" : `${stats?.stuntingCount ?? "-"} Anak`}
          icon="⚠️"
          accent="amber"
        />
        <StatCard
          label="Pemeriksaan Bulan Ini"
          value={statsLoading ? "…" : stats?.totalExaminationsThisMonth ?? "-"}
          icon="✅"
          accent="green"
        />
      </div>

      {/* Charts row */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Distribusi Status Gizi</div>
          <div className="mb-2 mt-0.5 text-[11px] text-slate-400">
            dari GET /api/dashboard/stats
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={giziSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {giziSummary.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === "Stunting" ? "#dc2626" : "#16a34a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Distribusi Kelompok Usia</div>
          <div className="mb-2 mt-0.5 text-[11px] text-slate-400">
            ageGroupDistribution — GET /api/dashboard/stats
          </div>
          <div className="mt-2 flex flex-col gap-2.5">
            {(stats?.ageGroupDistribution || []).map((g) => {
              const max = Math.max(
                1,
                ...(stats?.ageGroupDistribution || []).map((x) => x.count)
              );
              return (
                <div key={g.range}>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{g.range}</span>
                    <span>{g.count} Anak</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${(g.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {statsLoading && (
              <div className="text-sm text-slate-400">Memuat…</div>
            )}
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="mb-3.5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold">
          Tren Stunting (6 Bulan Terakhir)
        </div>
        <div className="mb-2 mt-0.5 text-[11px] text-slate-400">
          GET /api/dashboard/trend-stunting — API menyediakan 6 bulan, bukan 12
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Pemeriksaan"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="stunting"
              name="Kasus Stunting"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {trendLoading && <div className="text-sm text-slate-400">Memuat…</div>}
        {!trendLoading && trend.length === 0 && (
          <div className="text-sm text-slate-400">
            Belum ada data trend untuk 6 bulan terakhir.
          </div>
        )}
      </div>

      {/* Patient table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2.5">
          <div>
            <div className="text-sm font-semibold">Daftar Pasien</div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              GET /api/pasien/all — kolom BB/TB/Z-Score/Status Stunting per
              anak memerlukan endpoint riwayat pemeriksaan yang belum ada di
              dokumentasi.
            </div>
          </div>
          <input
            className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm print:hidden"
            placeholder="Cari nama atau NIK…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setSearch(searchInput);
              }
            }}
          />
        </div>

        {patientsError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {patientsError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {[
                  "Nama",
                  "NIK",
                  "Usia",
                  "Jenis Kelamin",
                  "Nama Ibu",
                  "No. HP Orang Tua",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 text-left font-semibold text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patientsLoading && (
                <tr>
                  <td className="px-3 py-2.5" colSpan={6}>
                    Memuat data pasien…
                  </td>
                </tr>
              )}
              {!patientsLoading && patients.length === 0 && (
                <tr>
                  <td className="px-3 py-2.5" colSpan={6}>
                    Tidak ada pasien ditemukan.
                  </td>
                </tr>
              )}
              {!patientsLoading &&
                patients.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      {p.name}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      {p.nik}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      {calcUsia(p.birth_date)}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      {p.gender}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      {p.mother_name}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      {p.phone_parent}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs text-slate-500">
            Menampilkan {patients.length} dari {meta.total_items} pasien
          </span>
          <div className="flex gap-1.5 print:hidden">
            <button
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="px-1 py-1.5 text-xs text-slate-600">
              {meta.current_page} / {meta.total_pages || 1}
            </span>
            <button
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs disabled:opacity-40"
              disabled={page >= (meta.total_pages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Accent = "blue" | "red" | "amber" | "green";

const ACCENT_CLASSES: Record<Accent, string> = {
  blue: "bg-blue-100 text-blue-600",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent: Accent;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-lg ${ACCENT_CLASSES[accent]}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="mt-0.5 text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}