"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Calendar,
  RotateCcw,
  Download,
  ClipboardList,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
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
import { api } from "@/lib/api";
import type {
  DashboardStats,
  TrendStuntingItem,
  PaginationMeta,
} from "@/types/Api";

/* =========================================================
   TYPES
========================================================= */

const DEFAULT_META: PaginationMeta = {
  total_items: 0,
  current_page: 1,
  limit: 10,
  total_pages: 1,
};

interface Patient {
  id: string;
  nik: string;
  name: string;
  birth_date: string;
  gender: string;
  mother_name: string;
  father_name?: string;
  address?: string;
  phone_parent?: string;

  latest_weight?: number;
  latest_height?: number;
  latest_zscore?: number;
  latest_status?: string;
  latest_exam_date?: string;
}

interface ExaminationReportItem {
  id: string;
  patient_id: string;
  user_id?: string;
  exam_date?: string;
  weight?: number;
  height?: number;
  head_circumference?: number;
  arm_circumference?: number;
  notes?: string;
  created_at?: string;

  patient?: {
    id: string;
    posyandu_id?: string;
    nik?: string;
    picture?: string;
    nik_parent?: string;
    name?: string;
    birth_date?: string;
    gender?: string;
    mother_name?: string;
    father_name?: string;
    address?: string;
    phone_parent?: string;
    created_at?: string;
  };

  stunting_result?: {
    id?: string;
    examination_id?: string;
    age_months?: number;
    weight_for_age_zscore?: number;
    height_for_age_zscore?: number;
    weight_for_height_zscore?: number;
    stunting_status?: string;
    wasting_status?: string;
    underweight_status?: string;
  };
}

interface CsvColumn<T> {
  label: string;
  value: (row: T) => string | number | null | undefined;
}

/* =========================================================
   HELPERS
========================================================= */

function calcUsia(
  birthDateStr: string | null | undefined
): string {
  if (!birthDateStr) return "-";

  const birth = new Date(birthDateStr);

  if (Number.isNaN(birth.getTime())) {
    return "-";
  }

  const now = new Date();

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    months = 0;
  }

  if (months < 24) {
    return `${months} Bulan`;
  }

  return `${Math.floor(months / 12)} Thn ${months % 12} Bln`;
}

function toCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[]
): string {
  const header = columns
    .map((column) => `"${column.label}"`)
    .join(",");

  const body = rows
    .map((row) =>
      columns
        .map((column) =>
          `"${String(
            column.value(row) ?? ""
          ).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  return `${header}\n${body}`;
}

function downloadFile(
  filename: string,
  content: string,
  mime: string
) {
  const blob = new Blob([content], {
    type: mime,
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function getStatusClass(status?: string) {
  if (!status) {
    return "bg-slate-100 text-slate-500";
  }

  const normalized = status.toLowerCase();

  if (
    normalized.includes("normal")
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    normalized.includes("stunting") ||
    normalized.includes("high")
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    normalized.includes("risiko") ||
    normalized.includes("risk")
  ) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-slate-100 text-slate-600";
}

/* =========================================================
   MAIN
========================================================= */

export default function LaporanReport() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [statsError, setStatsError] =
    useState<string | null>(null);

  const [statsLoading, setStatsLoading] =
    useState(false);

  const [trend, setTrend] =
    useState<TrendStuntingItem[]>([]);

  const [trendError, setTrendError] =
    useState<string | null>(null);

  const [trendLoading, setTrendLoading] =
    useState(false);

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [meta, setMeta] =
    useState<PaginationMeta>(DEFAULT_META);

  const [patientsError, setPatientsError] =
    useState<string | null>(null);

  const [patientsLoading, setPatientsLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [page, setPage] =
    useState(1);

  const periode = useMemo(
    () =>
      new Date().toLocaleDateString(
        "id-ID",
        {
          month: "long",
          year: "numeric",
        }
      ),
    []
  );

  /* =========================================================
     LOAD STATS
  ========================================================= */

  const loadStats = useCallback(
    async () => {
      setStatsLoading(true);
      setStatsError(null);

      try {
        const result =
          await api.get<{
            success: boolean;
            data: DashboardStats;
            message?: string;
          }>("/api/dashboard/stats");

        setStats(result.data ?? null);
      } catch (error) {
        setStatsError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      } finally {
        setStatsLoading(false);
      }
    },
    []
  );

  /* =========================================================
     LOAD TREND
  ========================================================= */

  const loadTrend = useCallback(
    async () => {
      setTrendLoading(true);
      setTrendError(null);

      try {
        const result =
          await api.get<{
            success: boolean;
            data: TrendStuntingItem[];
            message?: string;
          }>("/api/dashboard/trend-stunting");

        const data = Array.isArray(
          result.data
        )
          ? result.data
          : [];

        setTrend(data);
      } catch (error) {
        setTrendError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      } finally {
        setTrendLoading(false);
      }
    },
    []
  );

  /* =========================================================
     LOAD EXAMINATIONS
  ========================================================= */

  const loadPatients = useCallback(
    async () => {
      setPatientsLoading(true);
      setPatientsError(null);

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(meta.limit || 10),
          search,
        });

        const result =
          await api.get<{
            success: boolean;
            data: {
              items: ExaminationReportItem[];
              next_cursor?: string | null;
              meta: PaginationMeta;
            };
            message?: string;
          }>(
            `/api/pemeriksaan/all?${query.toString()}`
          );

        const examinations =
          Array.isArray(
            result.data?.items
          )
            ? result.data.items
            : [];

        /*
         * Satu pasien bisa punya banyak pemeriksaan.
         * Kita hanya mengambil pemeriksaan terbaru
         * untuk setiap patient_id.
         */

        const latestByPatient =
          new Map<
            string,
            ExaminationReportItem
          >();

        for (const exam of examinations) {
          if (!exam.patient) {
            continue;
          }

          const patientId =
            exam.patient.id;

          const existing =
            latestByPatient.get(
              patientId
            );

          if (!existing) {
            latestByPatient.set(
              patientId,
              exam
            );
            continue;
          }

          const currentDate =
            new Date(
              exam.exam_date ??
                exam.created_at ??
                0
            ).getTime();

          const existingDate =
            new Date(
              existing.exam_date ??
                existing.created_at ??
                0
            ).getTime();

          if (
            currentDate > existingDate
          ) {
            latestByPatient.set(
              patientId,
              exam
            );
          }
        }

        const mappedPatients: Patient[] =
          Array.from(
            latestByPatient.values()
          ).map((exam) => ({
            id:
              exam.patient!.id,

            nik:
              exam.patient!.nik ??
              "",

            name:
              exam.patient!.name ??
              "-",

            birth_date:
              exam.patient!.birth_date ??
              "",

            gender:
              exam.patient!.gender ??
              "-",

            mother_name:
              exam.patient!
                .mother_name ??
              "-",

            father_name:
              exam.patient!
                .father_name,

            address:
              exam.patient!.address,

            phone_parent:
              exam.patient!
                .phone_parent,

            latest_weight:
              exam.weight,

            latest_height:
              exam.height,

            latest_zscore:
              exam.stunting_result
                ?.height_for_age_zscore,

            latest_status:
              exam.stunting_result
                ?.stunting_status,

            latest_exam_date:
              exam.exam_date ??
              exam.created_at,
          }));

        setPatients(
          mappedPatients
        );

        setMeta(
          result.data?.meta ??
            DEFAULT_META
        );
      } catch (error) {
        setPatientsError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      } finally {
        setPatientsLoading(false);
      }
    },
    [
      page,
      search,
      meta.limit,
    ]
  );

  /* =========================================================
     EFFECTS
  ========================================================= */

  useEffect(() => {
    loadStats();
    loadTrend();
  }, [
    loadStats,
    loadTrend,
  ]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const stuntingPct =
    stats &&
    stats.totalPatients
      ? (
          stats.stuntingCount /
          stats.totalPatients
        ) * 100
      : 0;

  const giziSummary =
    stats
      ? [
          {
            name: "Normal",
            value:
              stats.normalCount ||
              0,
          },
          {
            name: "Stunting",
            value:
              stats.stuntingCount ||
              0,
          },
        ]
      : [];

  const deltas = useMemo(() => {
    if (trend.length < 2) {
      return null;
    }

    const curr =
      trend[trend.length - 1];

    const prev =
      trend[trend.length - 2];

    const totalDeltaPct =
      prev.total > 0
        ? ((curr.total -
            prev.total) /
            prev.total) *
          100
        : 0;

    const currRate =
      curr.total > 0
        ? (curr.stunting /
            curr.total) *
          100
        : 0;

    const prevRate =
      prev.total > 0
        ? (prev.stunting /
            prev.total) *
          100
        : 0;

    const rateDeltaPts =
      currRate - prevRate;

    const newCasesDelta =
      curr.stunting -
      prev.stunting;

    return {
      totalDeltaPct,
      rateDeltaPts,
      newCasesDelta,
      currentNewCases:
        curr.stunting,
    };
  }, [trend]);

  const coverageRate =
    stats &&
    stats.totalPatients
      ? Math.min(
          100,
          (stats.totalExaminationsThisMonth /
            stats.totalPatients) *
            100
        )
      : 0;

  const coverageLabel =
    coverageRate >= 90
      ? "Excellent"
      : coverageRate >= 75
      ? "Baik"
      : "Perlu Ditingkatkan";

  const trendDirection =
    useMemo(() => {
      if (!deltas) {
        return null;
      }

      return deltas.rateDeltaPts <= 0
        ? {
            label:
              "Trend Menurun (Optimal)",
            positive: true,
          }
        : {
            label:
              "Trend Meningkat",
            positive: false,
          };
    }, [deltas]);

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const handleExportCsv =
    () => {
      const columns: CsvColumn<Patient>[] =
        [
          {
            label: "Nama",
            value: (row) =>
              row.name,
          },
          {
            label: "NIK",
            value: (row) =>
              row.nik,
          },
          {
            label: "Usia",
            value: (row) =>
              calcUsia(
                row.birth_date
              ),
          },
          {
            label:
              "Jenis Kelamin",
            value: (row) =>
              row.gender,
          },
          {
            label: "Nama Ibu",
            value: (row) =>
              row.mother_name,
          },
          {
            label: "BB (Kg)",
            value: (row) =>
              row.latest_weight,
          },
          {
            label: "TB (cm)",
            value: (row) =>
              row.latest_height,
          },
          {
            label: "Z-Score",
            value: (row) =>
              row.latest_zscore,
          },
          {
            label: "Status",
            value: (row) =>
              row.latest_status,
          },
          {
            label:
              "Pemeriksaan Terakhir",
            value: (row) =>
              row.latest_exam_date
                ? new Date(
                    row.latest_exam_date
                  ).toLocaleDateString(
                    "id-ID"
                  )
                : "-",
          },
        ];

      downloadFile(
        `laporan-pasien-${Date.now()}.csv`,
        toCsv(
          patients,
          columns
        ),
        "text/csv;charset=utf-8;"
      );
    };

  /* =========================================================
     EXPORT PDF
  ========================================================= */

  const handleExportPdf =
    () => window.print();

  /* =========================================================
     RESET SEARCH
  ========================================================= */

  const handleReset =
    () => {
      setSearch("");
      setSearchInput("");
      setPage(1);
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 text-slate-900">
      {/* ================= HEADER ================= */}

      <p className="text-sm text-gray-400">
        Laporan /
        <span className="ml-1 font-medium text-blue-600">
          Laporan Posyandu
        </span>
      </p>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Laporan
          </h1>

          <p className="mt-1 mb-1 text-sm text-slate-500">
            Statistik kesehatan dan
            perkembangan anak wilayah
            Posyandu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="
              hidden items-center gap-1.5
              rounded-lg border border-slate-200
              bg-white px-3.5 py-2
              text-sm
              md:flex
            "
          >
            <Calendar className="h-4 w-4" />
            {periode}
          </span>

          <button
            onClick={
              handleReset
            }
            className="
              flex items-center gap-1.5
              rounded-lg border border-slate-200
              bg-white px-3.5 py-2
              text-sm
              hover:bg-slate-50
              print:hidden
            "
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            onClick={
              handleExportPdf
            }
            title="Simpan sebagai PDF"
            className="
              flex items-center gap-1.5
              rounded-lg bg-red-600
              px-3.5 py-2
              text-sm font-medium
              text-white
              hover:bg-red-700
              print:hidden
            "
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>

          <button
            onClick={
              handleExportCsv
            }
            title="Unduh Excel (CSV)"
            className="
              flex items-center gap-1.5
              rounded-lg border border-slate-200
              bg-green-500
              px-3.5 py-2
              text-sm
              text-white
              hover:bg-green-600
              print:hidden
            "
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      {/* ================= ERROR ================= */}

      {(statsError ||
        trendError) && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {statsError && (
            <div>
              Dashboard stats:{" "}
              {statsError}
            </div>
          )}

          {trendError && (
            <div>
              Trend stunting:{" "}
              {trendError}
            </div>
          )}
        </div>
      )}

      {/* ================= STAT CARDS ================= */}

      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Pemeriksaan"
          value={
            statsLoading
              ? "…"
              : stats?.totalExaminationsThisMonth ??
                "-"
          }
          icon={
            <ClipboardList className="h-4 w-4" />
          }
          accent="blue"
          badge={
            deltas
              ? {
                  text: `${
                    deltas.totalDeltaPct >=
                    0
                      ? "+"
                      : ""
                  }${deltas.totalDeltaPct.toFixed(
                    0
                  )}%`,
                  positive:
                    deltas.totalDeltaPct >=
                    0,
                }
              : undefined
          }
        />

        <StatCard
          label="Prevalensi Stunting (%)"
          value={
            statsLoading
              ? "…"
              : `${stuntingPct.toFixed(
                  1
                )}%`
          }
          icon={
            <TrendingDown className="h-4 w-4" />
          }
          accent="red"
          badge={
            deltas
              ? {
                  text: `${
                    deltas.rateDeltaPts >=
                    0
                      ? "+"
                      : ""
                  }${deltas.rateDeltaPts.toFixed(
                    1
                  )}%`,
                  positive:
                    deltas.rateDeltaPts <=
                    0,
                }
              : undefined
          }
          footnote="Target Nasional: 14%"
        />

        <StatCard
          label="Kasus Baru Bulan Ini"
          value={
            statsLoading
              ? "…"
              : `${
                  stats?.stuntingCount ??
                  "-"
                } Anak`
          }
          icon={
            <AlertTriangle className="h-4 w-4" />
          }
          accent="amber"
          footnote={
            deltas
              ? `${
                  deltas.newCasesDelta >=
                  0
                    ? "+"
                    : ""
                }${
                  deltas.newCasesDelta
                } dr bulan lalu`
              : undefined
          }
        />

        <StatCard
          label="Coverage Rate"
          value="-"
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="green"
          footnote="Data coverage belum tersedia"
        />
      </div>

      {/* ================= CHARTS ================= */}

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {/* Gizi */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-1.5 text-lg font-semibold">
            Ringkasan Status Gizi

            <span
              title="Data berasal dari dashboard/stats."
              className="text-sm text-slate-400"
            >
              ⓘ
            </span>
          </div>

          <ResponsiveContainer
            width="100%"
            height={220}
          >
            <BarChart
              data={giziSummary}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#eef2f7"
              />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                }}
                allowDecimals={false}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              >
                {giziSummary.map(
                  (entry) => (
                    <Cell
                      key={
                        entry.name
                      }
                      fill={
                        entry.name ===
                        "Stunting"
                          ? "#dc2626"
                          : "#2563eb"
                      }
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Usia */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 text-lg font-semibold">
            Distribusi Kelompok Usia
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {(
              stats?.ageGroupDistribution ||
              []
            ).map((group) => {
              const max =
                Math.max(
                  1,
                  ...(
                    stats?.ageGroupDistribution ||
                    []
                  ).map(
                    (item) =>
                      item.count
                  )
                );

              return (
                <div
                  key={
                    group.range
                  }
                >
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {
                        group.range
                      }
                    </span>

                    <span>
                      {
                        group.count
                      }{" "}
                      Anak
                    </span>
                  </div>

                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${
                          (group.count /
                            max) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {statsLoading && (
              <div className="text-sm text-slate-400">
                Memuat…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= TREND ================= */}

      <div className="mb-3.5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="mb-4 text-lg font-semibold">
            Tren Stunting (
            {trend.length || 6}
            {" "}
            Bulan Terakhir)
          </div>

          {trendDirection && (
            <span
              className={`
                rounded-full
                px-2.5 py-1
                text-xs font-medium
                ${
                  trendDirection.positive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {trendDirection.positive
                ? "↗"
                : "↘"}{" "}
              {
                trendDirection.label
              }
            </span>
          )}
        </div>

        <ResponsiveContainer
          width="100%"
          height={260}
        >
          <AreaChart
            data={trend}
          >
            <defs>
              <linearGradient
                id="trendFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2563eb"
                  stopOpacity={0.25}
                />

                <stop
                  offset="100%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#eef2f7"
            />

            <XAxis
              dataKey="month"
              tick={{
                fontSize: 11,
              }}
            />

            <YAxis
              tick={{
                fontSize: 11,
              }}
              allowDecimals={false}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="total"
              name="Total Pemeriksaan"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#trendFill)"
              dot={{
                r: 3,
                fill: "#2563eb",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {trendLoading && (
          <div className="text-sm text-slate-400">
            Memuat…
          </div>
        )}

        {!trendLoading &&
          trend.length === 0 && (
            <div className="text-sm text-slate-400">
              Belum ada data trend
              untuk periode ini.
            </div>
          )}
      </div>

      {/* ================= PATIENT TABLE ================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-lg font-semibold">
            Daftar Anak dengan Status Stunting
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <input
              className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              placeholder="Cari nama atau NIK…"
              value={
                searchInput
              }
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  setPage(1);
                  setSearch(
                    searchInput
                  );
                }
              }}
            />

            <button
              onClick={
                handleExportCsv
              }
              title="Unduh data tabel ini sebagai file Excel (.csv)"
              className="
                flex items-center
                gap-1.5
                whitespace-nowrap
                rounded-lg
                border border-slate-200
                bg-green-500
                px-3 py-2
                text-sm text-white
                hover:bg-green-600
              "
            >
              <Download className="h-4 w-4" />
              Excel
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
                ].map((header) => (
                  <th
                    key={
                      header
                    }
                    className="
                      whitespace-nowrap
                      border-b border-slate-200
                      px-3 py-2.5
                      text-left
                      font-semibold
                      text-slate-600
                    "
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {patientsLoading && (
                <tr>
                  <td
                    className="px-3 py-8 text-center text-slate-500"
                    colSpan={7}
                  >
                    Memuat data
                    pemeriksaan…
                  </td>
                </tr>
              )}

              {!patientsLoading &&
                patients.length ===
                  0 && (
                  <tr>
                    <td
                      className="px-3 py-8 text-center text-slate-400"
                      colSpan={7}
                    >
                      Tidak ada
                      data
                      pemeriksaan
                      ditemukan.
                    </td>
                  </tr>
                )}

              {!patientsLoading &&
                patients.map(
                  (patient) => (
                    <tr
                      key={
                        patient.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 font-medium">
                        {
                          patient.name
                        }
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                        {calcUsia(
                          patient.birth_date
                        )}
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                        {
                          patient.latest_weight ??
                          "-"
                        }
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                        {
                          patient.latest_height ??
                          "-"
                        }
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                        {
                          patient.latest_zscore ??
                          "-"
                        }
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                        {patient.latest_status ? (
                          <span
                            className={`
                              rounded-full
                              px-2.5 py-1
                              text-xs font-medium
                              ${getStatusClass(
                                patient.latest_status
                              )}
                            `}
                          >
                            {
                              patient.latest_status
                            }
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            -
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5">
                        {patient.latest_exam_date
                          ? new Date(
                              patient.latest_exam_date
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>

        {/* ================= TABLE FOOTER ================= */}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs text-slate-500">
            Menampilkan{" "}
            {patients.length}{" "}
            dari{" "}
            {meta.total_items}{" "}
            data pemeriksaan
          </span>

          <div className="flex gap-1.5 print:hidden">
            <button
              className="
                rounded-md
                border border-slate-200
                bg-white
                px-3 py-1.5
                text-xs
                disabled:opacity-40
              "
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  (currentPage) =>
                    Math.max(
                      1,
                      currentPage -
                        1
                    )
                )
              }
            >
              Prev
            </button>

            <span className="px-1 py-1.5 text-xs text-slate-600">
              {
                meta.current_page
              }{" "}
              /{" "}
              {meta.total_pages ||
                1}
            </span>

            <button
              className="
                rounded-md
                border border-slate-200
                bg-white
                px-3 py-1.5
                text-xs
                disabled:opacity-40
              "
              disabled={
                page >=
                (meta.total_pages ||
                  1)
              }
              onClick={() =>
                setPage(
                  (currentPage) =>
                    currentPage +
                    1
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 print:hidden">
        <span>
          ©{" "}
          {new Date().getFullYear()}{" "}
          Posyandu Digital.
          All data encrypted
          and secured.
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

type Accent =
  | "blue"
  | "red"
  | "amber"
  | "green";

const ACCENT_CLASSES: Record<
  Accent,
  string
> = {
  blue: "bg-blue-100 text-blue-600",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-600",
  green:
    "bg-green-100 text-green-600",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: Accent;
  badge?: {
    text: string;
    positive: boolean;
  };
  footnote?: string;
}

function StatCard({
  label,
  value,
  icon,
  accent,
  badge,
  footnote,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div
          className={`
            flex h-10 w-10
            items-center justify-center
            rounded-[10px]
            text-lg
            ${ACCENT_CLASSES[accent]}
          `}
        >
          {icon}
        </div>

        {badge && (
          <span
            className={`
              rounded-full
              px-2 py-0.5
              text-xs
              font-medium
              ${
                badge.positive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            `}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div className="mt-3 text-xl font-bold">
        {value}
      </div>

      <div className="mt-0.5 text-xs text-slate-500">
        {label}
      </div>

      {footnote && (
        <div className="mt-1.5 text-xs text-slate-400">
          {footnote}
        </div>
      )}
    </div>
  );
}