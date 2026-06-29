"use client";

import React, { useState, useEffect } from "react";
import {
  FiUsers, FiActivity, FiAlertTriangle, FiCalendar,
  FiPlus, FiTrendingUp, FiTrendingDown, FiChevronDown,
  FiX, FiLoader, FiCheckCircle
} from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrendStuntingItem {
  month: string;
  total: number;
  stunting: number;
  percentage: number;
}

interface DistribusiItem { label: string; pct: number; color: string; }

interface DashboardStats {
  totalPatients: number;
  totalExaminationsThisMonth: number;
  stuntingCount: number;
  normalCount: number;
  ageGroupDistribution: { range: string; count: number }[];
}

interface Patient {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  examination?: { id: string; stunting_status?: string }[];
}

interface ExamForm {
  patient_id: string;
  exam_date: string;
  weight: string;
  height: string;
  head_circumference: string;
  arm_circumference: string;
  notes: string;
}

interface AgeGroup {
  range: string;
  count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("token");
}

// Semua request ke ngrok butuh header ini, kalau tidak response-nya
// adalah HTML warning page (bukan JSON) → parsing gagal → loading terus
function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type":                "application/json",
    "Authorization":               `Bearer ${token}`,
    "ngrok-skip-browser-warning":  "true",
  };
}

function calcAgeMonths(birthDate: string): string {
  if (!birthDate) return "-";
  const birth = new Date(birthDate);
  const now   = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 1) return "< 1 bln";
  if (months < 12) return `${months} bln`;
  const years = Math.floor(months / 12);
  const rem   = months % 12;
  return rem > 0 ? `${years} thn ${rem} bln` : `${years} thn`;
}

const AGE_COLORS = ["#3B82F6", "#60A5FA", "#BFDBFE", "#93C5FD", "#E5E7EB"];

function buildDistribusi(dist: { range: string; count: number }[]): DistribusiItem[] {
  const total = dist.reduce((s, d) => s + d.count, 0) || 1;
  return dist.map((d, i) => ({
    label: d.range,
    pct:   Math.round((d.count / total) * 100),
    color: AGE_COLORS[i % AGE_COLORS.length],
  }));
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType; iconBg: string; label: string;
  value: string | number; delta?: number; deltaLabel?: string;
  sub?: string; badge?: string;
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
          <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{badge}</span>
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

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ data, total }: { data: DistribusiItem[]; total: number }) {
  const r = 54, cx = 70, cy = 70;
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
          <circle key={d.label} cx={cx} cy={cy} r={r}
            fill="none" stroke={d.color} strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1F2937">
        {total.toLocaleString("id-ID")}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9CA3AF">Balita</text>
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusMap: Record<string, string> = {
  Normal:              "bg-green-100 text-green-700",
  Stunted:             "bg-red-100 text-red-600",
  SeverelyStunted:     "bg-red-200 text-red-700",
  Stunting:            "bg-red-100 text-red-600",
  Risiko:              "bg-yellow-100 text-yellow-700",
};

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "SeverelyStunted" ? "Severely Stunted" :
    status === "Stunted"         ? "Stunting" :
    status;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusMap[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

// ─── Examination Modal ────────────────────────────────────────────────────────

interface ExamModalProps {
  patients: Patient[];
  preselectedId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ExamModal({ patients, preselectedId, onClose, onSuccess }: ExamModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const userId = localStorage.getItem("user_id") ?? "";

  const [form, setForm] = useState<ExamForm>({
    patient_id:         preselectedId ?? "",
    exam_date:          today,
    weight:             "",
    height:             "",
    head_circumference: "",
    arm_circumference:  "",
    notes:              "",
  });

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [result,   setResult]   = useState<any | null>(null);

  const set = (field: keyof ExamForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) { setError("Token tidak ditemukan. Silakan login ulang."); return; }
    if (!form.patient_id) { setError("Pilih pasien terlebih dahulu."); return; }

    setLoading(true);
    try {
      const body = {
        exam_date:          form.exam_date,
        patient_id:         form.patient_id,
        user_id:            userId,
        weight:             parseFloat(form.weight),
        height:             parseFloat(form.height),
        head_circumference: parseFloat(form.head_circumference),
        arm_circumference:  parseFloat(form.arm_circumference),
        notes:              form.notes || null,
      };

      const res = await fetch(
        "https://stylar-nonseverable-denver.ngrok-free.dev/api/pemeriksaan/add",
        {
          method:  "POST",
          headers: authHeaders(token),
          body: JSON.stringify(body),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Gagal menyimpan pemeriksaan.");
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPatient = patients.find(p => p.id === form.patient_id);

  // ── Result screen ──
  if (result) {
    const stStatus = result.stunting_status ?? "-";
    const waStatus = result.wasting_status   ?? "-";
    const uwStatus = result.underweight_status ?? "-";

    const stColor =
      stStatus.toLowerCase().includes("stunted") ? "text-red-600 font-bold" :
      "text-green-600 font-bold";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">Hasil Pemeriksaan</h2>
            <button onClick={() => { onSuccess(); onClose(); }} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Usia</span><span className="font-medium">{result.age_months} bulan</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Z-Score TB/U</span><span className="font-medium">{result.height_for_age_zscore?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Z-Score BB/U</span><span className="font-medium">{result.weight_for_age_zscore?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Z-Score BB/TB</span><span className="font-medium">{result.weight_for_height_zscore?.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            {[
              { label: "Status Stunting", value: stStatus,  cls: stColor },
              { label: "Status Wasting",  value: waStatus,  cls: "font-semibold text-gray-700" },
              { label: "Status BB",       value: uwStatus,  cls: "font-semibold text-gray-700" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 mb-1">{item.label}</p>
                <p className={item.cls}>{item.value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => { onSuccess(); onClose(); }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  // ── Form screen ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Tambah Pemeriksaan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Isi data pengukuran balita</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Pilih Pasien */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pasien *</label>
            <select
              value={form.patient_id}
              onChange={set("patient_id")}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">-- Pilih pasien --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedPatient && (
              <p className="text-xs text-gray-400 mt-1">
                Usia: {calcAgeMonths(selectedPatient.birth_date)} · {selectedPatient.gender}
              </p>
            )}
          </div>

          {/* Tanggal Periksa */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal Pemeriksaan *</label>
            <input
              type="date" value={form.exam_date} onChange={set("exam_date")} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Data antropometri*/}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Data *</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: "weight"            , label: "Berat Badan (kg)", placeholder: "cth: 8.5"  },
                { field: "height"            , label: "Tinggi Badan (cm)", placeholder: "cth: 72.0" },
                { field: "head_circumference", label: "Lingkar Kepala (cm)", placeholder: "cth: 44.0" },
                { field: "arm_circumference" , label: "Lingkar Lengan (cm)", placeholder: "cth: 14.5" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number" step="0.1" min="0"
                    placeholder={placeholder}
                    value={form[field as keyof ExamForm]}
                    onChange={set(field as keyof ExamForm)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan</label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              placeholder="Catatan tambahan (opsional)..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><FiLoader className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : (
                "Simpan Pemeriksaan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BASE_URL = "https://stylar-nonseverable-denver.ngrok-free.dev";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPasien:          0,
    pemeriksaanBulan:     0,
    kasusStunting:        0,
    pasienNormal:         0,
    jadwalHariIni:        0
  });

  const [distribusiUmur, setDistribusiUmur] = useState<DistribusiItem[]>([]);

  const [patients,        setPatients]        = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [allPatients,     setAllPatients]     = useState<Patient[]>([]); // for modal dropdown
  const [trendFilter]     = useState("6 Bulan Terakhir");

  const [showModal,        setShowModal]        = useState(false);
  const [preselectedPatId, setPreselectedPatId] = useState<string | undefined>();

const [trendData, setTrendData] = useState<TrendStuntingItem[]>([]);

useEffect(() => {
  const token = getToken();
  if (!token) return;

  fetch(`${BASE_URL}/api/dashboard/trend-stunting`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  })
    .then(res => res.json())
    .then(json => {
      if (json.success) {
        setTrendData(json.data ?? []);
      }
    })
    .catch(console.error);
}, []);   

  // ── Fetch dashboard stats ──
  useEffect(() => {
    const token = getToken();
    
    if (!token) return;

    console.log("TOKEN:", token);
console.log("AUTH:", `Bearer ${token}`);

    fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  },
    })
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;

        const ageData: AgeGroup[] = json.data.ageGroupDistribution;

        const total = ageData.reduce(
          (sum, item) => sum + item.count,
          0
        );

        const colors = [
          "#3B82F6",
          "#60A5FA",
          "#BFDBFE",
          "#93C5FD",
          "#E5E7EB",
        ];

        setDistribusiUmur(
          ageData.map((item, index) => ({
            label: item.range,
            pct: Math.round((item.count / total) * 100),
            color: colors[index % colors.length],
          }))
        );

        const d: DashboardStats = json.data;

        // Animate count-up
        const targets = {
          totalPasien:      d.totalPatients,
          pemeriksaanBulan: d.totalExaminationsThisMonth,
          kasusStunting:    d.stuntingCount,
          pasienNormal:     d.normalCount,
          jadwalHariIni:    0, // dashboard API doesn't return this, keeps from today-patients
        };
        const steps = 40;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const ease = 1 - Math.pow(1 - step / steps, 3);
          setStats(prev => ({
            totalPasien:      Math.round(targets.totalPasien      * ease),
            pemeriksaanBulan: Math.round(targets.pemeriksaanBulan * ease),
            kasusStunting:    Math.round(targets.kasusStunting     * ease),
            pasienNormal:     Math.round(targets.pasienNormal      * ease),
            jadwalHariIni:    prev.jadwalHariIni, // set later from today-patients
          }));
          if (step >= steps) clearInterval(timer);
        }, 900 / steps);

        // Age distribution
        if (d.ageGroupDistribution?.length) {
          setDistribusiUmur(buildDistribusi(d.ageGroupDistribution));
        }
      })
      .catch(console.error);
  }, []);

  // ── Fetch today patients ──
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    console.log("TOKEN:", token);
    console.log("AUTH:", `Bearer ${token}`);

    setLoadingPatients(true);
    fetch(`${BASE_URL}/api/pasien/all-today-patients`, {
      headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  },
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const items: Patient[] = json.data.items ?? [];
          setPatients(items);
          setStats(prev => ({ ...prev, jadwalHariIni: items.length }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPatients(false));
  }, []);

  // ── Fetch all patients (for modal dropdown) ──
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    console.log("TOKEN:", token);
console.log("AUTH:", `Bearer ${token}`);

    fetch(`${BASE_URL}/api/pasien/all`, {
      headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
  },
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) setAllPatients(json.data.items ?? []);
      })
      .catch(console.error);
  }, []);

  function openModalFor(patientId?: string) {
    setPreselectedPatId(patientId);
    setShowModal(true);
  }

  function refreshTodayPatients() {
    const token = getToken();
    if (!token) return;
    fetch(`${BASE_URL}/api/pasien/all-today-patients`, {
      headers: authHeaders(token),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) setPatients(json.data.items ?? []);
      })
      .catch(console.error);
  }

  return (
    <div className="space-y-6">
      {/* Modal */}
      {showModal && (
        <ExamModal
          patients={allPatients.length > 0 ? allPatients : patients}
          preselectedId={preselectedPatId}
          onClose={() => setShowModal(false)}
          onSuccess={refreshTodayPatients}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Ringkasan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Selamat datang kembali, berikut statistik kesehatan terkini.
          </p>
        </div>
        <button
          onClick={() => openModalFor(undefined)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Tambah Pemeriksaan
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard icon={FiUsers}         iconBg="#3B82F6" label="Total Pasien"
          value={stats.totalPasien.toLocaleString("id-ID")} delta={4} />
        <StatCard icon={FiActivity}      iconBg="#8B5CF6" label="Pemeriksaan Bulan Ini"
          value={stats.pemeriksaanBulan} delta={12} deltaLabel="🎯 Target: 100 pemeriksaan" />
        <StatCard icon={FiAlertTriangle} iconBg="#EF4444" label="Kasus Stunting Aktif"
          value={stats.kasusStunting} delta={-2} badge="PERLU INTERVENSI" />
        <StatCard icon={FiCheckCircle} iconBg="#55ef44" label="Pasien Normal"
          value={stats.pasienNormal} delta={2} />
        <StatCard icon={FiCalendar}      iconBg="#10B981" label="Jadwal Hari Ini"
          value={stats.jadwalHariIni}
          sub={new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Tren Stunting Bulanan</h2>
            <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              {trendFilter}<FiChevronDown className="w-3 h-3" />
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
              <Line type="monotone" dataKey="kasus" stroke="#3B82F6" strokeWidth={2.5}
                dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Distribusi Kelompok Umur</h2>
          <div className="flex flex-col items-center gap-4">
            <DonutChart data={distribusiUmur} total={stats.totalPasien || 0} />
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

      {/* Today's Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">Jadwal Pemeriksaan Hari Ini</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loadingPatients ? "Memuat..." : `${patients.length} pasien terdaftar`}
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left font-semibold">Nama Pasien</th>
              <th className="px-5 py-3 text-left font-semibold">Usia</th>
              <th className="px-5 py-3 text-left font-semibold">Jenis Pemeriksaan</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loadingPatients ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  <FiLoader className="w-5 h-5 animate-spin mx-auto mb-1" />
                  Memuat data pasien...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Tidak ada jadwal pemeriksaan hari ini.
                </td>
              </tr>
            ) : (
              patients.map((row) => {
                const isChecked   = row.examination && row.examination.length > 0;
                const examStatus  = row.examination?.[0]?.stunting_status;

                return (
                  <tr key={row.id} className="border-t border-gray-50 hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-blue-500">
                          {row.name ? row.name.substring(0, 2).toUpperCase() : "PS"}
                        </div>
                        <span className="font-medium text-gray-800">{row.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-gray-500">
                      {calcAgeMonths(row.birth_date)}
                    </td>

                    <td className="px-5 py-3 text-gray-600">Rutin Bulanan</td>

                    <td className="px-5 py-3">
                      {isChecked ? (
                        <StatusBadge status={examStatus ?? "Normal"} />
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          Belum Diperiksa
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      {isChecked ? (
                        <button disabled
                          className="text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-md cursor-not-allowed">
                          Selesai
                        </button>
                      ) : (
                        <button
                          onClick={() => openModalFor(row.id)}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors">
                          Periksa
                        </button>
                      )}
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