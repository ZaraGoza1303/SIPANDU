"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const result = await response.json();

    

    console.log(result);

   if (result.success) {
  const token = result.data?.jwt_token;

  if (!token) {
    toast.error("Token login tidak ditemukan.");
    console.error("LOGIN RESULT:", result);
    return;
  }

  // Simpan JWT
  localStorage.setItem("token", token);

  // Ambil role dari JWT
  let role = "";

  try {
    const payload = JSON.parse(
      atob(
        token
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    role = payload.role?.toLowerCase() || "";
  } catch (error) {
    console.error("Gagal membaca role dari JWT:", error);
  }

  toast.success("Login berhasil");

  // Cek apakah user sebelumnya mencoba membuka halaman tertentu
  const redirect = searchParams.get("redirect");

  let destination = "/dashboard";

  /*
   * Kalau ada redirect dari auth guard,
   * tetap arahkan ke halaman yang sebelumnya diminta.
   *
   * Kalau TIDAK ada redirect:
   * - kader → /patient
   * - admin/bidan → /dashboard
   */
  if (redirect && redirect.startsWith("/")) {
    destination = redirect;
  } else if (role === "kader") {
    destination = "/patient";
  }

  router.replace(destination);
  return;
}

    toast.error(
      result.message || "Email atau kata sandi salah."
    );
  } catch (error) {
    console.error(error);
    toast.error("Gagal terhubung ke server");
  }
};

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6f8] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">
            Selamat Datang
          </h1>

          <p className="mt-2 mb-8 text-gray-500">
            Silakan masuk ke akun Anda
          </p>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="nama@email.com"
                className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 text-gray-700 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kata Sandi
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 py-3 pr-10 pl-10 text-gray-700 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" />

              <span className="text-sm text-gray-600">
                Ingat Saya
              </span>
            </label>

            <a
              href="/forgotPW"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Lupa Kata Sandi?
            </a>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Masuk Ke Portal
            <LogIn size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <span>
            © 2026 SIPANDU v0.1
          </span>

          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-gray-600"
            >
              Bantuan
            </a>

            <a
              href="#"
              className="hover:text-gray-600"
            >
              Syarat
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-5 bottom-5 opacity-5">
        <Image
          src="/IconSipandu.png"
          alt="Logo SIPANDU"
          width={130}
          height={130}
        />
      </div>
    </main>
  );
}
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
          <p className="text-sm text-gray-500">
            Memuat halaman login...
          </p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}