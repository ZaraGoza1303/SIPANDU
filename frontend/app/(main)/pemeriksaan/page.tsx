"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiPrinter,
  FiVolume2,
  FiPlus,
} from "react-icons/fi";

export default function PemeriksaanPage() {
  const [examinations, setExaminations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      console.log(result);

      if (result.success) {
        setExaminations(result.data.items);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <p className="text-sm text-gray-400">
          Pemeriksaan /
          <span className="ml-1 text-blue-600 font-medium">
            Hari Ini
          </span>
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Pemeriksaan
        </h1>

        <p className="text-gray-500 mt-1">
          Kelola dan pantau kegiatan pemeriksaan kesehatan.
        </p>
      </div>

      {/* Statistik */}

      <div className="grid grid-cols-4 gap-5">

        <Card
          title="Total Antrian"
          value="12"
          subtitle="Anak"
          icon={<FiUsers />}
        />

        <Card
          title="Sudah Diperiksa"
          value="8"
          subtitle="Anak"
          icon={<FiCheckCircle />}
        />

        <Card
          title="Belum Diperiksa"
          value="4"
          subtitle="Anak"
          icon={<FiAlertCircle />}
        />

        <Card
          title="Rata-rata Waktu"
          value="12"
          subtitle="Menit"
          icon={<FiClock />}
        />

      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* kiri */}

        <div className="col-span-8 rounded-2xl bg-white border shadow-sm">

          <div className="flex items-center justify-between p-6">

            <h2 className="text-xl font-semibold">
              Daftar Antrian
            </h2>

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

              <FiSearch className="absolute left-4 top-4 text-gray-400"/>

              <input
                placeholder="Cari nama anak atau NIK..."
                className="w-full rounded-xl border pl-12 pr-4 py-3 outline-none"
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

                <th className="px-6 py-4">
                  Nama
                </th>

                <th>
                  Orang Tua
                </th>

                <th>
                  Jenis Layanan
                </th>

                <th>
                  Status
                </th>

                <th>
                  Aksi
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (
  <tr>
    <td colSpan={5} className="py-10 text-center">
      Loading...
    </td>
  </tr>
) : examinations.length === 0 ? (
  <tr>
    <td colSpan={5} className="py-10 text-center text-gray-400">
      Belum ada pemeriksaan
    </td>
  </tr>
) : (
  examinations.map((item: any) => (
    <tr
      key={item.id}
      className="border-t hover:bg-gray-50"
    >
      <td className="px-6 py-5">
        <div>
          <p className="font-semibold">
            {item.patient?.name}
          </p>

          <p className="text-sm text-gray-400">
            {item.patient?.nik}
          </p>
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

        {/* kanan */}

        <div className="col-span-4 space-y-5">

          {/* Quick Action */}

          <div className="rounded-2xl bg-white border shadow-sm p-6">

            <h3 className="font-semibold mb-5">
              Aksi Cepat
            </h3>

            <div className="space-y-3">

              <Link
                href="/pemeriksaan/add"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white"
              >
                <FiPlus />
                Tambah Pemeriksaan
              </Link>

              <button className="w-full rounded-xl border py-3 flex justify-center items-center gap-2">

                <FiPrinter />

                Cetak Nomor

              </button>

              <button className="w-full rounded-xl border py-3 flex justify-center items-center gap-2">

                <FiVolume2 />

                Panggil Berikutnya

              </button>

            </div>

          </div>

          {/* Activity */}

          <div className="rounded-2xl bg-white border shadow-sm p-6">

            <h3 className="font-semibold mb-5">
              Aktivitas
            </h3>

            <div className="space-y-5">

              {[1,2,3].map((i)=>(
                <div key={i} className="flex gap-3">

                  <div className="mt-2 h-2 w-2 rounded-full bg-green-500"/>

                  <div>

                    <p className="text-sm font-medium">
                      Pemeriksaan selesai
                    </p>

                    <p className="text-xs text-gray-400">
                      10.45 WIB
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
  icon,
}:{
  title:string;
  value:string;
  subtitle:string;
  icon:React.ReactNode;
}){

  return(

    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {value}
          </h2>

          <p className="text-gray-500">
            {subtitle}
          </p>

        </div>

        <div className="text-blue-600 text-2xl">
          {icon}
        </div>

      </div>

    </div>

  );

}