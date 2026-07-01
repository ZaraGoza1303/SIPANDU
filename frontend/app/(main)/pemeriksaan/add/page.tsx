"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiActivity,
  FiSave,
} from "react-icons/fi";

export default function AddPemeriksaanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const from = searchParams.get("from");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patient_id: "",

    examination_date: new Date().toISOString().split("T")[0],
    examiner: "",

    weight: "",
    height: "",
    head_circumference: "",
    arm_circumference: "",

    systolic: "",
    diastolic: "",
    blood_sugar: "",

    hiv_status: "",
    complaint: "",
    note: "",
  });

  async function saveExamination() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Silakan login terlebih dahulu.");
        return;
      }

      console.log(form);

      // nanti endpoint backend di sini

      /*
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pemeriksaan/add`,
        {
          method:"POST",
          headers:{
            Authorization:`Bearer ${token}`,
            "Content-Type":"application/json",
            "ngrok-skip-browser-warning":"true",
          },
          body:JSON.stringify(form)
        }
      );

      const result = await response.json();

      if(result.success){
          router.push("/pemeriksaan");
      }
      */

    } catch (error) {
      console.log(error);
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <Link
            href="/pemeriksaan"
            className="mb-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <FiArrowLeft />
            Kembali
          </Link>

          <h1 className="text-4xl font-bold text-gray-900">
            Tambah Pemeriksaan
          </h1>

          <p className="mt-2 text-gray-500">
            Masukkan data pemeriksaan balita.
          </p>

        </div>

        <button
          onClick={saveExamination}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          <FiSave />

          {loading ? "Menyimpan..." : "Simpan Pemeriksaan"}
        </button>

      </div>

      {/* Informasi Pasien */}

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold text-blue-600">
            INFORMASI PASIEN
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-5 p-6">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Pasien
            </label>

            <select
              value={form.patient_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  patient_id: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
            >
              <option value="">
                Pilih Pasien
              </option>
            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Pemeriksa
            </label>

            <input
              value={form.examiner}
              onChange={(e) =>
                setForm({
                  ...form,
                  examiner: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
              placeholder="Nama Petugas"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Tanggal Pemeriksaan
            </label>

            <input
              type="date"
              value={form.examination_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  examination_date: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

        </div>

      </div>
      
            {/* Antropometri */}

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold text-blue-600">
            ANTROPOMETRI
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-6 p-6">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Berat Badan (kg)
            </label>

            <input
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) =>
                setForm({
                  ...form,
                  weight: e.target.value,
                })
              }
              placeholder="Contoh : 12.5"
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Tinggi Badan (cm)
            </label>

            <input
              type="number"
              step="0.1"
              value={form.height}
              onChange={(e) =>
                setForm({
                  ...form,
                  height: e.target.value,
                })
              }
              placeholder="Contoh : 84.2"
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Lingkar Kepala (cm)
            </label>

            <input
              type="number"
              step="0.1"
              value={form.head_circumference}
              onChange={(e) =>
                setForm({
                  ...form,
                  head_circumference: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              LILA (cm)
            </label>

            <input
              type="number"
              step="0.1"
              value={form.arm_circumference}
              onChange={(e) =>
                setForm({
                  ...form,
                  arm_circumference: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

        </div>

      </div>

      {/* Pemeriksaan Tambahan */}

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold text-blue-600">
            PEMERIKSAAN TAMBAHAN
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-6 p-6">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Tekanan Darah
            </label>

            <div className="flex gap-3">

              <input
                type="number"
                placeholder="Sistol"
                value={form.systolic}
                onChange={(e) =>
                  setForm({
                    ...form,
                    systolic: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                type="number"
                placeholder="Diastol"
                value={form.diastolic}
                onChange={(e) =>
                  setForm({
                    ...form,
                    diastolic: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Gula Darah (mg/dL)
            </label>

            <input
              type="number"
              value={form.blood_sugar}
              onChange={(e) =>
                setForm({
                  ...form,
                  blood_sugar: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Status HIV
            </label>

            <select
              value={form.hiv_status}
              onChange={(e) =>
                setForm({
                  ...form,
                  hiv_status: e.target.value,
                })
              }
              className="w-full rounded-xl border p-3"
            >

              <option value="">
                Pilih Status
              </option>

              <option value="Negatif">
                Negatif
              </option>

              <option value="Positif">
                Positif
              </option>

            </select>

          </div>

        </div>

      </div>

            {/* Keluhan & Catatan */}

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold text-blue-600">
            KELUHAN & CATATAN
          </h2>

        </div>

        <div className="space-y-5 p-6">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Keluhan
            </label>

            <textarea
              rows={4}
              value={form.complaint}
              onChange={(e) =>
                setForm({
                  ...form,
                  complaint: e.target.value,
                })
              }
              placeholder="Masukkan keluhan pasien..."
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Catatan Pemeriksa
            </label>

            <textarea
              rows={4}
              value={form.note}
              onChange={(e) =>
                setForm({
                  ...form,
                  note: e.target.value,
                })
              }
              placeholder="Catatan tambahan..."
              className="w-full rounded-xl border p-3"
            />

          </div>

        </div>

      </div>

      {/* Hasil Analisis */}

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold text-blue-600">
            HASIL ANALISIS
          </h2>

        </div>

        <div className="grid grid-cols-4 gap-6 p-6">

          <div className="rounded-xl bg-blue-50 p-5">

            <p className="text-sm text-gray-500">
              Status Stunting
            </p>

            <h3 className="mt-3 text-xl font-bold text-blue-700">
              Belum Diproses
            </h3>

          </div>

          <div className="rounded-xl bg-green-50 p-5">

            <p className="text-sm text-gray-500">
              Z-Score TB/U
            </p>

            <h3 className="mt-3 text-xl font-bold text-green-700">
              -
            </h3>

          </div>

          <div className="rounded-xl bg-yellow-50 p-5">

            <p className="text-sm text-gray-500">
              IMT
            </p>

            <h3 className="mt-3 text-xl font-bold text-yellow-700">
              -
            </h3>

          </div>

          <div className="rounded-xl bg-red-50 p-5">

            <p className="text-sm text-gray-500">
              Risiko
            </p>

            <h3 className="mt-3 text-xl font-bold text-red-700">
              -
            </h3>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={() => router.push("/pemeriksaan")}
          className="rounded-xl border px-6 py-3 hover:bg-gray-50"
        >
          Batal
        </button>

        <button
          onClick={saveExamination}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          {loading ? "Menyimpan..." : "Simpan Pemeriksaan"}
        </button>

      </div>

    </div>
  );
}