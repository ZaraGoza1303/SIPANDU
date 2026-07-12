"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiSearch,
  FiUser,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";

type Patient = {
  id: string;
  nik: string;
  name: string;
  birth_date: string;
  gender: string;
  mother_name: string;
  phone_parent: string;
  picture?: string | null;
};

export default function AddSchedulePage() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState({
    current_page: 1,
    total_pages: 1,
  });

  useEffect(() => {
    getPatients();
  }, [page, search]);

  async function getPatients() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/all?page=${page}&limit=10&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      console.log(result);

      if (result.success) {
        setPatients(result.data.items);

        setMeta(result.data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      <div>

        <Link
          href="/jadwal"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Kembali ke Jadwal
        </Link>

        <h1 className="mt-4 text-3xl text-gray-800 font-bold">
          Pilih Pasien
        </h1>

        <p className="mt-1 text-gray-500">
          Pilih pasien yang akan dijadwalkan untuk pemeriksaan.
        </p>

      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="relative mb-6">

          <FiSearch className="absolute left-4 top-4 text-gray-400" />

          <input
            placeholder="Cari nama pasien atau NIK..."
            className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

        </div>

        {loading ? (

          <div className="py-20 text-center text-gray-500">
            Memuat data pasien...
          </div>

        ) : patients.length === 0 ? (

          <div className="py-20 text-center text-gray-400">
            Tidak ada pasien ditemukan.
          </div>

        ) : (

          <div className="space-y-4">

            {patients.map((patient) => (

              <div
                key={patient.id}
                className="flex items-center justify-between rounded-2xl border p-5 transition hover:border-blue-500 hover:bg-blue-50"
              >

                <div className="flex items-center gap-5">

                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">

                    {patient.picture ? (

                      <img
                        src={patient.picture}
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <FiUser
                        size={28}
                        className="text-gray-400"
                      />

                    )}

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold">
                      {patient.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-5 text-sm text-gray-500">

                      <span className="flex items-center gap-2">
                        <FiUser />
                        {patient.mother_name}
                      </span>

                      <span className="flex items-center gap-2">
                        <FiPhone />
                        {patient.phone_parent}
                      </span>

                      <span className="flex items-center gap-2">
                        <FiCalendar />
                        {new Date(
                          patient.birth_date
                        ).toLocaleDateString("id-ID")}
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/patient/${patient.id}/schedule`
                    )
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  Pilih
                </button>

              </div>

            ))}

                      </div>

        )}

        {!loading && meta.total_pages > 1 && (

          <div className="mt-8 flex items-center justify-between border-t pt-6">

            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>

            <span className="text-sm text-gray-500">
              Halaman {meta.current_page} dari {meta.total_pages}
            </span>

            <button
              disabled={page === meta.total_pages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Berikutnya
            </button>

          </div>

        )}

      </div>

    </div>
  );
}