"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiSearch, FiEye, FiTrash2, FiFilter, FiX } from "react-icons/fi";

type Patient = {
  id: string;
  nik: string;
  name: string;
  birth_date: string;
  gender: string;
  mother_name: string;
  phone_parent: string;
  picture?: string | null;
  stunting_status?: string;
};

export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [ageFilter, setAgeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, []);

  async function fetchPatient() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { alert("Silakan login terlebih dahulu."); return; }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/all?page=1&limit=10&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const result = await response.json();
      if (result.success) setPatients(result.data.items);
    } catch (error) {
      console.log(error);
      alert("Gagal mengambil data pasien.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus pasien ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setPatients((prev) => prev.filter((p) => p.id !== id));
        alert("Pasien berhasil dihapus.");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.log(error);
      alert("Gagal menghapus pasien.");
    }
  }

  function getAge(date: string) {
    const birth = new Date(date);
    const today = new Date();
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      today.getMonth() -
      birth.getMonth();
    return months < 12 ? `${months} Bulan` : `${Math.floor(months / 12)} Tahun`;
  }

  const hasFilter = ageFilter || statusFilter || regionFilter;

  const selectCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <p className="text-sm text-gray-400">
          Pasien /
          <span className="ml-1 font-medium text-blue-600">Data Pasien</span>
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Data Pasien</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola data seluruh pasien terdaftar.</p>
          </div>
          <Link
            href="/patient/add"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            + Tambah Pasien
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-3.5 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPatient()}
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                hasFilter
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FiFilter size={15} />
              Filter
              {hasFilter && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
                  {[ageFilter, statusFilter, regionFilter].filter(Boolean).length}
                </span>
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">Filter Data</p>
                  <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Rentang Usia</label>
                    <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className={selectCls}>
                      <option value="">Semua Usia</option>
                      <option value="0-6">0 – 6 Bulan</option>
                      <option value="7-12">7 – 12 Bulan</option>
                      <option value="13-24">13 – 24 Bulan</option>
                      <option value="25-60">25 – 60 Bulan</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Status Stunting</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                      <option value="">Semua Status</option>
                      <option value="Normal">Normal</option>
                      <option value="Stunted">Stunting</option>
                      <option value="SeverelyStunted">Stunting Berat</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Wilayah / RW</label>
                    <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className={selectCls}>
                      <option value="">Semua Wilayah</option>
                      <option value="RW01">RW 01</option>
                      <option value="RW02">RW 02</option>
                      <option value="RW03">RW 03</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setAgeFilter(""); setStatusFilter(""); setRegionFilter(""); }}
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => { fetchPatient(); setShowFilter(false); }}
                      className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-5 py-4">Foto</th>
              <th className="px-5 py-4">Nama Anak</th>
              <th className="px-5 py-4">Tanggal Lahir</th>
              <th className="px-5 py-4">Usia</th>
              <th className="px-5 py-4">Status Stunting</th>
              <th className="px-5 py-4">Nama Orang Tua</th>
              <th className="px-5 py-4">No WA Ortu</th>
              <th className="px-5 py-4">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg">
                      👶
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800">{patient.name}</p>
                    <p className="text-xs text-gray-400">{patient.nik}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {new Date(patient.birth_date).toLocaleDateString("id-ID")}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-blue-600">
                    {getAge(patient.birth_date)}
                  </td>

                  <td className="px-5 py-4">
                    <StuntingBadge status={patient.stunting_status} />
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">{patient.mother_name}</td>

                  <td className="px-5 py-4 text-sm text-gray-700">{patient.phone_parent}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/patient/${patient.id}`}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <FiEye size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-400">
            Menampilkan <span className="font-medium text-gray-600">{patients.length}</span> data pasien
          </p>
          <button className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 transition">
            1
          </button>
        </div>
      </div>

    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function StuntingBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    Normal:          { label: "Normal",         cls: "bg-green-50 text-green-700" },
    Stunted:         { label: "Stunting",        cls: "bg-yellow-50 text-yellow-700" },
    SeverelyStunted: { label: "Stunting Berat",  cls: "bg-red-50 text-red-700" },
  };

  const { label, cls } = map[status ?? ""] ?? {
    label: "Belum Diperiksa",
    cls: "bg-gray-100 text-gray-500",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}