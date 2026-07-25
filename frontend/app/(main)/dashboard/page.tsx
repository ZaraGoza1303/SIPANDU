"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearch } from "../layout";

import {
  FiUsers,
  FiAlertTriangle,
  FiCalendar,
  FiChevronDown,
  FiX,
  FiLoader,
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiTrendingUp,
} from "react-icons/fi";

import { MdOutlineMonitorHeart } from "react-icons/md";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

const BASE_URL = "https://taps-quiet-subtly.ngrok-free.dev";

interface TrendStuntingItem { month: string; total: number; stunting: number; percentage: number; }
interface DistribusiItem { label: string; pct: number; color: string; }
interface DashboardStats {
  totalPatients: number;
  totalExaminationsThisMonth: number;
  stuntingCount: number;
  normalCount: number;
  ageGroupDistribution: { range: string; count: number }[];
}
interface Patient {
  id: string; name: string; birth_date: string; gender: string;
  examination?: { id: string; stunting_status?: string }[];
}
interface ExamForm {
  patient_id: string; exam_date: string; weight: string; height: string;
  head_circumference: string; arm_circumference: string; notes: string;
}
interface AgeGroup { range: string; count: number; }
interface ToastItem { id: number; type: "success" | "error" | "info"; message: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null { return localStorage.getItem("token"); }
function authHeaders(token: string): Record<string, string> {
  return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
}
function calcAgeMonths(birthDate: string): string {
  if (!birthDate) return "-";
  const birth = new Date(birthDate); const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return "< 1 bln";
  if (months < 12) return `${months} bln`;
  const years = Math.floor(months / 12); const rem = months % 12;
  return rem > 0 ? `${years} thn ${rem} bln` : `${years} thn`;
}
function buildDistribusi(dist: { range: string; count: number }[]): DistribusiItem[] {
  const colors = ["#3B82F6", "#60A5FA", "#BFDBFE", "#93C5FD", "#E5E7EB"];
  const total = dist.reduce((s, d) => s + d.count, 0) || 1;
  return dist.map((d, i) => ({ label: d.range, pct: Math.round((d.count / total) * 100), color: colors[i % colors.length] }));
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, remove }: { toasts: ToastItem[]; remove: (id: number) => void }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white animate-in slide-in-from-right-5 fade-in duration-300 ${
            t.type === "success" ? "bg-green-500" :
            t.type === "error"   ? "bg-red-500"   : "bg-blue-500"
          }`}
        >
          <span className="mt-0.5 text-base">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <p className="flex-1 leading-snug">{t.message}</p>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 transition">
            <FiX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = useCallback((type: ToastItem["type"], message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, remove, toast: { success: (m: string) => add("success", m), error: (m: string) => add("error", m), info: (m: string) => add("info", m) } };
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

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, badge, trend, trendUp, progress, progressLabel, avatarCount }: StatCardProps)  {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between mb-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? "text-green-500" : "text-red-500"}`}>
            {trendUp ? <FiTrendingUp size={11} /> : <FiChevronDown size={11} />}
            {trend}
          </span>
        )}
        {sub && !trend && <span className="text-xs text-gray-400">{sub}</span>}
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusMap: Record<string, { cls: string; label: string }> = {
  Normal:          { cls: "bg-green-100 text-green-700",  label: "Normal"           },
  Stunted:         { cls: "bg-red-100 text-red-600",      label: "Stunting"         },
  SeverelyStunted: { cls: "bg-red-200 text-red-700",      label: "Severely Stunted" },
  Stunting:        { cls: "bg-red-100 text-red-600",      label: "Stunting"         },
  Risiko:          { cls: "bg-yellow-100 text-yellow-700", label: "Risiko"          },
};
function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { cls: "bg-gray-100 text-gray-500", label: status };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
}

// ─── Exam Modal ───────────────────────────────────────────────────────────────

interface ExamModalProps {
  patients: Patient[]; preselectedId?: string;
  onClose: () => void; onSuccess: (patientId: string, examResult: any) => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}
function ExamModal({ patients, preselectedId, onClose, onSuccess, toast }: ExamModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const userId = localStorage.getItem("user_id") ?? "";
  const [form, setForm] = useState<ExamForm>({
    patient_id: preselectedId ?? "", exam_date: today,
    weight: "", height: "", head_circumference: "", arm_circumference: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const set = (field: keyof ExamForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = "unset"; }; }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) { toast.error("Token tidak ditemukan. Silakan login ulang."); return; }
    if (!form.patient_id) { toast.error("Pilih pasien terlebih dahulu."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/pemeriksaan/add`, {
        method: "POST", headers: authHeaders(token),
        body: JSON.stringify({
          exam_date: form.exam_date, patient_id: form.patient_id, user_id: userId,
          weight: parseFloat(form.weight), height: parseFloat(form.height),
          head_circumference: parseFloat(form.head_circumference),
          arm_circumference: parseFloat(form.arm_circumference),
          notes: form.notes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "Gagal menyimpan pemeriksaan.");
      setResult(json.data);
      toast.success("Pemeriksaan berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPatient = patients.find(p => p.id === form.patient_id);
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition bg-white";

  if (result) {
    const stStatus = result.stunting_status ?? "-";
    const stColor = stStatus.toLowerCase().includes("stunted") ? "text-red-600 font-bold" : "text-green-600 font-bold";
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Hasil Pemeriksaan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Data telah tersimpan</p>
            </div>
            <button onClick={() => { onSuccess(form.patient_id, result); onClose(); }} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
            {[
              { label: "Usia", value: `${result.age_months} bulan` },
              { label: "Z-Score TB/U", value: result.height_for_age_zscore?.toFixed(2) },
              { label: "Z-Score BB/U", value: result.weight_for_age_zscore?.toFixed(2) },
              { label: "Z-Score BB/TB", value: result.weight_for_height_zscore?.toFixed(2) },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-500">{row.label}</span>
                <span className="font-semibold text-gray-800">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            {[
              { label: "Status Stunting", value: stStatus, cls: stColor },
              { label: "Status Wasting",  value: result.wasting_status   ?? "-", cls: "font-semibold text-gray-700" },
              { label: "Status BB",       value: result.underweight_status ?? "-", cls: "font-semibold text-gray-700" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1.5">{item.label}</p>
                <p className={item.cls}>{item.value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { onSuccess(form.patient_id, result); onClose(); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Tambah Pemeriksaan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Isi data pengukuran balita</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pasien *</label>
            <select value={form.patient_id} onChange={set("patient_id")} required className={inputCls}>
              <option value="">-- Pilih pasien --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {selectedPatient && (
              <p className="text-xs text-gray-400 mt-1.5">
                Usia: {calcAgeMonths(selectedPatient.birth_date)} · {selectedPatient.gender}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal Pemeriksaan *</label>
            <input type="date" value={form.exam_date} onChange={set("exam_date")} required className={inputCls} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Data Antropometri *</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: "weight",             label: "Berat Badan (kg)",    placeholder: "cth: 8.5"  },
                { field: "height",             label: "Tinggi Badan (cm)",   placeholder: "cth: 72.0" },
                { field: "head_circumference", label: "Lingkar Kepala (cm)", placeholder: "cth: 44.0" },
                { field: "arm_circumference",  label: "Lingkar Lengan (cm)", placeholder: "cth: 14.5" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input type="number" step="0.1" min="0" placeholder={placeholder}
                    value={form[field as keyof ExamForm]} onChange={set(field as keyof ExamForm)}
                    required className={inputCls} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan</label>
            <textarea value={form.notes} onChange={set("notes")} rows={3}
              placeholder="Catatan tambahan (opsional)..."
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {loading ? <><FiLoader className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Pemeriksaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { toasts, remove, toast } = useToast();
  const { search } = useSearch();

  const [stats, setStats] = useState({ totalPasien: 0, pemeriksaanBulan: 0, kasusStunting: 0, pasienNormal: 0, jadwalHariIni: 0 });
  const [distribusiUmur, setDistribusiUmur] = useState<DistribusiItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [trendData, setTrendData] = useState<TrendStuntingItem[]>([]);
  const [trendFilter, setTrendFilter] = useState("6 Bulan Terakhir");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preselectedPatId, setPreselectedPatId] = useState<string | undefined>();
  const [localSearch, setLocalSearch] = useState("");

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes((search || localSearch).toLowerCase())
  );

  useEffect(() => {
    const token = getToken(); if (!token) return;
    fetch(`${BASE_URL}/api/dashboard/trend-stunting`, { headers: authHeaders(token) })
      .then(r => r.json()).then(json => { if (json.success) setTrendData(json.data ?? []); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const token = getToken(); if (!token) return;
    fetch(`${BASE_URL}/api/dashboard/stats`, { headers: authHeaders(token) })
      .then(r => r.json()).then(json => {
        if (!json.success) return;
        const d: DashboardStats = json.data;
        const targets = { totalPasien: d.totalPatients, pemeriksaanBulan: d.totalExaminationsThisMonth, kasusStunting: d.stuntingCount, pasienNormal: d.normalCount, jadwalHariIni: 0 };
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
      }).catch(console.error);
  }, []);

  useEffect(() => {
    const token = getToken(); if (!token) return;
    setLoadingPatients(true);
    fetch(`${BASE_URL}/api/pasien/all-today-patients`, { headers: authHeaders(token) })
      .then(r => r.json()).then(json => {
        if (json.success) {
          const items: Patient[] = json.data.items ?? [];
          setPatients(items);
          setStats(prev => ({ ...prev, jadwalHariIni: items.length }));
        }
      }).catch(console.error).finally(() => setLoadingPatients(false));
  }, []);

  useEffect(() => {
    const token = getToken(); if (!token) return;
    fetch(`${BASE_URL}/api/pasien/all`, { headers: authHeaders(token) })
      .then(r => r.json()).then(json => { if (json.success) setAllPatients(json.data.items ?? []); })
      .catch(console.error);
  }, []);

  function refreshStats() {
    const token = getToken(); if (!token) return;
    fetch(`${BASE_URL}/api/dashboard/stats`, { headers: authHeaders(token) })
      .then(r => r.json()).then(json => {
        if (!json.success) return;
        const d: DashboardStats = json.data;
        setStats(prev => ({ ...prev, totalPasien: d.totalPatients, pemeriksaanBulan: d.totalExaminationsThisMonth, kasusStunting: d.stuntingCount, pasienNormal: d.normalCount }));
        if (d.ageGroupDistribution?.length) setDistribusiUmur(buildDistribusi(d.ageGroupDistribution));
      }).catch(console.error);
  }

  function refreshTrend() {
    const token = getToken(); if (!token) return;
    fetch(`${BASE_URL}/api/dashboard/trend-stunting`, { headers: authHeaders(token) })
      .then(r => r.json()).then(json => { if (json.success) setTrendData(json.data ?? []); })
      .catch(console.error);
  }

  function handleExamSuccess(patientId: string, examResult: any) {
    setPatients(prev => {
      const exists = prev.find(p => p.id === patientId);
      if (exists) {
        return prev.map(p => p.id === patientId
          ? { ...p, examination: [{ id: examResult.examination_id, stunting_status: examResult.stunting_status }] }
          : p);
      }
      const pat = allPatients.find(p => p.id === patientId);
      return pat ? [...prev, { ...pat, examination: [{ id: examResult.examination_id, stunting_status: examResult.stunting_status }] }] : prev;
    });
    refreshStats(); refreshTrend();
  }

  const todayStr = new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const pemTarget = 100;

  return (
    <div className="space-y-6 pt-2">
      <ToastContainer toasts={toasts} remove={remove} />

      {showModal && (
        <ExamModal
          patients={allPatients.length > 0 ? allPatients : patients}
          preselectedId={preselectedPatId}
          onClose={() => setShowModal(false)}
          onSuccess={handleExamSuccess}
          toast={toast}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Ringkasan</h1>
          <p className="text-sm text-gray-400 mt-1">Selamat datang kembali, berikut statistik kesehatan terkini.</p>
        </div>
        <button
          onClick={() => { setPreselectedPatId(undefined); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-xl transition shadow-sm shadow-blue-200"
        >
          <FiPlus className="w-4 h-4" /> Tambah Pemeriksaan
        </button>
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
    progress={Math.min((stats.totalPasien / 1500) * 100, 100)}
  />

  <StatCard
    icon={MdOutlineMonitorHeart}
    iconBg="#EDE9FE"
    iconColor="#7C3AED"
    label="Pemeriksaan Bulan Ini"
    value={stats.pemeriksaanBulan}
    trend="+12%" trendUp={true}
    progressLabel={`Target: ${pemTarget} pemeriksaan`}
    progress={Math.min((stats.pemeriksaanBulan / pemTarget) * 100, 100)}
  />

  <StatCard
    icon={FiAlertTriangle}
    iconBg="#FEE2E2"
    iconColor="#DC2626"
    label="Kasus Stunting Aktif"
    value={stats.kasusStunting}
    trend="-2%" trendUp={false}
    badge={stats.kasusStunting > 0 ? "PERLU INTERVENSI" : undefined}
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
        {/* Trend */}
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

        {/* Donut */}
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
            <h2 className="font-semibold text-gray-900">Antrean Hari Ini</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loadingPatients ? "Memuat..." : `Menampilkan ${filteredPatients.length} jadwal terdekat`}
            </p>
          </div>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
            Lihat Semua
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="relative">
            <FiSearch className="absolute left-4 top-3 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Cari data pasien atau jadwal..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 transition"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 border-b border-gray-100">
              <th className="px-6 py-3">Nama Pasien</th>
              <th className="px-6 py-3">Usia</th>
              <th className="px-6 py-3">Jenis Pemeriksaan</th>
              <th className="px-6 py-3">Status Kesehatan</th>
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
                const isChecked  = row.examination && row.examination.length > 0;
                const examStatus = row.examination?.[0]?.stunting_status;
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
                    <td className="px-6 py-4 text-gray-600">Rutin Bulanan</td>
                    <td className="px-6 py-4">
                      {isChecked
                        ? <StatusBadge status={examStatus ?? "Normal"} />
                        : <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Belum Diperiksa</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      {isChecked ? (
                        <button disabled className="text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg cursor-not-allowed">
                          Selesai
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setPreselectedPatId(row.id); setShowModal(true); }}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition">
                            Periksa
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition">
                            <FiMoreVertical size={16} />
                          </button>
                        </div>
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