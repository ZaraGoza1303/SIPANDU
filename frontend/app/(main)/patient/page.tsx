"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiFilter,
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

export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Yakin ingin menghapus pasien ini?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setPatients((prev) =>
          prev.filter((patient) => patient.id !== id)
        );

        alert("Pasien berhasil dihapus.");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.log(error);
      alert("Gagal menghapus pasien.");
    }
  }

  function getAge(date: string) {
    const birth = new Date(date);
    const today = new Date();

    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      today.getMonth() -
      birth.getMonth();

    if (months < 12) {
      return `${months} Bulan`;
    }

    return `${Math.floor(months / 12)} Tahun`;
  }

  return (
    <div className="space-y-5">
          {/* Breadcrumb */}
          <div>
            <p className="text-sm text-gray-400">
              Pasien /
              <span className="ml-1 font-medium text-blue-600">
                Data Pasien
              </span>
            </p>

            <div className="mt-2 flex items-center justify-between">
              <h1 className="text-4xl font-bold text-gray-900">
                Data Pasien
              </h1>

            <Link
              href="/patient/add"
              className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700"
            >
              + Tambah Pasien
            </Link>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <FiSearch className="absolute left-4 top-3.5 text-gray-400" />

              <input
                type="text"
                placeholder="Cari nama atau NIK..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-80 rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />
            </div>

            <button className="rounded-xl border px-4 py-3 text-gray-600">
              Rentang Usia
            </button>

            <button className="rounded-xl border px-4 py-3 text-gray-600">
              Status Stunting
            </button>

            <button className="rounded-xl border px-4 py-3 text-gray-600">
              Wilayah/RW
            </button>

            <button
              onClick={fetchPatient}
              className="rounded-xl border px-4 py-3 text-gray-600 hover:bg-gray-50"
            >
              <FiFilter />
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr className="text-left">
                <th className="p-5">Foto</th>
                <th className="p-5">Nama Anak</th>
                <th className="p-5">Tanggal Lahir</th>
                <th className="p-5">Usia</th>
                <th className="p-5">Nama Orang Tua</th>
                <th className="p-5">No WA Ortu</th>
                <th className="p-5">Status Stunting</th>
                <th className="p-5">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-gray-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-gray-400"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                        👶
                      </div>
                    </td>

                    <td className="p-5 font-medium text-gray-800">
                      {patient.name}
                    </td>

                    <td className="p-5 text-gray-600">
                      {new Date(
                        patient.birth_date
                      ).toLocaleDateString("id-ID")}
                    </td>

                    <td className="p-5 text-blue-600">
                      {getAge(patient.birth_date)}
                    </td>

                    <td className="p-5 text-gray-700">
                      {patient.mother_name}
                    </td>

                    <td className="p-5 text-gray-700">
                      {patient.phone_parent}
                    </td>

                    <td className="p-5">
                      <div className="flex gap-4 text-gray-400">
                        <Link
                          href={`/patient/${patient.id}`}
                          className="hover:text-blue-600"
                        >
                          <FiEye size={18} />
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(patient.id)
                          }
                          className="hover:text-red-600"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t px-6 py-4 text-sm text-gray-500">
            <p>
              Menampilkan {patients.length} data pasien
            </p>

            <button className="rounded-lg border px-3 py-1">
              1
            </button>
          </div>
        </div>
      </div>
  );
}