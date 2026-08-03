"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  FiSearch,
  FiPlus,
  FiLoader,
  FiAlertCircle,
  FiEye,
  FiEdit2,
} from "react-icons/fi";

interface Patient {
  id: string;
  nik: string;
  name: string;
  birth_date: string;
  gender: string;
  mother_name: string;
  father_name?: string;
  phone_parent?: string;
  address?: string;
  picture?: string | null;
  status?: string; // Status stunting
}

export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("authToken");

        if (!token) {
          setError("Token tidak ditemukan. Silakan pastikan Anda sudah login.");
          setLoading(false);
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${baseUrl}/api/pasien/all`, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setError("Sesi Anda tidak valid atau telah berakhir (401 Unauthorized).");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Gagal mengambil data dari server (HTTP ${response.status})`);
        }

        const result = await response.json();
        const data = result.data ?? result;

        if (Array.isArray(data)) {
          setPatients(data);
        } else {
          setPatients([]);
        }
      } catch (err: any) {
        console.error("Fetch Patients Error:", err);
        setError(
          err.message ||
            "Gagal terhubung ke server Express. Pastikan backend Anda sudah menyala."
        );
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  // Filter pencarian berdasarkan Nama atau NIK
  const filteredPatients = patients.filter((patient) => {
    const term = searchQuery.toLowerCase();
    const nameMatch = patient.name?.toLowerCase().includes(term);
    const nikMatch = patient.nik?.toLowerCase().includes(term);
    return nameMatch || nikMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pasien</h1>
          <p className="text-sm text-gray-500">Kelola dan lihat data pasien posyandu.</p>
        </div>

        <Link
          href="/patient/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shrink-0"
        >
          <FiPlus className="w-5 h-5" />
          Tambah Pasien
        </Link>
      </div>

      {/* Control Bar (Search) */}
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Error Alert jika server mati / CORS error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-700 border border-red-100 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="flex-1 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold hover:bg-red-200 transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Nama Anak / NIK</th>
                <th className="px-6 py-4">Tanggal Lahir</th>
                <th className="px-6 py-4">Usia</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Nama Ibu</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FiLoader className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Memuat data pasien dari server...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400">
                    {error
                      ? "Gagal memuat data dari server."
                      : "Tidak ada data pasien yang ditemukan."}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const ageMonths = patient.birth_date
                    ? dayjs().diff(dayjs(patient.birth_date), "month")
                    : null;
                  const years = ageMonths !== null ? Math.floor(ageMonths / 12) : null;
                  const months = ageMonths !== null ? ageMonths % 12 : null;

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition">
                      {/* Foto */}
                      <td className="px-6 py-4">
                        <img
                          src={patient.picture || "/default-avatar.png"}
                          alt={patient.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-100 bg-gray-50"
                        />
                      </td>

                      {/* Nama & NIK */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{patient.name || "-"}</p>
                        <p className="text-xs text-gray-400">{patient.nik || "-"}</p>
                      </td>

                      {/* Tanggal Lahir */}
                      <td className="px-6 py-4 text-gray-600">
                        {patient.birth_date
                          ? dayjs(patient.birth_date).format("DD/MM/YYYY")
                          : "-"}
                      </td>

                      {/* Usia */}
                      <td className="px-6 py-4 text-gray-600">
                        {years !== null && months !== null
                          ? years > 0
                            ? `${years} Tahun`
                            : `${months} Bulan`
                          : "-"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {patient.status ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {patient.status}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Nama Ibu */}
                      <td className="px-6 py-4 text-gray-600">
                        {patient.mother_name || "-"}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/patient/${patient.id}`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                            title="Lihat Detail"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/patient/${patient.id}/edit`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition"
                            title="Edit Data"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {!loading && (
          <div className="border-t border-gray-100 px-6 py-4 text-xs text-gray-500">
            Menampilkan {filteredPatients.length} dari {patients.length} total data pasien
          </div>
        )}
      </div>
    </div>
  );
}