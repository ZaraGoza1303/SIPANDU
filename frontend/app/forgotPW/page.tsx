"use client";

import Link from "next/link";
import { FiArrowLeft, FiPhoneCall } from "react-icons/fi";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-100 p-4">
            <FiPhoneCall
              size={32}
              className="text-blue-600"
            />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-gray-800">
          Lupa Kata Sandi?
        </h1>

        <p className="mt-4 text-center text-gray-500">
          Untuk keamanan akun, penggantian kata sandi
          hanya dapat dilakukan oleh Admin Puskesmas.
        </p>

        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          Silakan hubungi Admin Puskesmas atau petugas
          yang bertanggung jawab untuk melakukan reset
          kata sandi akun Anda.
        </div>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
        >
          <FiArrowLeft />
          Kembali ke Login
        </Link>
      </div>
    </main>
  );
}