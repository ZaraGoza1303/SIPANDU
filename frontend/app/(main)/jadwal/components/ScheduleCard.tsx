"use client";

import {
  FiClock,
  FiUser,
  FiCheckCircle,
  FiMapPin,
} from "react-icons/fi";

type Props = {
  patientName: string;
  parentName: string;
  time: string;
  status: "aktif" | "selesai";
};

export default function ScheduleCard({
  patientName,
  parentName,
  time,
  status,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-lg font-semibold">
            {patientName}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <FiUser />
            {parentName}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <FiClock />
            {time}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <FiMapPin />
            Ruang Pemeriksaan
          </div>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            status === "aktif"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {status === "aktif" ? "Aktif" : "Selesai"}
        </span>

      </div>

      <div className="mt-5 flex justify-end">

        {status === "aktif" ? (
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Mulai Pemeriksaan
          </button>
        ) : (
          <button className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-green-600">
            <FiCheckCircle />
            Sudah Selesai
          </button>
        )}

      </div>

    </div>
  );
}   