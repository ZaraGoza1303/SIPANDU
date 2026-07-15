"use client";

import { useState } from "react";

const TIMING_OPTIONS = [
  { id: "h3", label: "H-3 Pemeriksaan" },
  { id: "h1", label: "H-1 Pemeriksaan" },
  { id: "h0", label: "Pagi Hari H (07:00 WIB)" },
];

const DEFAULT_TEMPLATE = `Halo Bunda, mengingatkan besok ada jadwal {{tipe_pemeriksaan}} untuk Ananda {{nama_anak}} pada pukul {{waktu}} di {{posyandu}}.

Mohon membawa buku KIA ya, Bun. Sampai jumpa!`;

export default function ReminderPanel() {
  const [autoReminder, setAutoReminder] = useState(true);
  const [timing, setTiming] = useState("h1");
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Title */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Reminder Settings</h2>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Auto-reminder toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Auto-reminder</p>
            <p className="text-xs text-gray-400 mt-0.5">Kirim otomatis via WhatsApp</p>
          </div>
          <button
            onClick={() => setAutoReminder(!autoReminder)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              autoReminder ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                autoReminder ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Timing */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700">Timing Pengingat</p>
          <div className="space-y-2">
            {TIMING_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTiming(opt.id)}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  timing === opt.id
                    ? "border-blue-500 bg-white text-blue-600 font-medium shadow-sm"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    timing === opt.id ? "border-blue-500" : "border-gray-300"
                  }`}
                >
                  {timing === opt.id && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template WA */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Template Pesan WA</p>
            <button
              onClick={() => setEditingTemplate(!editingTemplate)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {editingTemplate ? "Simpan" : "Edit Template"}
            </button>
          </div>

          {editingTemplate ? (
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-blue-400 p-4 text-sm text-gray-700 outline-none transition"
            />
          ) : (
            <div className="rounded-xl border-l-4 border-l-green-400 border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {template.split(/(\{\{[^}]+\}\})/g).map((part, i) =>
                  /^\{\{[^}]+\}\}$/.test(part) ? (
                    <span key={i} className="font-semibold text-blue-600">
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-400 leading-relaxed">
            Tersedia tag: <span className="font-medium">{"{{nama_anak}}"}</span>,{" "}
            <span className="font-medium">{"{{tanggal}}"}</span>,{" "}
            <span className="font-medium">{"{{posyandu}}"}</span>,{" "}
            <span className="font-medium">{"{{waktu}}"}</span>,{" "}
            <span className="font-medium">{"{{tipe_pemeriksaan}}"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
