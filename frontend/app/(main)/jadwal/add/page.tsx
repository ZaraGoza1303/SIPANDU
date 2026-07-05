"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiClock } from "react-icons/fi";

export default function AddSchedulePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    
    scheduled_date: "",
    time_start: "",
    time_end: "",
    status: "aktif",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function saveSchedule() {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    if (
      !form.scheduled_date ||
      !form.time_start ||
      !form.time_end
    ) {
      alert("Semua data wajib diisi.");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pemeriksaan/schedule`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          scheduled_date: form.scheduled_date,

          time_start: `${form.scheduled_date}T${form.time_start}:00.000Z`,

          time_end: `${form.scheduled_date}T${form.time_end}:00.000Z`,

          status: form.status,
          notes: form.notes || null,
        }),
      }
    );

    const result = await response.json();

    console.log(result);

    if (!response.ok) {
      alert(result.message || "Gagal membuat jadwal.");
      return;
    }

    alert("Jadwal berhasil dibuat.");

    router.push("/jadwal");

  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/jadwal"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Kembali ke Jadwal
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Tambah Jadwal Pemeriksaan
        </h1>

        <p className="mt-1 text-gray-500">
          Buat jadwal pelayanan Posyandu.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Tanggal */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-medium">
              <FiCalendar />
              Tanggal Pemeriksaan
            </label>

            <input
              type="date"
              value={form.scheduled_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  scheduled_date: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block font-medium">
              Status Jadwal
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            >
              <option value="aktif">
                Aktif
              </option>

              <option value="nonaktif">
                Nonaktif
              </option>
            </select>
          </div>

          {/* Jam Mulai */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-medium">
              <FiClock />
              Jam Mulai
            </label>

            <input
              type="time"
              value={form.time_start}
              onChange={(e) =>
                setForm({
                  ...form,
                  time_start: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Jam Selesai */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-medium">
              <FiClock />
              Jam Selesai
            </label>

            <input
              type="time"
              value={form.time_end}
              onChange={(e) =>
                setForm({
                  ...form,
                  time_end: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Catatan */}
        <div className="mt-6">
          <label className="mb-2 block font-medium">
            Catatan (Opsional)
          </label>

          <textarea
            rows={5}
            placeholder="Contoh: Pemeriksaan balita RW 05..."
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-semibold">
            Informasi
          </p>

          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Pastikan tanggal dan jam sudah benar.
            </li>

            <li>
              Jadwal berstatus <b>Aktif</b> akan muncul pada halaman Jadwal.
            </li>

            <li>
              Catatan bersifat opsional.
            </li>
          </ul>
        </div>

        {/* Button */}
        <div className="mt-8 flex gap-3">
         <button
            onClick={saveSchedule}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
            {loading ? "Menyimpan..." : "Simpan Jadwal"}
        </button>

          <button
            onClick={() => router.push("/jadwal")}
            className="rounded-xl border px-6 py-3 transition hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}