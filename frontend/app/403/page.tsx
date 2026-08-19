"use client";

import Link from "next/link";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <FiAlertTriangle className="h-8 w-8" />
        </div>

        <p className="mt-6 text-6xl font-bold text-gray-900">
          403
        </p>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Akses Ditolak
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Kamu sudah terautentikasi, tetapi tidak memiliki
          izin untuk mengakses halaman ini.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FiArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        </div>
      </div>
    </main>
  );
}