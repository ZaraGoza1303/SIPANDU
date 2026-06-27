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
    <div>
      <h1>Data Pasien</h1>

      <br />

      <input
        type="text"
        placeholder="Cari nama atau NIK"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={fetchPatient}>
        Cari
      </button>

      <button>
        Tambah Pasien
      </button>

      <br />
      <br />

      {loading && <p>Loading...</p>}

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama Anak</th>
            <th>Tanggal Lahir</th>
            <th>Jenis Kelamin</th>
            <th>Nama Ibu</th>
            <th>No WA Ortu</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {patients.length === 0 ? (
            <tr>
              <td colSpan={7}>Data tidak ditemukan</td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.nik}</td>
                <td>{patient.name}</td>
                <td>
                  {new Date(patient.birth_date)
                    .toLocaleDateString("id-ID")}
                </td>
                <td>{patient.gender}</td>
                <td>{patient.mother_name}</td>
                <td>{patient.phone_parent}</td>
                <td>
                  <button>Lihat</button>
                  <button>Edit</button>
                  <button>Hapus</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <br />

      <p>Total data: {patients.length}</p>
    </div>
  );
}