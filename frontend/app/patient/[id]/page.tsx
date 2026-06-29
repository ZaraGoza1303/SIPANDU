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
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [picture, setPicture] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    birth_date: "",
    gender: "",
    mother_name: "",
    father_name: "",
    address: "",
    phone_parent: "",
  });

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

  async function handleUpdate() {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (picture) {
        data.append("picture", picture);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/update?patient_id=${params.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: data,
        }
      );

      const result = await response.json();

      if (result.success) {
        setOpenEdit(false);
        fetchPatient();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.log(error);
      alert("Gagal update data");
    } finally {
      setSaving(false);
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
      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Detail Pasien
          </h1>

          <button
            onClick={() => {
              setFormData({
                nik: patient.nik,
                name: patient.name,
                birth_date: patient.birth_date.slice(0, 10),
                gender: patient.gender,
                mother_name: patient.mother_name,
                father_name: patient.father_name,
                address: patient.address,
                phone_parent: patient.phone_parent,
              });

              setOpenEdit(true);
            }}
            className="
              rounded-lg
              bg-blue-600
              px-5 py-3
              text-white
              hover:bg-blue-700
              transition
            "
          >
            Edit Profil
          </button>
        </div>

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
              {new Date(patient.birth_date).toLocaleDateString("id-ID")}
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

      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

            <h2 className="mb-6 text-2xl font-bold">
              Edit Profil Pasien
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                type="text"
                placeholder="Nama"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="text"
                placeholder="NIK"
                value={formData.nik}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nik: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    birth_date: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value,
                  })
                }
                className="rounded border p-3"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>

              <input
                type="text"
                placeholder="Nama Ibu"
                value={formData.mother_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mother_name: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="text"
                placeholder="Nama Ayah"
                value={formData.father_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    father_name: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="text"
                placeholder="No WA Orang Tua"
                value={formData.phone_parent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_parent: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setPicture(
                    e.target.files
                      ? e.target.files[0]
                      : null
                  )
                }
                className="rounded border p-3"
              />
            </div>

            <textarea
              placeholder="Alamat"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              className="mt-4 h-24 w-full rounded border p-3"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpenEdit(false)}
                className="rounded bg-gray-200 px-5 py-3"
              >
                Batal
              </button>

              <button
                onClick={handleUpdate}
                disabled={saving}
                className="
                  rounded
                  bg-blue-600
                  px-5 py-3
                  text-white
                  hover:bg-blue-700
                "
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}