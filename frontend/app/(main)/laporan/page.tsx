"use client";

import { useAuthToken } from "@/lib/useAuthToken";
import LaporanReport from "@/components/LaporanReport";

export default function LaporanPage() {
  const { token, ready } = useAuthToken();

  // NOTE: kalau nanti mau wajibkan login, aktifkan lagi redirect ke
  // /login di sini. Untuk sekarang, halaman selalu di-render — kalau
  // token belum ada / server belum jalan, LaporanReport sendiri yang
  // menampilkan pesan errornya (bukan halaman kosong).
  //
  // const router = useRouter();
  // useEffect(() => {
  //   if (ready && !token) {
  //     router.replace("/login?redirect=/laporan");
  //   }
  // }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Memuat…
      </div>
    );
  }

  return <LaporanReport token={token ?? undefined} />;
}