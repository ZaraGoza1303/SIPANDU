"use client";

import { useEffect, useState } from "react";

type Patient = {
  id: string;
  nik: string;
  name: string;
  birth_date: string;
  gender: string;
  mother_name: string;
  father_name: string;
  address: string;
  phone_parent: string;
  picture: string | null;
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
        alert("Token tidak ditemukan. Silakan login ulang.");
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
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data pasien.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Data Pasien
          </h1>
          <p className="text-gray-500">
            Kelola data pasien posyandu
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700">
          + Tambah Pasien
        </button>
      </div>

      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={fetchPatient}
            className="rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700"
          >
            Cari
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Daftar Pasien
          </h2>
          <p className="text-sm text-gray-500">
            Total data: {patients.length}
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-5 py-4">NIK</th>
                  <th className="px-5 py-4">Nama Anak</th>
                  <th className="px-5 py-4">Tanggal Lahir</th>
                  <th className="px-5 py-4">Gender</th>
                  <th className="px-5 py-4">Nama Ibu</th>
                  <th className="px-5 py-4">No WA</th>
                  <th className="px-5 py-4">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-gray-500"
                    >
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        {patient.nik}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {patient.name}
                      </td>

                      <td className="px-5 py-4">
                        {new Date(
                          patient.birth_date
                        ).toLocaleDateString("id-ID")}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                          {patient.gender}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {patient.mother_name}
                      </td>

                      <td className="px-5 py-4">
                        {patient.phone_parent}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                            Lihat
                          </button>

                          <button className="rounded bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600">
                            Edit
                          </button>

                          <button className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
);
}