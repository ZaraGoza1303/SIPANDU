"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthToken } from "@/lib/useAuthToken";
import LaporanReport from "@/components/LaporanReport";

export default function LaporanPage() {
  const { token, ready } = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) {
      router.replace("/login?redirect=/laporan");
    }
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Memuat…
      </div>
    );
  }

  if (!token) {
    // Redirect above is in flight; render nothing to avoid a flash of
    // report UI with no auth token attached.
    return null;
  }

  return <LaporanReport token={token} />;
}