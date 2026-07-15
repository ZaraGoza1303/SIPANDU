"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPatientPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [picture, setPicture] = useState<File | null>(null);
  const [oldPicture, setOldPicture] = useState("");

  const [form, setForm] = useState({
    nik: "",
    nik_parent: "",
    name: "",
    birth_date: "",
    gender: "",
    mother_name: "",
    father_name: "",
    address: "",
    phone_parent: "",
  });

  useEffect(() => {
    getPatient();
  }, []);

  async function getPatient() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
        return;
      }

      const patient = result.data;

      setForm({
        nik: patient.nik || "",
        nik_parent: patient.nik_parent || "",
        name: patient.name || "",
        birth_date: patient.birth_date?.slice(0, 10) || "",
        gender: patient.gender || "",
        mother_name: patient.mother_name || "",
        father_name: patient.father_name || "",
        address: patient.address || "",
        phone_parent: patient.phone_parent || "",
      });

      if (patient.picture) {
        setOldPicture(patient.picture);
      }
    } catch (err) {
      console.log(err);
      alert("Gagal mengambil data pasien.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePatient() {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Silakan login.");
        return;
      }

      const formData = new FormData();

      formData.append("nik", form.nik);
      formData.append("nik_parent", form.nik_parent);
      formData.append("name", form.name);
      formData.append("birth_date", form.birth_date);
      formData.append("gender", form.gender);
      formData.append("mother_name", form.mother_name);
      formData.append("father_name", form.father_name);
      formData.append("address", form.address);
      formData.append("phone_parent", form.phone_parent);

      if (picture) {
        formData.append("picture", picture);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/update/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
        return;
      }

      alert("Data pasien berhasil diperbarui.");
      router.push(`/patient/${id}`);
    } catch (err) {
      console.log(err);
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Memuat data pasien...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Edit Pasien
      </h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="grid gap-4 md:grid-cols-2">

          <input
            className="rounded-lg border p-3"
            placeholder="NIK Anak"
            value={form.nik}
            onChange={(e)=>setForm({...form,nik:e.target.value})}
          />

          <input
            className="rounded-lg border p-3"
            placeholder="NIK Orang Tua"
            value={form.nik_parent}
            onChange={(e)=>setForm({...form,nik_parent:e.target.value})}
          />

          <input
            className="rounded-lg border p-3"
            placeholder="Nama Anak"
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
          />

          <input
            type="date"
            className="rounded-lg border p-3"
            value={form.birth_date}
            onChange={(e)=>setForm({...form,birth_date:e.target.value})}
          />

          <select
            className="rounded-lg border p-3"
            value={form.gender}
            onChange={(e)=>setForm({...form,gender:e.target.value})}
          >
            <option value="">Pilih Gender</option>
            <option value="Laki-Laki">L</option>
            <option value="Perempuan">P</option>
          </select>

          <input
            className="rounded-lg border p-3"
            placeholder="Nama Ibu"
            value={form.mother_name}
            onChange={(e)=>setForm({...form,mother_name:e.target.value})}
          />

          <input
            className="rounded-lg border p-3"
            placeholder="Nama Ayah"
            value={form.father_name}
            onChange={(e)=>setForm({...form,father_name:e.target.value})}
          />

          <input
            className="rounded-lg border p-3"
            placeholder="No WA Orang Tua"
            value={form.phone_parent}
            onChange={(e)=>setForm({...form,phone_parent:e.target.value})}
          />
                  </div>

        <textarea
          className="mt-4 w-full rounded-lg border p-3"
          rows={4}
          placeholder="Alamat"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
        />

        <div className="mt-4">

          <label className="mb-2 block font-medium">
            Foto Pasien
          </label>

          {oldPicture && !picture && (
            <div className="mb-3">
              <img
                src={oldPicture}
                alt="Foto Pasien"
                className="h-36 rounded-lg border object-cover"
              />
            </div>
          )}

          {picture && (
            <div className="mb-3">
              <img
                src={URL.createObjectURL(picture)}
                alt="Preview"
                className="h-36 rounded-lg border object-cover"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="w-full rounded-lg border p-3"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                setPicture(file);
              }
            }}
          />

          {picture && (
            <p className="mt-2 text-sm text-gray-500">
              File baru: {picture.name}
            </p>
          )}

        </div>

        <div className="mt-6 flex gap-3">

          <button
            onClick={updatePatient}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

          <button
            onClick={() => router.push(`/patient/${id}`)}
            className="rounded-lg border px-5 py-3"
          >
            Batal
          </button>

        </div>

      </div>

    </div>
  );
}