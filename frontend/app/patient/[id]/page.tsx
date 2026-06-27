"use client";

import { useParams } from "next/navigation";
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

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, []);

  async function fetchPatient() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/detail?patient_id=${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setPatient(result.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!patient) {
    return <p>Data pasien tidak ditemukan.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Detail Pasien
      </h1>

      <div className="rounded-xl border bg-white p-6 shadow">
        <div className="space-y-3">
          <p>
            <strong>NIK:</strong> {patient.nik}
          </p>

          <p>
            <strong>Nama:</strong> {patient.name}
          </p>

          <p>
            <strong>Tanggal Lahir:</strong>{" "}
            {new Date(patient.birth_date).toLocaleDateString(
              "id-ID"
            )}
          </p>

          <p>
            <strong>Jenis Kelamin:</strong>{" "}
            {patient.gender}
          </p>

          <p>
            <strong>Nama Ibu:</strong>{" "}
            {patient.mother_name}
          </p>

          <p>
            <strong>Nama Ayah:</strong>{" "}
            {patient.father_name}
          </p>

          <p>
            <strong>Alamat:</strong>{" "}
            {patient.address}
          </p>

          <p>
            <strong>No WA:</strong>{" "}
            {patient.phone_parent}
          </p>
        </div>
      </div>
    </div>
  );
}