"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthToken } from "@/lib/useAuthToken";
import PengaturanReport from "@/components/PengaturanReport";

export default function PengaturanPage() {
  const { token, ready } = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) {
      router.replace("/login?redirect=/pengaturan");
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
    return null;
  }

  return <PengaturanReport />;
}