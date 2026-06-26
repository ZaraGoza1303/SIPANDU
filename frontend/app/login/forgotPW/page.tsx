"use client";

import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-700"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>

          <h1 className="text-3xl font-bold text-gray-800">
            Lupa Password
          </h1>

          <p className="mt-2 mb-8 text-gray-500">
            Masukkan email Anda untuk menerima tautan reset password.
          </p>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
              />

              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700">
            Kirim Link Reset
            <Send size={18} />
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          © 2026 SIPANDU v0.1
        </div>
      </div>
    </main>
  );
}