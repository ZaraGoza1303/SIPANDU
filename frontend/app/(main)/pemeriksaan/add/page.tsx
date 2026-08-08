"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { toast } from "sonner";

export default function AddPemeriksaanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({
    patient_id: "",
    examination_date: new Date().toISOString().split("T")[0],
    examiner: "",
    weight: "",
    height: "",
    head_circumference: "",
    arm_circumference: "",
    systolic: "",
    diastolic: "",
    blood_sugar: "",
    hiv_status: "",
    complaint: "",
    note: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/all?page=1&limit=100`,
      {
        credentials: "include",
      }
    );

    const result = await response.json();

    if (result.success) {
      setPatients(result.data.items);
    }
  } catch (error) {
    console.log(error);
  }
}

async function saveExamination() {
  try {
    setLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pemeriksaan/add`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_date: form.examination_date,
          patient_id: form.patient_id,
          weight: Number(form.weight),
          height: Number(form.height),
          head_circumference: Number(form.head_circumference),
          arm_circumference: Number(form.arm_circumference),
          notes: form.note || null,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("Pemeriksaan berhasil ditambahkan.");
    router.push("/pemeriksaan");
  } catch (error) {
    console.log(error);
    toast.error("Terjadi kesalahan.");
  } finally {
    setLoading(false);
  }
}

  // Reusable class strings
  const inputCls = "w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition";
  const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";
  const sectionTitleCls = "text-xs font-semibold tracking-widest text-blue-600 uppercase";

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/pemeriksaan"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            <FiArrowLeft size={14} />
            Kembali ke Pemeriksaan
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Pemeriksaan</h1>
          <p className="mt-1 text-sm text-gray-500">Masukkan data pemeriksaan balita.</p>
        </div>
        <button
          onClick={saveExamination}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          <FiSave size={15} />
          {loading ? "Menyimpan..." : "Simpan Pemeriksaan"}
        </button>
      </div>

      {/* Informasi Pasien */}
      <Section title="Informasi Pasien">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Pasien</label>
            <select 
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              className={inputCls}
            >
              <option value="">Pilih Pasien</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.nik}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Pemeriksa</label>
            <input
              value={form.examiner}
              onChange={(e) => setForm({ ...form, examiner: e.target.value })}
              placeholder="Nama petugas"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Tanggal Pemeriksaan</label>
            <input
              type="date"
              value={form.examination_date}
              onChange={(e) => setForm({ ...form, examination_date: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      {/* Antropometri */}
      <Section title="Antropometri">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Berat Badan (kg)">
            <input
              type="number" step="0.1"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="Contoh: 12.5"
              className={inputCls}
            />
          </Field>

          <Field label="Tinggi Badan (cm)">
            <input
              type="number" step="0.1"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              placeholder="Contoh: 84.2"
              className={inputCls}
            />
          </Field>

          <Field label="Lingkar Kepala (cm)">
            <input
              type="number" step="0.1"
              value={form.head_circumference}
              onChange={(e) => setForm({ ...form, head_circumference: e.target.value })}
              placeholder="Contoh: 46.0"
              className={inputCls}
            />
          </Field>

          <Field label="LILA (cm)">
            <input
              type="number" step="0.1"
              value={form.arm_circumference}
              onChange={(e) => setForm({ ...form, arm_circumference: e.target.value })}
              placeholder="Contoh: 14.5"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Pemeriksaan Tambahan */}
      <Section title="Pemeriksaan Tambahan">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Tekanan Darah (mmHg)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Sistol"
                value={form.systolic}
                onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                className={inputCls}
              />
              <span className="text-gray-400 font-medium">/</span>
              <input
                type="number"
                placeholder="Diastol"
                value={form.diastolic}
                onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                className={inputCls}
              />
            </div>
          </Field>

          <Field label="Gula Darah (mg/dL)">
            <input
              type="number"
              value={form.blood_sugar}
              onChange={(e) => setForm({ ...form, blood_sugar: e.target.value })}
              placeholder="Contoh: 90"
              className={inputCls}
            />
          </Field>

          <Field label="Status HIV">
            <select
              value={form.hiv_status}
              onChange={(e) => setForm({ ...form, hiv_status: e.target.value })}
              className={inputCls}
            >
              <option value="">Pilih status</option>
              <option value="Negatif">Negatif</option>
              <option value="Positif">Positif</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Keluhan & Catatan */}
      <Section title="Keluhan & Catatan">
        <div className="space-y-5">
          <Field label="Keluhan">
            <textarea
              rows={4}
              value={form.complaint}
              onChange={(e) => setForm({ ...form, complaint: e.target.value })}
              placeholder="Masukkan keluhan pasien..."
              className={inputCls}
            />
          </Field>

          <Field label="Catatan Pemeriksa">
            <textarea
              rows={4}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Catatan tambahan dari pemeriksa..."
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Hasil Analisis */}
      <Section title="Hasil Analisis">
        <div className="grid grid-cols-4 gap-4">
          <AnalysisCard
            label="Status Stunting"
            value="Belum Diproses"
            color="blue"
          />
          <AnalysisCard
            label="Z-Score TB/U"
            value="—"
            color="green"
          />
          <AnalysisCard
            label="IMT"
            value="—"
            color="yellow"
          />
          <AnalysisCard
            label="Risiko"
            value="—"
            color="red"
          />
        </div>
      </Section>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/pemeriksaan")}
          className="rounded-xl border border-red-200 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition"
        >
          Batal
        </button>
        <button
          onClick={saveExamination}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {loading ? "Menyimpan..." : "Simpan Pemeriksaan"}
        </button>
      </div>

    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function AnalysisCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const palette = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-700"   },
    green:  { bg: "bg-green-50",  text: "text-green-700"  },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-700" },
    red:    { bg: "bg-red-50",    text: "text-red-700"    },
  };

  const { bg, text } = palette[color];

  return (
    <div className={`rounded-xl ${bg} p-5`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-3 text-xl font-bold ${text}`}>{value}</p>
    </div>
  );
}