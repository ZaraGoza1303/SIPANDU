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

  useEffect(() => {
    fetchPatient();
  }, []);

  async function fetchPatient() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/all?page=1&limit=10&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setPatients(result.data.items);
      }
    } catch (error) {
      console.log(error);
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
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.nik}</td>
              <td>{patient.name}</td>
              <td>{patient.birth_date}</td>
              <td>{patient.gender}</td>
              <td>{patient.mother_name}</td>
              <td>{patient.phone_parent}</td>
              <td>
                <button>Lihat</button>
                <button>Edit</button>
                <button>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <p>Total data: {patients.length}</p>
    </div>
  );
}