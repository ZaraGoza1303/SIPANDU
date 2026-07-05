"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import CalendarStrip from "./components/CalendarStrip";
import ScheduleCard from "./components/ScheduleCard";
import ReminderPanel from "./components/ReminderPanel";

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pemeriksaan/jadwal?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      console.log("Schedule Response:", result);

      if (response.ok && result.success) {
        setSchedules(result.data.items || result.data || []);
      } else {
        console.error(result.message);
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
      <Header />

      <div className="grid grid-cols-12 gap-6">
        {/* Left */}
        <div className="col-span-8 space-y-6">
          {/* Calendar */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <CalendarStrip />
          </div>

          {/* Schedule */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Agenda Hari Ini
              </h2>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {schedules.length} Jadwal
              </span>
            </div>

            {loading ? (
              <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                Memuat jadwal...
              </div>
            ) : schedules.length === 0 ? (
              <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                Belum ada jadwal pemeriksaan.
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((item: any) => (
                  <ScheduleCard
                    key={item.id}
                    patientName={
                      item.patient?.name ??
                      item.patient_name ??
                      "-"
                    }
                    parentName={
                      item.patient?.mother_name ??
                      item.parent_name ??
                      "-"
                    }
                    time={`${formatTime(item.time_start)} - ${formatTime(
                      item.time_end
                    )}`}
                    status={item.status ?? "aktif"}
                  />
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