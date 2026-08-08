"use client";

import {
  FiClock,
  FiCheckCircle,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiFileText,
  FiTag,
} from "react-icons/fi";

type Props = {
  title: string;           // Judul / Nama Kegiatan (e.g. Posyandu Balita RW 05)
  date: string;            // Tanggal Kegiatan
  startTime: string;       // Jam Mulai
  endTime: string;         // Jam Selesai
  location: string;        // Lokasi Posyandu
  services?: string[];     // Daftar layanan yang tersedia
  notes?: string;          // Keterangan / Catatan lokasi
  status?: "akan_datang" | "selesai" | string;
  onEdit?: () => void;
  onComplete?: () => void;
};

export default function ScheduleCard({
  title,
  date,
  startTime,
  endTime,
  location,
  services = [],
  notes,
  status = "akan_datang",
  onEdit,
  onComplete,
}: Props) {
  const isSelesai = status === "selesai";

  // Left accent color
  const accentColor = isSelesai ? "border-l-gray-300" : "border-l-blue-500";

  // Icon background
  const iconBg = isSelesai ? "bg-gray-100" : "bg-blue-50";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm overflow-hidden border-l-4 ${accentColor} ${
        isSelesai ? "opacity-60" : ""
      }`}
    >
      {/* Icon & Detail Informasi */}
      <div className="flex items-start gap-4 flex-1">
        {/* Icon Box */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {isSelesai ? (
            <FiCheckCircle size={22} className="text-gray-400" />
          ) : (
            <FiCalendar size={22} className="text-blue-600" />
          )}
        </div>

        {/* Info Detail */}
        <div className="space-y-1.5">
          <h3
            className={`font-semibold text-base ${
              isSelesai ? "text-gray-500 line-through" : "text-gray-900"
            }`}
          >
            {title}
          </h3>

          {/* Tanggal, Jam, Lokasi */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-medium text-blue-600">
              <FiCalendar size={13} />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <FiClock size={13} className="text-gray-400" />
              {startTime} - {endTime} WIB
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <FiMapPin size={13} className="text-gray-400" />
              {location}
            </span>
          </div>

          {/* Badge Services/Layanan */}
          {services.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1.5 items-center">
              {services.map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 capitalize"
                >
                  <FiTag size={10} className="text-gray-400" />
                  {srv}
                </span>
              ))}
            </div>
          )}

          {/* Catatan / Keterangan */}
          {notes && (
            <p className="text-xs text-gray-400 pt-0.5 flex items-center gap-1 italic">
              <FiFileText size={12} className="shrink-0" />
              {notes}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
        {!isSelesai ? (
          <>
            <button
              onClick={onComplete}
              className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 transition"
            >
              Tandai Selesai
            </button>

            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              title="Edit Kegiatan"
            >
              <FiEdit2 size={16} />
            </button>
          </>
        ) : (
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Sudah Selesai
          </span>
        )}
      </div>
    </div>
  );
}