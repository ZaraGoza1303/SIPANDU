"use client";

import {
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

export default function ReminderPanel() {
  return (
    <div className="space-y-6">

      {/* Reminder */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-2">
          <FiBell className="text-blue-600" />
          <h2 className="text-lg font-semibold">
            Reminder
          </h2>
        </div>

        <div className="space-y-4">

          <div className="rounded-xl bg-blue-50 p-4">

            <p className="font-medium">
              Pemeriksaan dimulai
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Hari ini pukul 08.00 WIB
            </p>

          </div>

          <div className="rounded-xl bg-yellow-50 p-4">

            <p className="font-medium">
              Jadwal berikutnya
            </p>

            <p className="mt-1 text-sm text-gray-500">
              08.15 WIB
            </p>

          </div>

        </div>

      </div>

      {/* Ringkasan */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-2">
          <FiCalendar className="text-blue-600" />
          <h2 className="text-lg font-semibold">
            Ringkasan Hari Ini
          </h2>
        </div>

        <div className="space-y-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-500" />
              <span>Total Jadwal</span>
            </div>

            <span className="font-semibold">
              12
            </span>

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              <span>Sudah Selesai</span>
            </div>

            <span className="font-semibold text-green-600">
              5
            </span>

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <FiClock className="text-yellow-600" />
              <span>Belum Selesai</span>
            </div>

            <span className="font-semibold text-yellow-600">
              7
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}