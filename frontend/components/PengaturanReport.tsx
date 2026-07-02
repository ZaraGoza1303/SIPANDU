"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthToken } from "@/lib/useAuthToken";
import { usePreferences } from "@/lib/usePreferences";
import { decodeJwt } from "@/lib/jwt";
import type { JwtPayload, NotificationPreferences } from "@/types/settings";

/**
 * Pengaturan (Settings) page.
 *
 * API-Documentation.md does not document any endpoint for reading or
 * updating user/app settings — the only user-related endpoint at all is
 * `POST /api/auth/login`. So, integration here is intentionally limited to
 * what's real and documented:
 *
 *   - "Profil Akun" reads whatever claims exist inside the JWT itself
 *     (decoded client-side, not fetched — there's no GET /api/me/profile
 *     endpoint documented to fetch this from).
 *   - "Keluar / Logout" is real: it clears the stored token and redirects
 *     to /login.
 *   - "Ubah Kata Sandi" is shown but disabled, since no
 *     `PATCH /api/auth/change-password` (or similar) is documented.
 *   - "Preferensi Tampilan" and "Notifikasi" are stored locally in the
 *     browser (localStorage) via usePreferences(), not synced to a server,
 *     since no settings endpoint exists to sync them to.
 *
 * If a settings/profile endpoint gets added later, the sections marked
 * "belum tersedia di API" below are exactly where to wire it in.
 */

const NOTIF_LABELS: Record<keyof NotificationPreferences, string> = {
  jadwalPemeriksaan: "Pengingat jadwal pemeriksaan",
  kasusStuntingBaru: "Kasus stunting baru terdeteksi",
  ringkasanMingguan: "Ringkasan laporan mingguan",
};

export default function PengaturanReport() {
  const { token, clearToken } = useAuthToken();
  const { preferences, setTheme, setNotification } = usePreferences();
  const router = useRouter();

  const claims = useMemo(() => decodeJwt<JwtPayload>(token), [token]);

  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  const initials = (claims?.name || claims?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola akun, tampilan, dan preferensi notifikasi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column: profile + logout */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-600">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">
                  {claims?.name || "Nama tidak tersedia"}
                </div>
                <div className="truncate text-sm text-slate-500">
                  {claims?.email || "-"}
                </div>
                {claims?.role && (
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {claims.role}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400">
              Data diambil dari token login — belum ada endpoint{" "}
              <code>GET /api/me</code> di dokumentasi untuk profil lengkap.
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold">Keluar Akun</div>
            <p className="mt-1 text-xs text-slate-500">
              Kamu akan diarahkan kembali ke halaman login.
            </p>

            {!confirmingLogout ? (
              <button
                onClick={() => setConfirmingLogout(true)}
                className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                Keluar
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Ya, keluar
                </button>
                <button
                  onClick={() => setConfirmingLogout(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: settings sections */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Change password (not wired — no endpoint documented) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold">Ubah Kata Sandi</div>
            <p className="mt-1 text-[11px] text-slate-400">
              Belum tersedia di dokumentasi API (butuh endpoint seperti{" "}
              <code>PATCH /api/auth/change-password</code>). Form di bawah
              nonaktif sampai endpoint-nya ada.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                disabled
                placeholder="Kata sandi saat ini"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
              />
              <input
                disabled
                placeholder="Kata sandi baru"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
              />
            </div>
            <button
              disabled
              title="Endpoint belum tersedia di dokumentasi API"
              className="mt-3 cursor-not-allowed rounded-lg bg-slate-200 px-3.5 py-2 text-sm font-medium text-slate-400"
            >
              Simpan Kata Sandi
            </button>
          </div>

          {/* Appearance — local only */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold">Preferensi Tampilan</div>
            <p className="mt-1 text-[11px] text-slate-400">
              Disimpan lokal di browser ini saja — belum disinkronkan ke
              server (tidak ada endpoint pengaturan di dokumentasi API).
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 rounded-lg border px-3.5 py-2 text-sm font-medium ${
                  preferences.theme === "light"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                ☀️ Terang
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 rounded-lg border px-3.5 py-2 text-sm font-medium ${
                  preferences.theme === "dark"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                🌙 Gelap
              </button>
            </div>
          </div>

          {/* Notifications — local only */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold">Notifikasi</div>
            <p className="mt-1 text-[11px] text-slate-400">
              Disimpan lokal di browser ini saja — sama seperti tampilan,
              belum ada endpoint untuk menyimpan preferensi ini di server.
            </p>
            <div className="mt-3 flex flex-col divide-y divide-slate-100">
              {(
                Object.keys(NOTIF_LABELS) as Array<
                  keyof NotificationPreferences
                >
              ).map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-slate-700">
                    {NOTIF_LABELS[key]}
                  </span>
                  <span className="relative inline-flex h-6 w-11 items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={preferences.notifications[key]}
                      onChange={(e) => setNotification(key, e.target.checked)}
                    />
                    <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-blue-600" />
                    <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}