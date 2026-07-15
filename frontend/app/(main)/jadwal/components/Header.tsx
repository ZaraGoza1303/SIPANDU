"use client";

import Link from "next/link";

export default function Header() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Jadwal Posyandu</h1>
        <p className="mt-1 text-sm text-gray-500">
          Atur dan pantau agenda rutin posyandu untuk memastikan pelayanan kesehatan anak dan ibu berjalan lancar.
        </p>
      </div>
      <Link
        href="/jadwal/add"
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        + Tambah Jadwal
      </Link>
    </div>
  );
}
