"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import CalendarStrip from "./components/CalendarStrip";
import ScheduleCard from "./components/ScheduleCard";
import ReminderPanel from "./components/ReminderPanel";

type WaStatus = "terkirim" | "gagal" | null;

type ScheduleItem = {
  id: string;
  patientName: string;
  parentName: string;
  serviceType: string;
  time: string;
  status: string;
  waStatus: WaStatus;
  isYesterday: boolean;
};

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pemeriksaan/jadwal?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const items: ScheduleItem[] = (result.data.items || result.data || []).map(
          (item: any) => ({
            id: item.id,
            patientName: item.patient?.name ?? item.patient_name ?? "-",
            parentName: item.patient?.mother_name ?? item.parent_name ?? "-",
            serviceType: item.service_type ?? "Posyandu",
            time: `${formatTime(item.time_start)} - ${formatTime(item.time_end)}`,
            status: item.status ?? "aktif",
            waStatus: (
              item.wa_status === "terkirim" || item.wa_status === "gagal"
                ? item.wa_status
                : null
            ) as WaStatus,
            isYesterday: false,
          })
        );
        setSchedules(items);
      }
    } catch (err) {
      console.error("Fetch Schedule Error:", err);
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
        <div className="col-span-8 space-y-6">

          {/* Calendar */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <CalendarStrip />
          </div>

          {/* Agenda */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-700">
                Agenda Hari Ini
              </p>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                {schedules.length} Pemeriksaan
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">
                Memuat jadwal...
              </div>
            ) : schedules.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">
                Belum ada jadwal pemeriksaan hari ini.
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
        <div className="col-span-4">
          <ReminderPanel />
        </div>

      </div>
    </div>
  );
}