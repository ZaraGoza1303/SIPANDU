"use client";

import {
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiPlay,
  FiEdit2,
  FiRefreshCw,
} from "react-icons/fi";

type Props = {
  patientName: string;
  parentName: string;
  serviceType?: string;
  time: string;
  status: "aktif" | "selesai" | "terlambat" | string;
  waStatus?: "terkirim" | "gagal" | null;
  isYesterday?: boolean;
};

export default function ScheduleCard({
  patientName,
  parentName,
  serviceType = "Posyandu",
  time,
  status,
  waStatus,
  isYesterday,
}: Props) {
  const isSelesai = status === "selesai";
  const isTerlambat = status === "terlambat";

  // Left accent color
  const accentColor = isSelesai
    ? "border-l-gray-300"
    : isTerlambat
    ? "border-l-red-400"
    : "border-l-blue-500";

  // Avatar bg
  const avatarBg = isSelesai
    ? "bg-gray-100"
    : isTerlambat
    ? "bg-red-50"
    : "bg-blue-50";

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-gray-100 bg-white pl-0 pr-5 shadow-sm overflow-hidden border-l-4 ${accentColor} ${
        isSelesai ? "opacity-60" : ""
      }`}
    >
      {/* Avatar */}
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center ${avatarBg}`}>
        {isSelesai ? (
          <FiCheckCircle size={22} className="text-gray-400" />
        ) : isTerlambat ? (
          <FiAlertTriangle size={22} className="text-red-400" />
        ) : (
          <span className="text-2xl">😊</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 py-4">
        <p className={`font-semibold ${isSelesai ? "text-gray-500" : "text-gray-900"}`}>
          {patientName}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
          <span>📋</span>
          <span>{serviceType}</span>
          {parentName && <span>· {parentName}</span>}
        </div>
      </div>

      {/* Time & WA status */}
      <div className="flex flex-col items-end gap-1.5">
        {isSelesai ? (
          <span className="text-sm text-gray-400">Selesai {time}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <FiClock
              size={13}
              className={isTerlambat ? "text-red-500" : "text-blue-500"}
            />
            <span
              className={`text-sm font-medium ${
                isTerlambat ? "text-red-500" : "text-blue-600"
              }`}
            >
              {isYesterday ? "Kemarin" : ""} {time}
            </span>
          </div>
        )}

        {/* WA badge */}
        {waStatus === "terkirim" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
            ✓ WA Terkirim
          </span>
        )}
        {waStatus === "gagal" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-500">
            ✕ WA Gagal
          </span>
        )}
      </div>

      {/* Action buttons */}
      {!isSelesai && (
        <>
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
            Tandai Selesai
          </button>

          <div className="flex items-center gap-2 text-gray-400">
            {isTerlambat ? (
              <button className="hover:text-blue-500 transition">
                <FiRefreshCw size={16} />
              </button>
            ) : (
              <button className="hover:text-blue-500 transition">
                <FiPlay size={16} />
              </button>
            )}
            <button className="hover:text-gray-600 transition">
              <FiEdit2 size={16} />
            </button>
          </div>
        </>
      )}

      {isSelesai && (
        <span className="text-sm text-gray-400 font-medium">Sudah Diperiksa</span>
      )}
    </div>
  );
}
