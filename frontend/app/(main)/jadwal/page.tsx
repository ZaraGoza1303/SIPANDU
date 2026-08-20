"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiLoader, FiAlertCircle, FiCheckCircle, FiLock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Header from "./components/Header";
import CalendarStrip from "./components/CalendarStrip";
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
};

export default function JadwalPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmFinish, setConfirmFinish] =
  useState<ScheduleItem | null>(null);

const [updatingStatus, setUpdatingStatus] =
  useState(false);

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limitPerPage = 5;

  // Fungsi untuk mengubah status jadwal
  const handleUpdateStatus = async (
  id: string,
  newStatus: string
) => {
  try {
    const endpoint =
      newStatus === "selesai"
        ? `/api/pemeriksaan/jadwal/${id}/selesai`
        : `/api/pemeriksaan/update/schedule/${id}`;

    const response = await apiFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    if (!response.ok) {
      throw new Error(
        "Gagal memperbarui status di server"
      );
    }

    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );
  } catch (err: any) {
    console.error(
      "Update Status Error:",
      err
    );

    setError(
      err.message ||
        "Terjadi kesalahan saat memperbarui status."
    );

    // Lempar lagi supaya modal tahu request gagal
    throw err;
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
      
      const response = await apiFetch(`/api/pemeriksaan/jadwal?page=${page}&limit=${limitPerPage}`);
      const result = await response.json();
      
      const rawItems = result.data?.items ?? result.data?.data ?? result.items ?? (Array.isArray(result) ? result : []);
      const meta = result.data?.meta ?? result.meta ?? {};

      const items: ScheduleItem[] = rawItems.map((item: any) => ({
        id: String(item.id ?? item._id ?? Math.random()),
        title: item.title ?? item.judul_kegiatan ?? "Kegiatan Posyandu",
        date: item.scheduled_date ?? item.tanggal ?? item.date ?? "-",
        startTime: formatTime(item.time_start ?? item.waktu_mulai),
        endTime: formatTime(item.time_end ?? item.waktu_selesai),
        location: item.location ?? item.lokasi ?? "-",
        services: Array.isArray(item.layanan_tersedia) ? item.layanan_tersedia : Array.isArray(item.services) ? item.services : [],
        notes: item.description ?? item.keterangan ?? item.notes ?? "",
        status: item.status ?? "akan_datang",
        petugasPJ: item.petugas_pj ?? item.petugasPJ ?? "-",
      }));

      setSchedules(items);
      setTotalPages(meta.total_pages ?? meta.last_page ?? 1);
      setTotalItems(meta.total_items ?? meta.total ?? rawItems.length);
    } catch (err: any) {
      console.error("Gagal memuat jadwal dari server:", err);
      setError(err.message || "Gagal memuat data dari server.");
      setSchedules([]);
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
    <div className="space-y-0">
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

      {/* Layout diubah menjadi 1 kolom penuh (full width) karena ReminderPanel dihapus */}
      <div className="space-y-6">
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
                Daftar jadwal & lokasi kegiatan bulan ini
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
                          📍 {item.location} 
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
                        <span className="font-semibold">Deskripsi:</span> {item.notes}
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
                            type="button"
                            onClick={() => setConfirmFinish(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 transition"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Tandai Selesai</span>
                          </button>
                        )}
                      </div>
                    </div>

                        {confirmFinish && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
      {/* Icon */}
      <div className="px-6 pt-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <FiCheckCircle className="h-7 w-7 text-green-600" />
        </div>

        {/* Judul */}
        <h2 className="mt-4 text-lg font-bold text-gray-900">
          Tandai Jadwal Selesai?
        </h2>

        {/* Deskripsi */}
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Jadwal{" "}
          <span className="font-semibold text-gray-700">
            "{confirmFinish.title}"
          </span>{" "}
          akan ditandai sebagai selesai.
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Setelah selesai, jadwal akan terkunci
          dan tidak dapat diubah kembali.
        </p>
      </div>

      {/* Tombol */}
      <div className="flex gap-3 px-6 py-6">
        {/* Batal */}
        <button
          type="button"
          disabled={updatingStatus}
          onClick={() => {
            setConfirmFinish(null);
            setError(null);
          }}
          className="
            flex-1
            rounded-xl
            border border-gray-200
            bg-white
            px-4 py-2.5
            text-sm font-semibold
            text-gray-700
            transition
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Batal
        </button>

        {/* Ya, Selesai */}
        <button
          type="button"
          disabled={updatingStatus}
          onClick={async () => {
            if (!confirmFinish) return;

            try {
              setUpdatingStatus(true);
              setError(null);

              await handleUpdateStatus(
                confirmFinish.id,
                "selesai"
              );

              setConfirmFinish(null);
            } catch (err) {
              // Error sudah ditangani handleUpdateStatus
              console.error(
                "Konfirmasi selesai gagal:",
                err
              );
            } finally {
              setUpdatingStatus(false);
            }
          }}
          className="
            flex-1
            rounded-xl
            bg-green-600
            px-4 py-2.5
            text-sm font-semibold
            text-white
            transition
            hover:bg-green-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {updatingStatus ? (
            <span className="flex items-center justify-center gap-2">
              <FiLoader className="h-4 w-4 animate-spin" />
              Menyimpan...
            </span>
          ) : (
            "Ya, Selesai"
          )}
        </button>
      </div>
    </div>
  </div>
)}

                  </div>
                );
              })}
            </div>
          )}

          {/* Navigasi Pagination */}
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className={`flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                currentPage === 1 || loading
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
              disabled={currentPage >= totalPages || loading}
              className={`flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                currentPage >= totalPages || loading
                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span>Berikutnya</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}