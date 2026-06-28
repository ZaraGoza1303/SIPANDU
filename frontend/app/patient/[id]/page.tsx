"use client";

import Image from "next/image";
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
        console.log(result.data);
        setPatient(result.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        Data pasien tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Detail Pasien
      </h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
  {patient.picture ? (
    <Image
      src={patient.picture}
      alt={patient.name}
      width={150}
      height={150}
      className="h-40 w-40 rounded-full border object-cover"
    />
  ) : (
    <div className="flex h-40 w-40 items-center justify-center rounded-full border bg-gray-100 text-gray-500">
      Tidak ada foto
    </div>
  )}
</div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Nama
            </p>
            <p className="font-medium">
              {patient.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              NIK
            </p>
            <p>{patient.nik}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Tanggal Lahir
            </p>
            <p>
              {new Date(
                patient.birth_date
              ).toLocaleDateString("id-ID")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Jenis Kelamin
            </p>
            <p>{patient.gender}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Nama Ibu
            </p>
            <p>{patient.mother_name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Nama Ayah
            </p>
            <p>{patient.father_name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Alamat
            </p>
            <p>{patient.address}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              No WA Orang Tua
            </p>
            <p>{patient.phone_parent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}