"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

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
} from "react-icons/fi";

export default function PemeriksaanPage() {
  const [examinations, setExaminations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [printModal, setPrintModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getExaminations();
  }, []);

  async function getExaminations(keyword = "") {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pemeriksaan/all?page=1&limit=10&search=${keyword}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setExaminations(result.data.items);
      }
    } catch (err) {
      console.log(err);
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
            .nik { font-size: 11px; color: #888; margin-bottom: 16px; }
            .layanan { font-size: 11px; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 99px; display: inline-block; margin-bottom: 16px; }
            .waktu { font-size: 11px; color: #888; }
            .footer { margin-top: 16px; font-size: 10px; color: #aaa; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm text-gray-400">
          Pemeriksaan /
          <span className="ml-1 text-blue-600 font-medium">Hari Ini</span>
        </p>
        <h1 className="mt-2 text-4xl text-gray-800 font-bold">Pemeriksaan</h1>
        <p className="text-gray-500 mt-1">Kelola dan pantau kegiatan pemeriksaan kesehatan.</p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-4 gap-5">
        <Card title="Total Antrian" value="12" subtitle="Anak" icon={<FiUsers />} />
        <Card title="Sudah Diperiksa" value="8" subtitle="Anak" icon={<FiCheckCircle />} />
        <Card title="Belum Diperiksa" value="4" subtitle="Anak" icon={<FiAlertCircle />} />
        <Card title="Rata-rata Waktu" value="12" subtitle="Menit" icon={<FiClock />} />
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Kiri */}
        <div className="col-span-8 rounded-2xl bg-white border shadow-sm">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xl text-black font-semibold">Daftar Antrian</h2>
            <Link
              href="/patient/add?from=pemeriksaan"
              className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              + Pasien Baru
            </Link>
          </div>

          {/* Search */}
          <div className="px-6 pb-5">
            <div className="relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400" />
              <input
                placeholder="Cari nama anak atau NIK..."
                className="w-full rounded-xl border pl-12 pr-4 py-3 outline-none placeholder:text-gray-400"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  getExaminations(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500 text-sm">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama</th>
                <th>Orang Tua</th>
                <th>Jenis Layanan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">Loading...</td>
                </tr>
              ) : examinations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Belum ada pemeriksaan
                  </td>
                </tr>
              ) : (
                examinations.map((item: any, index: number) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold">{item.patient?.name}</p>
                        <p className="text-sm text-gray-400">{item.patient?.nik}</p>
                      </div>
                    </td>
                    <td>{item.patient?.mother_name}</td>
                    <td>Posyandu</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          item.stunting_status === "Normal"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.stunting_status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/patient/${item.patient_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Kanan */}
        <div className="col-span-4 space-y-5">

          {/* Quick Action */}
          <div className="rounded-2xl bg-white border shadow-sm p-6">
            <h3 className="font-semibold text-black mb-5">Aksi Cepat</h3>
            <div className="space-y-3">
              <Link
                href="/pemeriksaan/add"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white"
              >
                <FiPlus />
                Tambah Pemeriksaan
              </Link>

              <button
                onClick={() => setPrintModal(true)}
                className="w-full rounded-xl text-blue-600 border py-3 flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <FiPrinter />
                Cetak Nomor
              </button>

              <button className="w-full rounded-xl text-blue-600 border py-3 flex justify-center items-center gap-2">
                <FiVolume2 />
                Panggil Berikutnya
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-2xl bg-white border shadow-sm p-6">
            <h3 className="font-semibold text-black mb-5">Aktivitas</h3>
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-2 h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Pemeriksaan selesai</p>
                    <p className="text-xs text-gray-400">10.45 WIB</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Cetak Nomor */}
      {printModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">

            {/* Tutup */}
            <button
              onClick={() => setPrintModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-1">Cetak Nomor Antrian</h2>
            <p className="text-sm text-gray-400 mb-5">Pilih pasien untuk dicetak nomornya.</p>

            {/* Daftar antrian */}
            <div className="max-h-60 overflow-y-auto space-y-2 mb-5">
              {examinations.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Belum ada data antrian.</p>
              ) : (
                examinations.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      // Isi konten tiket lalu print
                      const ticketEl = document.getElementById("ticket-content");
                      if (ticketEl) {
                        ticketEl.innerHTML = `
                          <div class="ticket">
                            <p class="header">Sistem Informasi Posyandu</p>
                            <p class="posyandu">SIPANDU</p>
                            <hr class="divider"/>
                            <p class="label">Nomor Antrian</p>
                            <p class="nomor">${String(index + 1).padStart(3, "0")}</p>
                            <p class="nama">${item.patient?.name ?? "-"}</p>
                            <p class="nik">NIK: ${item.patient?.nik ?? "-"}</p>
                            <span class="layanan">Posyandu</span>
                            <hr class="divider"/>
                            <p class="waktu">${tanggal}</p>
                            <p class="waktu">Dicetak pukul ${jam} WIB</p>
                            <p class="footer">Harap menunggu hingga nomor Anda dipanggil</p>
                          </div>
                        `;
                      }
                      handlePrint();
                    }}
                    className="w-full flex items-center gap-4 rounded-xl border px-4 py-3 text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {String(index + 1).padStart(3, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.patient?.name}</p>
                      <p className="text-xs text-gray-400">{item.patient?.nik}</p>
                    </div>
                    <FiPrinter className="ml-auto text-blue-400" />
                  </button>
                ))
              )}
            </div>

            {/* Hidden ticket template untuk print */}
            <div id="ticket-content" ref={printRef} className="hidden" />

            <button
              onClick={() => setPrintModal(false)}
              className="w-full rounded-xl border py-2.5 text-sm text-gray-500 hover:bg-gray-50"
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
  title, value, subtitle, icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h2 className="mt-3 text-3xl font-bold">{value}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>
        <div className="text-blue-600 text-2xl">{icon}</div>
      </div>
    </div>
  );
}