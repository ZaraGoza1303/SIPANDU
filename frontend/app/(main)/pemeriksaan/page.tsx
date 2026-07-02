"use client";

import Link from "next/link";
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

              {[1,2,3,4].map((i)=>(
                <tr
                  key={i}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-6 py-5">

                    <div>

                      <p className="font-semibold">
                        -
                      </p>

                      <p className="text-sm text-gray-400">
                        -
                      </p>

                    </div>

                  </td>

                  <td>-</td>

                  <td>-</td>

                  <td>

                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                      Menunggu
                    </span>

                  </td>

                  <td>

                    <Link
                      href="/pemeriksaan/add"
                      className="text-blue-600 hover:underline"
                    >
                      Lanjutkan
                    </Link>

                  </td>

                </tr>
              ))}

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