"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiEdit2,
  FiPrinter,
} from "react-icons/fi";

// ── DATA DUMMY PASIEN UNTUK FALLBACK PREVIEW ───────────────────────────
const DUMMY_PATIENTS_DETAIL: Record<string, any> = {
  "pasien-001": {
    id: "pasien-001",
    nik: "3273011205240001",
    name: "Ahmad Rayhan",
    birth_date: "2024-05-12",
    gender: "Laki-laki",
    mother_name: "Siti Nurhaliza",
    father_name: "Budi Santoso",
    phone_parent: "081234567890",
    address: "Jl. Soekarno Hatta No. 123, RT 02/RW 01, Bandung",
    picture: null,
  },
  "pasien-002": {
    id: "pasien-002",
    nik: "3273014108240002",
    name: "Aisha Az-Zahra",
    birth_date: "2024-08-15",
    gender: "Perempuan",
    mother_name: "Rina Astuti",
    father_name: "Hendra Wijaya",
    phone_parent: "085712345678",
    address: "Jl. Asia Afrika No. 45, RT 01/RW 03, Bandung",
    picture: null,
  },
  "pasien-003": {
    id: "pasien-003",
    nik: "3273012011250003",
    name: "Muhammad Kenzie",
    birth_date: "2025-11-20",
    gender: "Laki-laki",
    mother_name: "Dewi Lestari",
    father_name: "Rizky Pratama",
    phone_parent: "089698765432",
    address: "Jl. Riau No. 88, RT 04/RW 02, Bandung",
    picture: null,
  },
};

const DEFAULT_DUMMY_PATIENT = DUMMY_PATIENTS_DETAIL["pasien-001"];

export default function PatientDetailPage() {
  const { id } = useParams();

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPatient() {
      // PERBAIKAN TS2538: Memastikan patientId selalu bertipe string, tidak pernah undefined
      const rawId = Array.isArray(id) ? id[0] : id;
      const patientId = rawId ?? "";

      try {
        const token = localStorage.getItem("token");

        // Jika tidak ada token (belum login/offline), langsung gunakan dummy data
        if (!token) {
          setPatient(DUMMY_PATIENTS_DETAIL[patientId] || DEFAULT_DUMMY_PATIENT);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/detail/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        console.log(result);

        if (result.success && result.data) {
          setPatient(result.data);
        } else {
          // Fallback jika API mengembalikan success: false
          setPatient(DUMMY_PATIENTS_DETAIL[patientId] || DEFAULT_DUMMY_PATIENT);
        }
      } catch (err) {
        console.error(err);
        // Fallback jika terjadi koneksi error ke server
        setPatient(DUMMY_PATIENTS_DETAIL[patientId] || DEFAULT_DUMMY_PATIENT);
      } finally {
        setLoading(false);
      }
    }

    if (id) getPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10">
        Memuat data pasien...
      </div>
    );
  }

  const ageMonths = patient?.birth_date
    ? dayjs().diff(dayjs(patient.birth_date), "month")
    : 0;

  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <div>
        <Link
          href="/patient"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Kembali ke Data Pasien
        </Link>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">

        <div className="flex justify-between">

          {/* kiri */}
          <div className="flex gap-6">

            {/* Foto */}
            <div className="flex flex-col items-center">
              <img
                src={patient?.picture || "/default-avatar.png"}
                alt={patient?.name}
                className="h-28 w-28 rounded-full object-cover border"
              />

              <span className="mt-3 rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold text-blue-700">
                PASIEN AKTIF
              </span>
            </div>

            {/* Biodata */}
            <div>

              <h1 className="text-3xl font-bold text-gray-800">
                {patient?.name}
              </h1>

              <p className="text-gray-500 mt-1">
                NIK : {patient?.nik}
              </p>

              <div className="grid grid-cols-2 gap-x-12 gap-y-5 mt-8">

                <div>
                  <p className="text-xs uppercase text-gray-400">
                    Nama Orang Tua
                  </p>
                  <p className="font-medium text-gray-700">
                    {patient?.mother_name} / {patient?.father_name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400">
                    No. WA Ortu
                  </p>
                  <p className="font-medium text-blue-600">
                    {patient?.phone_parent}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400">
                    Tanggal Lahir
                  </p>
                  <p className="font-medium text-gray-700">
                    {patient?.birth_date ? dayjs(patient.birth_date).format("DD MMMM YYYY") : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400">
                    Usia
                  </p>
                  <p className="font-medium text-gray-700">
                    {years} tahun {months} bulan
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400">
                    Jenis Kelamin
                  </p>
                  <p className="font-medium text-gray-700">
                    {patient?.gender}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-400">
                    Alamat
                  </p>
                  <p className="font-medium text-gray-700">
                    {patient?.address}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* kanan */}
          <div className="flex flex-col gap-3">

            <Link
              href={`/patient/${patient?.id || id}/edit`}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              <FiEdit2 />
              Edit Profil
            </Link>

            <button className="flex items-center gap-2 rounded-xl border px-5 py-3 text-gray-700 hover:bg-gray-50">
              <FiPrinter />
              Cetak KMS
            </button>

          </div>

        </div>

      </div>

      {/* Navigation Tab */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8 text-sm font-medium">
          <button className="border-b-2 border-blue-600 pb-3 text-blue-600">
            Riwayat Pemeriksaan
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Trend BB */}
        <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">

          <p className="text-xs uppercase tracking-wider text-blue-100">
            Tren Berat Badan
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            -
          </h2>

          <p className="mt-2 text-sm text-blue-100">
            Belum tersedia data
          </p>

        </div>

        {/* Jadwal */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <p className="text-xs uppercase tracking-wider text-gray-400">
            Pemeriksaan Berikutnya
          </p>

          <h2 className="mt-3 text-xl font-semibold text-gray-800">
            -
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Belum ada jadwal
          </p>

        </div>

        {/* Imunisasi */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <p className="text-xs uppercase tracking-wider text-gray-400">
            Status Imunisasi
          </p>

          <h2 className="mt-3 text-xl font-semibold text-gray-800">
            -
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Belum tersedia
          </p>

        </div>

      </div>

      {/* Log Pemeriksaan */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

          <h2 className="text-lg font-semibold text-gray-800">
            Log Pemeriksaan Rutin
          </h2>

          <div className="flex gap-2">

            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Filter
            </button>

            <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Download
            </button>

          </div>

        </div>

        {/* Table */}
        <table className="w-full">

          <thead className="bg-gray-50">

            <tr className="text-left text-xs uppercase tracking-wider text-gray-500">

              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">BB (Kg)</th>
              <th className="px-6 py-4">TB (Cm)</th>
              <th className="px-6 py-4">LILA</th>
              <th className="px-6 py-4">Z-Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Pemeriksa</th>
              <th className="px-6 py-4 text-center">Aksi</th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td
                colSpan={8}
                className="py-20 text-center text-gray-400"
              >
                Belum ada riwayat pemeriksaan.
              </td>

            </tr>

          </tbody>

        </table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">

          <p className="text-sm text-gray-500">
            Menampilkan 0 pemeriksaan
          </p>

          <div className="flex gap-2">

            <button className="rounded-lg border px-4 py-2 text-sm text-gray-400">
              Sebelumnya
            </button>

            <button className="rounded-lg border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              Berikutnya
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}