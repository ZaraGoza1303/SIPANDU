"use client";

import Link from "next/link";
import { FiPlus } from "react-icons/fi";

export default function Header() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Judul + Deskripsi */}
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-gray-900">
          Jadwal Posyandu
        </h1>

        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">
          Atur dan pantau agenda rutin posyandu untuk memastikan pelayanan
          kesehatan anak dan ibu berjalan lancar.
        </p>
      </div>

      {/* Action */}
      <Link
        href="/jadwal/add"
        className="
          flex w-full shrink-0 items-center justify-center gap-2
          rounded-xl bg-blue-600 px-5 py-3
          text-sm font-medium text-white
          transition hover:bg-blue-700
          sm:w-auto
        "
      >
        <FiPlus className="h-4 w-4" />
        Tambah Jadwal
      </Link>
    </div>
  );
}