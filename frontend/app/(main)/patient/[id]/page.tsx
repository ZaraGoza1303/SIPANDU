"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiEdit2,
  FiPrinter,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { apiFetch, ApiError } from "@/lib/api"; // 👈 Pakai helper api.ts

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Patient {
  id: string;
  nik?: string;
  name?: string;
  birth_date?: string;
  gender?: string;
  mother_name?: string;
  father_name?: string;
  phone_parent?: string;
  address?: string;
  picture?: string | null;
  status?: string;
}

interface Examination {
  id: string | number;
  exam_date?: string;
  created_at?: string;
  weight?: number;
  height?: number;
  head_circumference?: number;
  arm_circumference?: number;
  notes?: string;
  stunting_result?: {
    age_months?: number;
    weight_for_age_zscore?: number;
    height_for_age_zscore?: number;
    weight_for_height_zscore?: number;
    stunting_status?: string;
    wasting_status?: string;
    underweight_status?: string;
  };
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
      const patientId = rawId ?? "";

      if (!patientId) {
        setError("ID Pasien tidak ditemukan pada URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Detail Pasien menggunakan apiFetch (Aman dari Ngrok warning & CORS)
        const patientRes = await apiFetch(`/api/pasien/detail/${patientId}`);
        const patientResult = await patientRes.json();
        const patientData = patientResult.data ?? patientResult;

        if (!patientData || !patientData.id) {
          setError("Data pasien tidak ditemukan di server.");
          setLoading(false);
          return;
        }

        setPatient(patientData);

        // 2. Fetch Riwayat Pemeriksaan Pasien
        try {
          const examRes = await apiFetch(
            `/api/pemeriksaan/patient/${patientId}`
          );

          const examResult = await examRes.json();

          console.log("EXAM RESULT:", examResult);
          console.log("EXAM DATA:", examResult.data);
          console.log("EXAM ITEMS:", examResult.data?.items);

          const examData = examResult.data?.items ?? [];

          setExaminations(
            Array.isArray(examData) ? examData : []
          );
        } catch (examErr) {
          console.warn("Gagal memuat riwayat pemeriksaan:", examErr);
          setExaminations([]);
        }

      } catch (err: any) {
        console.error("Fetch Patient Detail Error:", err);
        
        if (err instanceof ApiError) {
          if (err.status === 401) return; // Otomatis diselesaikan oleh apiFetch (redirect login)
          setError(err.message);
        } else {
          setError("Gagal terhubung ke server. Periksa koneksi backend Anda.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params?.id, router]);

  // ─── STATE LOADING ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-3">
        <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Memuat data dari server...</p>
      </div>
    );
  }

  // ─── STATE ERROR / GAGAL FETCH ─────────────────────────────────────────────
  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/patient"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <FiArrowLeft />
            Kembali ke Data Pasien
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
            <FiAlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Gagal Memuat Detail Pasien</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ─── KALKULASI USIA ────────────────────────────────────────────────────────
  const ageMonths = patient.birth_date
    ? dayjs().diff(dayjs(patient.birth_date), "month")
    : null;

  const years = ageMonths !== null ? Math.floor(ageMonths / 12) : null;
  const months = ageMonths !== null ? ageMonths % 12 : null;

  // Data Pemeriksaan Terbaru
  const latestExam = examinations.length > 0 ? examinations[0] : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/patient"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <FiArrowLeft />
          Kembali ke Data Pasien
        </Link>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center shrink-0">
              <img
                src={patient.picture || "/default-avatar.png"}
                alt={patient.name || "Foto Pasien"}
                className="h-28 w-28 rounded-full object-cover border border-gray-100 bg-gray-50"
              />
              {patient.status && (
                <span className="mt-3 rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold text-blue-700">
                  {patient.status}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">{patient.name || "-"}</h1>
              <p className="text-gray-500 mt-1">NIK : {patient.nik || "-"}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 mt-8">
                <div>
                  <p className="text-xs uppercase text-gray-400 font-medium">Nama Orang Tua</p>
                  <p className="font-medium text-gray-700 mt-0.5">
                    {[patient.mother_name, patient.father_name].filter(Boolean).join(" / ") || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-medium">No. WA Ortu</p>
                  <p className="font-medium text-blue-600 mt-0.5">{patient.phone_parent || "-"}</p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-medium">Tanggal Lahir</p>
                  <p className="font-medium text-gray-700 mt-0.5">
                    {patient.birth_date ? dayjs(patient.birth_date).format("DD MMMM YYYY") : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-medium">Usia</p>
                  <p className="font-medium text-gray-700 mt-0.5">
                    {years !== null && months !== null
                      ? `${years > 0 ? `${years} tahun ` : ""}${months} bulan`
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-medium">Jenis Kelamin</p>
                  <p className="font-medium text-gray-700 mt-0.5">{patient.gender || "-"}</p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400 font-medium">Alamat</p>
                  <p className="font-medium text-gray-700 mt-0.5">{patient.address || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href={`/patient/${patient.id}/edit`}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <FiEdit2 />
              Edit Profil
            </Link>

            <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              <FiPrinter />
              Cetak KMS
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tab */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8 text-sm font-medium">
          <button className="border-b-2 border-blue-600 pb-3 font-semibold text-blue-600">
            Riwayat Pemeriksaan ({examinations.length})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wider text-blue-100 font-medium">BB Terakhir</p>
          <h2 className="mt-3 text-3xl font-bold">
            {latestExam?.weight != null ? `${latestExam.weight} Kg` : "-"}
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            {latestExam?.exam_date
              ? `Pemeriksaan ${dayjs(latestExam.exam_date).format("DD/MM/YYYY")}`
              : "Belum ada riwayat pemeriksaan"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">TB / Tinggi Terakhir</p>
          <h2 className="mt-3 text-xl font-semibold text-gray-800">
           {latestExam?.height != null ? `${latestExam.height} Cm` : "-"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {latestExam ? "Tinggi badan terakhir" : "Belum ada riwayat pemeriksaan"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Status Terakhir</p>
          <h2 className="mt-3 text-xl font-semibold text-gray-800">
            {latestExam?.stunting_result?.stunting_status || "-"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {latestExam?.stunting_result?.height_for_age_zscore ?? "-"}
          </p>
        </div>
      </div>

      {/* Log Tabel Pemeriksaan */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800">Log Pemeriksaan Rutin</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">BB (Kg)</th>
              <th className="px-6 py-4">TB (Cm)</th>
              <th className="px-6 py-4">LILA (Cm)</th>
              <th className="px-6 py-4">Z-Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Pemeriksa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {examinations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  Tidak ada data riwayat pemeriksaan dari server.
                </td>
              </tr>
            ) : (
              examinations.map((exam, index) => {
                const examDate = exam.exam_date || exam.created_at;
                return (
                <tr
                  key={exam.id || index}
                  className="hover:bg-gray-50/50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {examDate
                      ? dayjs(examDate).format("DD MMMM YYYY")
                      : "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {exam.weight ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {exam.height ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {exam.arm_circumference ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {exam.stunting_result?.height_for_age_zscore ?? "-"}
                  </td>

                  <td className="px-6 py-4">
                    {exam.stunting_result?.stunting_status ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        {exam.stunting_result.stunting_status}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    -
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">
            Total {examinations.length} data pemeriksaan ditemukan.
          </p>
        </div>
      </div>
    </div>
  );
}