"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

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
          headers: {
            "Content-Type":
              "application/json",
            "ngrok-skip-browser-warning":
              "true",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result =
        await response.json();

      console.log(result);

      if (result.success) {
        localStorage.setItem(
          "token",
          result.data.jwt_token
        );

        alert("Login berhasil");

        router.push("/patient");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert(
        "Gagal terhubung ke server"
      );
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

          <div className="mb-6 flex items-center gap-2">
            <input type="checkbox" />

            <span className="text-sm text-gray-600">
              Ingat Saya
            </span>
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