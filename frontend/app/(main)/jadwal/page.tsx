"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import Header from "./components/Header";
import CalendarStrip from "./components/CalendarStrip";
import ScheduleCard from "./components/ScheduleCard";
import ReminderPanel from "./components/ReminderPanel";

type ScheduleItem = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  services: string[];
  notes?: string;
  status: "akan_datang" | "selesai" | string;
};

// Data Dummy Fallback Kegiatan Posyandu
const DUMMY_SCHEDULES: ScheduleItem[] = [
  {
    id: "1",
    title: "Posyandu Balita Rutin RW 05",
    date: "12 Agustus 2026",
    startTime: "08:00",
    endTime: "11:30",
    location: "Gedung Serbaguna RW 05",
    services: ["Penimbangan", "Imunisasi", "Pemberian Vitamin A", "Konsultasi"],
    notes: "Harap orang tua membawa Buku KIA dan Kartu Posyandu.",
    status: "akan_datang",
  },
  {
    id: "2",
    title: "Pemberian Vitamin A & Penimbangan RW 02",
    date: "18 Agustus 2026",
    startTime: "09:00",
    endTime: "12:00",
    location: "Posyandu Mawar RW 02",
    services: ["Penimbangan", "Pemberian Vitamin A"],
    notes: "Khusus balita usia 6 - 59 bulan.",
    status: "akan_datang",
  },
  {
    id: "3",
    title: "Pemeriksaan & Konsultasi Gizi Balita",
    date: "25 Agustus 2026",
    startTime: "08:30",
    endTime: "11:00",
    location: "Balai Desa Sukamaju",
    services: ["Penimbangan", "Konsultasi Gizi"],
    notes: "Didampingi oleh Ahli Gizi Puskesmas.",
    status: "akan_datang",
  },
  {
    id: "4",
    title: "Posyandu Lansia & Balita RW 01",
    date: "05 Agustus 2026",
    startTime: "08:00",
    endTime: "10:30",
    location: "Posyandu Anggrek RW 01",
    services: ["Penimbangan Rutin", "Pemeriksaan Kesehatan"],
    notes: "Selesai dilaksanakan.",
    status: "selesai",
  },
];

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    try {
      const token = localStorage.getItem("token");

      // Jika token tidak ada, langsung tampilkan data dummy
      if (!token) {
        setSchedules(DUMMY_SCHEDULES);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jadwal?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      const rawItems = result.data?.items || result.data || [];

      if (response.ok && result.success && rawItems.length > 0) {
        const items: ScheduleItem[] = rawItems.map((item: any) => ({
          id: String(item.id),
          title: item.judul_kegiatan ?? item.title ?? "Kegiatan Posyandu",
          date: item.tanggal ?? item.date ?? "-",
          startTime: formatTime(item.waktu_mulai ?? item.time_start) || "08:00",
          endTime: formatTime(item.waktu_selesai ?? item.time_end) || "11:00",
          location: item.lokasi ?? item.location ?? "-",
          services: Array.isArray(item.layanan_tersedia)
            ? item.layanan_tersedia
            : Array.isArray(item.services)
            ? item.services
            : [],
          notes: item.keterangan ?? item.notes ?? "",
          status: item.status ?? "akan_datang",
        }));
        setSchedules(items);
      } else {
        // Jika data API kosong atau error response, gunakan dummy
        setSchedules(DUMMY_SCHEDULES);
      }
    } catch (err) {
      console.error("Fetch Schedule Error, menggunakan data dummy:", err);
      // Fallback jika koneksi gagal/error
      setSchedules(DUMMY_SCHEDULES);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(time: string) {
    if (!time) return "-";
    if (time.includes("T")) {
      return new Date(time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return time.substring(0, 5);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <p className="text-sm text-gray-400">
        Jadwal /
        <span className="ml-1 font-medium text-blue-600">Jadwal Posyandu</span>
      </p>

      <Header />

      <div className="grid grid-cols-12 gap-6">
        {/* Left */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Calendar */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <CalendarStrip />
          </div>

          {/* Agenda List */}
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

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {schedules.length} Kegiatan
                </span>

              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">
                Memuat agenda kegiatan...
              </div>
            ) : schedules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
                Belum ada agenda kegiatan posyandu.
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((item) => (
                  <ScheduleCard key={item.id} {...item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="col-span-12 lg:col-span-4">
          <ReminderPanel />
        </div>
      </div>
    </div>
  );
}