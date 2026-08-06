"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiPrinter,
  FiVolume2,
  FiPlus,
  FiX,
  FiLoader,
  FiLock,
} from "react-icons/fi";

export default function PemeriksaanPage() {
  const router = useRouter();

  const [examinations, setExaminations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [printModal, setPrintModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getExaminations();
  }, []);

  async function getExaminations(keyword = "") {
    try {
      setLoading(true);
      setError(null);

      // Panggilan API ringkas menggunakan helper api.ts
      // Automatic: Ngrok header, Authorization Bearer, Auto Redirect 401 & Handle 403
      const result = await api.get(
        `/api/pemeriksaan/all?page=1&limit=20&search=${encodeURIComponent(keyword)}`
      );

      const items = result.data?.items ?? result.data ?? result;

      if (Array.isArray(items)) {
        setExaminations(items);
      } else {
        setExaminations([]);
      }
    } catch (err: any) {
      console.error("Fetch Examination Error:", err);

      if (err instanceof ApiError) {
        // Menampilkan pesan error khusus (termasuk 403 / 500) dari helper
        setError(err.message);
      } else {
        setError("Gagal terhubung ke server. Periksa koneksi backend Anda.");
      }

      setExaminations([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Nomor Antrian - Posyandu</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; background: #fff; }
            .ticket { width: 300px; margin: 0 auto; padding: 24px 20px; text-align: center; border: 2px dashed #ccc; }
            .header { font-size: 13px; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
            .posyandu { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 16px; }
            .divider { border: none; border-top: 1px dashed #ccc; margin: 12px 0; }
            .label { font-size: 11px; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
            .nomor { font-size: 72px; font-weight: 900; color: #1d4ed8; line-height: 1; margin-bottom: 4px; }
            .nama { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 2px; }
            .nik { font-size: 11px; color: #888; margin-bottom: 12px; }
            .layanan { font-size: 11px; font-weight: bold; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 99px; display: inline-block; margin-bottom: 16px; }
            .waktu { font-size: 11px; color: #888; }
            .footer { margin-top: 16px; font-size: 10px; color: #aaa; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500">
          Pemeriksaan /
          <span className="ml-1 text-blue-600 font-semibold">Hari Ini</span>
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Pemeriksaan</h1>
        <p className="mt-1 text-slate-500">Kelola dan pantau kegiatan pemeriksaan kesehatan.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-800 border border-amber-200/80 text-sm">
          <FiLock className="w-5 h-5 shrink-0 text-amber-600" />
          <p className="flex-1 font-medium">{error}</p>
          <button
            onClick={() => getExaminations(search)}
            className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold hover:bg-amber-200 transition shrink-0 text-amber-900"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Statistik Dinamis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        <Card title="Total Pemeriksaan" value={String(examinations.length)} subtitle="Anak" icon={<FiUsers />} color="blue" />
        <Card title="Rata-rata Waktu" value="12" subtitle="Menit" icon={<FiClock />} color="indigo" />
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Kiri - Riwayat / Antrian Tabel */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Riwayat Pemeriksaan</h2>
            <Link
              href="/patient/add?from=pemeriksaan"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <FiPlus /> Pasien Baru
            </Link>
          </div>

          {/* Search */}
          <div className="p-6 pb-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-3.5 text-slate-400 text-lg" />
              <input
                placeholder="Cari nama anak, NIK, atau jenis layanan..."
                className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  getExaminations(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-y border-slate-100">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">No</th>
                  <th className="px-6 py-3.5">Nama</th>
                  <th className="px-6 py-3.5">Orang Tua</th>
                  <th className="px-6 py-3.5">Jenis Layanan</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin text-blue-600 w-5 h-5" />
                        <span>Memuat data pemeriksaan dari server...</span>
                      </div>
                    </td>
                  </tr>
                ) : examinations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      {error ? error : "Belum ada data pemeriksaan."}
                    </td>
                  </tr>
                ) : (
                  examinations.map((item: any, index: number) => {
                    const patientName = item.patient?.name ?? item.nama_anak ?? "-";
                    const patientNik = item.patient?.nik ?? item.nik ?? "-";
                    const motherName = item.patient?.mother_name ?? item.nama_ibu ?? "-";
                    const serviceType = item.service_type ?? item.jenis_layanan ?? "Pemeriksaan Rutin";
                    const stuntingStatus = item.stunting_status ?? item.status ?? "-";
                    const patientId = item.patient_id ?? item.patient?.id ?? item.id;

                    return (
                      <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{patientName}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{patientNik}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {motherName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200/60">
                            {serviceType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                              stuntingStatus === "Normal"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                : "bg-rose-50 text-rose-700 border-rose-200/80"
                            }`}
                          >
                            {stuntingStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/patient/${patientId}`}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kanan */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Quick Action */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <Link
                href="/pemeriksaan/add"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <FiPlus />
                Tambah Pemeriksaan
              </Link>

              <button
                onClick={() => setPrintModal(true)}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 flex justify-center items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <FiPrinter className="text-slate-500" />
                Cetak Nomor Antrian
              </button>

              <button className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 flex justify-center items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                <FiVolume2 className="text-slate-500" />
                Panggil Berikutnya
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Aktivitas Terakhir</h3>
            <div className="space-y-4">
              {examinations.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada aktivitas pemeriksaan terbaru.</p>
              ) : (
                examinations.slice(0, 3).map((item, i) => (
                  <div key={item.id || i} className="flex gap-3 items-start">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-800 font-medium">
                        Pemeriksaan {item.patient?.name ?? item.nama_anak ?? "Pasien"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.service_type ?? item.jenis_layanan ?? "Selesai"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Cetak Nomor */}
      {printModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 border border-slate-100">

            <button
              onClick={() => setPrintModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-0.5">Cetak Nomor Antrian</h2>
            <p className="text-sm text-slate-500 mb-4">Pilih pasien untuk dicetak nomornya.</p>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-5 pr-1">
              {examinations.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">Belum ada data antrian.</p>
              ) : (
                examinations.map((item, index) => {
                  const pName = item.patient?.name ?? item.nama_anak ?? "-";
                  const pNik = item.patient?.nik ?? item.nik ?? "-";
                  const sType = item.service_type ?? item.jenis_layanan ?? "Pemeriksaan Rutin";

                  return (
                    <button
                      key={item.id || index}
                      onClick={() => {
                        const ticketEl = document.getElementById("ticket-content");
                        if (ticketEl) {
                          ticketEl.innerHTML = `
                            <div class="ticket">
                              <p class="header">Sistem Informasi Posyandu</p>
                              <p class="posyandu">SIPANDU</p>
                              <hr class="divider"/>
                              <p class="label">Nomor Antrian</p>
                              <p class="nomor">${String(index + 1).padStart(3, "0")}</p>
                              <p class="nama">${pName}</p>
                              <p class="nik">NIK: ${pNik}</p>
                              <span class="layanan">${sType}</span>
                              <hr class="divider"/>
                              <p class="waktu">${tanggal}</p>
                              <p class="waktu">Dicetak pukul ${jam} WIB</p>
                              <p class="footer">Harap menunggu hingga nomor Anda dipanggil</p>
                            </div>
                          `;
                        }
                        handlePrint();
                      }}
                      className="w-full flex items-center gap-3.5 rounded-xl border border-slate-200 p-3 text-left hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {String(index + 1).padStart(3, "0")}
                      </span>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 truncate">{pName}</p>
                        <p className="text-xs text-slate-500">{sType}</p>
                      </div>
                      <FiPrinter className="ml-auto text-blue-600 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

            <div id="ticket-content" ref={printRef} className="hidden" />

            <button
              onClick={() => setPrintModal(false)}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color?: "blue" | "emerald" | "amber" | "indigo";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
        <p className="text-xs font-medium text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl text-xl ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}