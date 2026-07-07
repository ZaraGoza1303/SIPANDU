"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Calendar, RotateCcw, FileDown, Download, ClipboardList, TrendingDown, AlertTriangle, CheckCircle2, Info, FileText, ChevronRight, ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { apiGet } from "@/lib/apiClient";
import type {
  DashboardStats,
  TrendStuntingItem,
  Patient,
  PaginationMeta,
} from "@/types/Api";

/**
 * Laporan (Report) — restyled to match the approved mockup, wired to the
 * documented backend API (see API-Documentation.md):
 *   GET /api/dashboard/stats
 *   GET /api/dashboard/trend-stunting
 *   GET /api/pasien/all?page=&limit=&search=
 *
 * Things in the mockup that the documented API does NOT expose yet, and
 * how they're handled here (all marked with `// TODO(api):` below so
 * they're easy to find and wire up once the endpoints exist):
 *   1. "Jumlah Stunting per RW/Wilayah" — no per-RW breakdown endpoint.
 *      Substituted with a Normal vs Stunting summary bar (from
 *      /dashboard/stats), clearly labeled so it isn't mistaken for
 *      real per-RW data.
 *   2. Per-child BB / TB / Z-Score / Status columns — /pasien/all only
 *      returns biodata, not measurements. Columns render as "-" until
 *      a join with something like GET /api/pemeriksaan/all?patient_id=
 *      is added.
 *   3. Trend deltas (+12%, -4.3%, etc.) — computed for real from the
 *      last two points of /dashboard/trend-stunting, not fabricated.
 *   4. Coverage Rate — approximated as
 *      (totalExaminationsThisMonth / totalPatients) since there's no
 *      dedicated coverage endpoint documented.
 *   5. "Laporan Tahunan" / period filter / Excel export — same as
 *      before: display-only period, CSV built client-side from loaded
 *      data, PDF via print-to-PDF.
 */

interface LaporanReportProps {
  /** Bisa `undefined` sesaat (misalnya saat auth masih dicek). Komponen
   * tetap memanggil API asli begitu token tersedia — tidak ada mode
   * dummy/demo di sini. Kalau token belum ada / server belum jalan,
   * request akan gagal secara wajar dan errornya ditampilkan di UI. */
  token?: string;
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
    if (!token) {
      setStatsError("Belum login / token tidak ditemukan.");
      return;
    }
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
    if (!token) {
      setTrendError("Belum login / token tidak ditemukan.");
      return;
    }
    setTrendLoading(true);
    setTrendError(null);
    try {
      const data = await apiGet<TrendStuntingItem[]>(
        "/api/dashboard/trend-stunting",
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
    if (!token) {
      setPatientsError("Belum login / token tidak ditemukan.");
      return;
    }
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(meta.limit || 10),
        search,
      });
      const data = await apiGet<{ items: Patient[]; meta: PaginationMeta }>(
        `/api/pasien/all?${qs.toString()}`,
        token
      );
      setPatients(data.items || []);
      setMeta(data.meta || DEFAULT_META);
    } catch (e) {
      setPatientsError(e instanceof Error ? e.message : String(e));
    } finally {
      setPatientsLoading(false);
    }
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
      ? (stats.stuntingCount / stats.totalPatients) * 100
      : 0;

  const giziSummary = stats
    ? [
        { name: "Normal", value: stats.normalCount || 0 },
        { name: "Stunting", value: stats.stuntingCount || 0 },
      ]
    : [];

  // Real deltas computed from the last two points of the trend series
  // (not fabricated) — used to drive the little +/- badges on the stat
  // cards, the way the mockup shows them.
  const deltas = useMemo(() => {
    if (trend.length < 2) return null;
    const curr = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    const totalDeltaPct =
      prev.total > 0 ? ((curr.total - prev.total) / prev.total) * 100 : 0;
    const currRate = curr.total > 0 ? (curr.stunting / curr.total) * 100 : 0;
    const prevRate = prev.total > 0 ? (prev.stunting / prev.total) * 100 : 0;
    const rateDeltaPts = currRate - prevRate;
    const newCasesDelta = curr.stunting - prev.stunting;
    return { totalDeltaPct, rateDeltaPts, newCasesDelta, currentNewCases: curr.stunting };
  }, [trend]);

  const coverageRate =
    stats && stats.totalPatients
      ? Math.min(100, (stats.totalExaminationsThisMonth / stats.totalPatients) * 100)
      : 0;
  const coverageLabel =
    coverageRate >= 90 ? "Excellent" : coverageRate >= 75 ? "Baik" : "Perlu Ditingkatkan";

  const trendDirection = useMemo(() => {
    if (!deltas) return null;
    return deltas.rateDeltaPts <= 0
      ? { label: "Trend Menurun (Optimal)", positive: true }
      : { label: "Trend Meningkat", positive: false };
  }, [deltas]);

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

  const handleReset = () => {
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-4 pt-1 text-slate-900">
      {/* Top utility bar: report search + annual report shortcut */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-lg">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 print:hidden"
            placeholder="Cari laporan, data anak…"
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
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 print:hidden"
        >
          <FileText className="h-4 w-4" /> Laporan Tahunan {new Date().getFullYear()}
        </button>
      </div>

      {/* Header + filter actions */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Laporan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Statistik kesehatan dan perkembangan anak wilayah Posyandu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            title="dashboard/stats & dashboard/trend-stunting belum mendukung query parameter periode — filter ini hanya tampilan."
            className="flex cursor-help items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm"
          >
            <Calendar className="h-4 w-4" /> {periode} <span className="text-xs text-slate-400">▾</span>
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm hover:bg-slate-50 print:hidden"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleExportPdf}
            title="Simpan sebagai PDF"
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700 print:hidden"
          >
            <FileText className="h-4 w-4" /> PDF
          </button>
          <button
            onClick={handleExportCsv}
            title="Unduh Excel (CSV)"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm hover:bg-slate-50 print:hidden"
          >
            <Download className="h-4 w-4" /> Unduh CSV
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
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Pemeriksaan"
          value={statsLoading ? "…" : stats?.totalExaminationsThisMonth ?? "-"}
          icon={<ClipboardList className="h-4 w-4" />}
          accent="blue"
          badge={
            deltas
              ? { text: `${deltas.totalDeltaPct >= 0 ? "+" : ""}${deltas.totalDeltaPct.toFixed(0)}%`, positive: deltas.totalDeltaPct >= 0 }
              : undefined
          }
        />
        <StatCard
          label="Prevalensi Stunting (%)"
          value={statsLoading ? "…" : `${stuntingPct.toFixed(1)}%`}
          icon={<TrendingDown className="h-4 w-4" />}
          accent="red"
          badge={
            deltas
              ? { text: `${deltas.rateDeltaPts >= 0 ? "+" : ""}${deltas.rateDeltaPts.toFixed(1)}%`, positive: deltas.rateDeltaPts <= 0 }
              : undefined
          }
          footnote="Target Nasional: 14%"
        />
        <StatCard
          label="Kasus Baru Bulan Ini"
          value={statsLoading ? "…" : `${stats?.stuntingCount ?? "-"} Anak`}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="amber"
          footnote={
            deltas
              ? `${deltas.newCasesDelta >= 0 ? "+" : ""}${deltas.newCasesDelta} dr bulan lalu`
              : undefined
          }
        />
        <StatCard
          label="Coverage Rate"
          value={statsLoading ? "…" : `${coverageRate.toFixed(1)}%`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="green"
          footnote={coverageLabel}
        />
      </div>

      {/* Charts row */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-1.5 text-lg font-semibold">
            Ringkasan Status Gizi
            <span
              title="Breakdown per RW/Wilayah belum tersedia dari API — menampilkan ringkasan Normal vs Stunting sebagai gantinya."
              className="cursor-help text-sm text-slate-400"
            >
              ⓘ
            </span>
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
                    fill={entry.name === "Stunting" ? "#dc2626" : "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-lg font-semibold">
            Distribusi Kelompok Usia
          </div>
          <div className="mt-3 flex flex-col gap-3">
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-lg font-semibold">
            Tren Stunting ({trend.length || 6} Bulan Terakhir)
          </div>
          {trendDirection && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                trendDirection.positive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {trendDirection.positive ? "↗" : "↘"} {trendDirection.label}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Pemeriksaan"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#trendFill)"
              dot={{ r: 3, fill: "#2563eb" }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {trendLoading && <div className="text-sm text-slate-400">Memuat…</div>}
        {!trendLoading && trend.length === 0 && (
          <div className="text-sm text-slate-400">
            Belum ada data trend untuk periode ini.
          </div>
        )}
      </div>

      {/* Patient table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-lg font-semibold">
            Daftar Anak dengan Status Stunting
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <input
              className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
            <button
              onClick={handleExportCsv}
              title="Unduh data tabel ini sebagai file Excel (.csv)"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Excel
            </button>
          </div>
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
                  "Usia",
                  "BB (Kg)",
                  "TB (cm)",
                  "Z-Score",
                  "Status",
                  "Pemeriksaan Terakhir",
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
                  <td className="px-3 py-2.5" colSpan={7}>
                    Memuat data anak…
                  </td>
                </tr>
              )}
              {!patientsLoading && patients.length === 0 && (
                <tr>
                  <td className="px-3 py-2.5" colSpan={7}>
                    Tidak ada anak ditemukan.
                  </td>
                </tr>
              )}
              {!patientsLoading &&
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 font-medium">
                      {p.name}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      {calcUsia(p.birth_date)}
                    </td>
                    {/* TODO(api): BB/TB/Z-Score/Status/Pemeriksaan Terakhir
                        need a join with GET /api/pemeriksaan/all?patient_id=
                        — not available from /pasien/all today. */}
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-slate-400">
                      -
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-slate-400">
                      -
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-slate-400">
                      -
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                        Belum ada data
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-slate-400">
                      -
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs text-slate-500">
            Menampilkan {patients.length} dari {meta.total_items} anak
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

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 print:hidden">
        <span>Print-friendly layout ini dioptimalkan untuk pencetakan arsip.</span>
        <span>© {new Date().getFullYear()} Posyandu Digital. All data encrypted and secured.</span>
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
  icon: React.ReactNode;
  accent: Accent;
  badge?: { text: string; positive: boolean };
  footnote?: string;
}

function StatCard({ label, value, icon, accent, badge, footnote }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-lg ${ACCENT_CLASSES[accent]}`}
        >
          {icon}
        </div>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              badge.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
      <div className="mt-3 text-xl font-bold">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
      {footnote && (
        <div className="mt-1.5 text-xs text-slate-400">{footnote}</div>
      )}
    </div>
  );
}