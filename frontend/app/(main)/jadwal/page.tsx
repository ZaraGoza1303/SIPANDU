"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiLoader, FiAlertCircle, FiCheckCircle, FiLock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Header from "./components/Header";
import CalendarStrip from "./components/CalendarStrip";
import ReminderPanel from "./components/ReminderPanel";
import { apiFetch, ApiError } from "@/lib/api";

type ScheduleItem = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  services: string[];
  notes?: string;
  status: "akan_datang" | "berlangsung" | "dibatalkan" | "selesai" | string;
  petugasPJ?: string;
};

// 4 DATA DUMMY (Limit 2 per halaman, jadi pas ada 2 halaman)
const DUMMY_SCHEDULES: ScheduleItem[] = [
  { id: "1", title: "Posyandu Balita Mawar (Halaman 1)", date: "2026-08-01", startTime: "08:00", endTime: "11:00", location: "Balai RW 01", services: ["Timbang", "Imunisasi"], status: "selesai", petugasPJ: "Bidan Ayu" },
  { id: "2", title: "Posyandu Lansia Sehat (Halaman 1)", date: "2026-08-03", startTime: "09:00", endTime: "12:00", location: "Kantor Kelurahan", services: ["Cek Tensi", "Senam"], status: "selesai", petugasPJ: "Perawat Budi" },
  { id: "3", title: "Posyandu Ibu Hamil Anggrek (Halaman 2)", date: "2026-08-05", startTime: "08:30", endTime: "11:30", location: "Balai RW 03", services: ["Periksa Kandungan"], status: "akan_datang", petugasPJ: "Bidan Citra" },
  { id: "4", title: "Posyandu Balita Kenanga (Halaman 2)", date: "2026-08-10", startTime: "08:00", endTime: "11:00", location: "Balai RW 04", services: ["Vitamin A", "Timbang"], status: "akan_datang", petugasPJ: "Bidan Dian" },
];

export default function JadwalPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Pagination (Limit diatur ke 2)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limitPerPage = 2;

  // Fungsi untuk mengubah status jadwal
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await apiFetch(`/api/jadwal/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status di server");
      }

      setSchedules((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      console.error("Update Status Error (Fallback to local state):", err);
      // Fallback update lokal
      setSchedules((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "-";
    if (time.includes("T")) {
      const dateObj = new Date(time);
      if (isNaN(dateObj.getTime())) return "-";
      return dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return time.substring(0, 5);
  };

  const fetchSchedules = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFetch(`/api/jadwal?page=${page}&limit=${limitPerPage}`);
      const result = await response.json();
      
      const rawItems = result.data?.items ?? result.data?.data ?? result.items ?? result;
      const meta = result.data?.meta ?? result.meta ?? {};

      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const items: ScheduleItem[] = rawItems.map((item: any) => ({
          id: String(item.id),
          title: item.judul_kegiatan ?? item.title ?? "Kegiatan Posyandu",
          date: item.tanggal ?? item.date ?? "-",
          startTime: formatTime(item.waktu_mulai ?? item.time_start),
          endTime: formatTime(item.waktu_selesai ?? item.time_end),
          location: item.lokasi ?? item.location ?? "-",
          services: Array.isArray(item.layanan_tersedia) ? item.layanan_tersedia : Array.isArray(item.services) ? item.services : [],
          notes: item.keterangan ?? item.notes ?? "",
          status: item.status ?? "akan_datang",
          petugasPJ: item.petugas_pj ?? item.petugasPJ ?? "-",
        }));
        setSchedules(items);
        setTotalPages(meta.total_pages ?? meta.last_page ?? 1);
        setTotalItems(meta.total_items ?? meta.total ?? rawItems.length);
      } else {
        throw new Error("No data from API, using fallback");
      }
    } catch (err: any) {
      console.warn("API tidak aktif, memuat data dummy lokal...", err);
      
      // LOGIKA PAGINATION UNTUK DATA DUMMY (Limit 2)
      const totalDummyItems = DUMMY_SCHEDULES.length;
      const totalDummyPages = Math.ceil(totalDummyItems / limitPerPage);
      
      const startIndex = (page - 1) * limitPerPage;
      const endIndex = startIndex + limitPerPage;
      const paginatedDummyData = DUMMY_SCHEDULES.slice(startIndex, endIndex);

      setSchedules(paginatedDummyData);
      setTotalPages(totalDummyPages);
      setTotalItems(totalDummyItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules(currentPage);
  }, [currentPage, fetchSchedules]);

  // Urutkan jadwal: yang statusnya "selesai" otomatis diposisikan paling bawah
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.status === "selesai" && b.status !== "selesai") return 1;
    if (a.status !== "selesai" && b.status === "selesai") return -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Jadwal /
        <span className="ml-1 font-medium text-blue-600">Jadwal Posyandu</span>
      </p>

      <Header />

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-700 border border-red-100 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="flex-1 font-medium">{error}</p>
          <button
            onClick={() => fetchSchedules(currentPage)}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold hover:bg-red-200 transition shrink-0"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <CalendarStrip />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-700">
                  Agenda Kegiatan Posyandu
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Daftar jadwal & lokasi kegiatan bulan ini (Limit: 2 per halaman)
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Total: {totalItems} Kegiatan
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
                <FiLoader className="w-6 h-6 animate-spin text-blue-600" />
                <span>Memuat agenda kegiatan dari server...</span>
              </div>
            ) : sortedSchedules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
                Belum ada agenda kegiatan posyandu.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSchedules.map((item) => {
                  const isFinished = item.status === "selesai";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
                        isFinished ? "bg-gray-50/70 border-gray-200 opacity-80" : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                            {item.date} ({item.startTime} - {item.endTime})
                          </span>
                          <h3 className="text-base font-bold text-gray-800 mt-1.5">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            📍 {item.location} &bull; 👤 PJ: {item.petugasPJ}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "selesai"
                                ? "bg-green-100 text-green-700"
                                : item.status === "berlangsung"
                                ? "bg-amber-100 text-amber-700"
                                : item.status === "dibatalkan"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-gray-600 bg-white/60 p-2.5 rounded-xl border border-gray-100">
                          <span className="font-semibold">Catatan:</span> {item.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">Ubah Status:</span>
                          <select
                            value={item.status}
                            disabled={isFinished}
                            onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                            className={`rounded-xl border border-gray-200 py-1.5 px-3 text-xs font-medium outline-none transition ${
                              isFinished
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-50 text-gray-700 focus:border-blue-500 focus:bg-white"
                            }`}
                          >
                            <option value="akan_datang">Akan Datang</option>
                            <option value="berlangsung">Berlangsung</option>
                            <option value="dibatalkan">Dibatalkan</option>
                          </select>
                        </div>

                        <div>
                          {isFinished ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3.5 py-1.5 rounded-xl border border-green-200">
                              <FiLock className="w-3.5 h-3.5" />
                              <span>Selesai (Terkunci)</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(item.id, "selesai")}
                              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 transition"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Tandai Selesai</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NAVIGASI PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                    currentPage === 1
                      ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <span className="text-xs font-medium text-gray-600">
                  Halaman <span className="font-bold text-blue-600">{currentPage}</span> dari{" "}
                  <span className="font-bold">{totalPages}</span>
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                    currentPage === totalPages
                      ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span>Berikutnya</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <ReminderPanel />
        </div>
      </div>
    </div>
  );
}