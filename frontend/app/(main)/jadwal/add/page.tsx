"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiFileText,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";
import { apiFetch, ApiError } from "@/lib/api";

export default function AddSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    status: "akan_datang", // Default status lokal form
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Disesuaikan dengan struktur field dari Backend baru (tanpa penanggung jawab)
      const payload = {
        title: formData.title,
        description: formData.notes,
        scheduled_date: formData.date,
        time_start: `${formData.date}T${formData.startTime}:00Z`,
        time_end: `${formData.date}T${formData.endTime}:00Z`,
        location: formData.location,
        status: formData.status,
      };

      // Menggunakan apiFetch (Otomatis membawa Bearer Token & Header Ngrok)
      const response = await apiFetch("/api/pemeriksaan/schedule", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // === DEBUGGING ERROR 400 (BAD REQUEST) ===
        console.log("=== DETAIL ERROR DARI BACKEND ===");
        console.log("Status:", response.status);
        console.log("Response Body:", result);
        console.log("==================================");

        alert(result.message || result.error || "Gagal menyimpan jadwal. Cek Console browser untuk detail.");
        return;
      }

      alert("Jadwal berhasil ditambahkan!");
      router.push("/jadwal");
    } catch (err: any) {
      console.error(err);
      if (err instanceof ApiError) {
        if (err.status === 401) return; // Ditangani otomatis oleh apiFetch (redirect login)
        alert(err.message);
      } else {
        alert("Terjadi kesalahan koneksi saat menyimpan jadwal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/jadwal"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <FiArrowLeft />
          Kembali ke Jadwal
        </Link>

        <h1 className="mt-4 text-3xl text-gray-800 font-bold">
          Tambah Jadwal Posyandu
        </h1>
        <p className="mt-1 text-gray-500">
          Buat jadwal kegiatan rutin posyandu balita.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        
        {/* Nama Kegiatan */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiActivity className="text-gray-400"/> Nama Kegiatan
          </label>
          <input
            required
            type="text"
            placeholder="Misal: Posyandu Balita Rutin RW 05"
            className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiCalendar className="text-gray-400"/> Tanggal Pelaksanaan
            </label>
            <input
              required
              type="date"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiClock className="text-gray-400"/> Waktu Mulai
            </label>
            <input
              required
              type="time"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiClock className="text-gray-400"/> Waktu Selesai
            </label>
            <input
              required
              type="time"
              className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>
        </div>

        {/* Lokasi */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiMapPin className="text-gray-400"/> Lokasi Posyandu
          </label>
          <input
            required
            type="text"
            placeholder="Misal: Gedung Serbaguna Desa"
            className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        {/* Status Pelaksanaan */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiCheckCircle className="text-gray-400"/> Status Pelaksanaan
          </label>
          <select
            className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="akan_datang">Akan Datang (Upcoming)</option>
            <option value="aktif">Aktif</option>
            <option value="berlangsung">Sedang Berlangsung (Ongoing)</option>
            <option value="selesai">Selesai (Completed)</option>
            <option value="dibatalkan">Dibatalkan (Cancelled)</option>
          </select>
        </div>

        {/* Keterangan */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiFileText className="text-gray-400"/> Keterangan Tambahan
          </label>
          <textarea
            rows={3}
            placeholder="Opsional: Tambahkan catatan khusus seperti 'Harap membawa Buku KIA'"
            className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Jadwal"}
          </button>
        </div>

      </form>
    </div>
  );
}