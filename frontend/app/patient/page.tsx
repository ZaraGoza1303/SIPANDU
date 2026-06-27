"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Patient = {
  id: string;
  nik: string;
  name: string;
  birth_date: string;
  gender: string;
  mother_name: string;
  phone_parent: string;
};

export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, []);

  async function fetchPatient() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Silakan login terlebih dahulu.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/all?page=1&limit=10&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setPatients(result.data.items);
      }
    } catch (error) {
      console.log(error);
      alert("Gagal mengambil data pasien.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Data Pasien
          </h1>

          <p className="text-gray-500">
            Kelola data pasien posyandu.
          </p>
        </div>

        <Link
          href="/patient/add"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Tambah Pasien
        </Link>
      </div>

      <div className="mb-5 flex gap-3">
        <input
          type="text"
          placeholder="Cari nama atau NIK..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
        />

        <button
          onClick={fetchPatient}
          className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          Cari
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">NIK</th>
              <th className="p-4">Nama</th>
              <th className="p-4">Tanggal Lahir</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Nama Ibu</th>
              <th className="p-4">No WA</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {patient.nik}
                  </td>

                  <td className="p-4 font-medium">
                    {patient.name}
                  </td>

                  <td className="p-4">
                    {new Date(
                      patient.birth_date
                    ).toLocaleDateString("id-ID")}
                  </td>

                  <td className="p-4">
                    {patient.gender}
                  </td>

                  <td className="p-4">
                    {patient.mother_name}
                  </td>

                  <td className="p-4">
                    {patient.phone_parent}
                  </td>

                  <td className="p-4">
                    <Link
                      href={`/patient/${patient.id}`}
                      className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Total data: {patients.length}
      </p>
    </div>
  );
}