"use client";

import Link from "next/link";
import { FiArrowLeft, FiShield, FiInfo, FiLock, FiHeadphones } from "react-icons/fi";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">

      {/* Card */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">

        {/* Top banner */}
        <div className="relative flex h-44 items-center justify-center bg-blue-600 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-blue-500 opacity-60" />
          <div className="absolute -right-6 -bottom-10 h-44 w-44 rounded-full bg-blue-500 opacity-50" />

          {/* Shield icon */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <FiShield size={28} className="text-blue-600" />
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">

          {/* Title */}
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Lupa Kata Sandi?
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-10 rounded-full bg-blue-600" />

          {/* Subtitle */}
          <p className="mt-5 text-center text-sm leading-relaxed text-gray-500">
            Silakan hubungi Admin Puskesmas untuk
            melakukan reset kata sandi akun Anda.
          </p>

          {/* Info box */}
          <div className="mt-6 flex gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
              <FiInfo size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Prosedur Keamanan</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Demi keamanan data pasien, pengaturan ulang kata sandi hanya dapat dilakukan
                melalui otoritas pusat kesehatan terkait.
              </p>
            </div>
          </div>

          {/* Button */}
          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <FiArrowLeft size={15} />
            Kembali ke Login
          </Link>

          {/* Footer text */}
          <p className="mt-6 text-center text-xs text-gray-300">
            Posyandu Digital • Clinical Precision System
          </p>

        </div>
      </div>

      {/* Bottom badges */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <FiLock size={13} />
          Data Terenkripsi
        </span>
        <span className="flex items-center gap-1.5">
          <FiHeadphones size={13} />
          Bantuan 24/7
        </span>
      </div>

    </main>
  );
}