"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddPatientPage() {
  const router = useRouter();
  

  const [loading, setLoading] = useState(false);

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

  async function savePatient() {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    if (
      !form.nik ||
      !form.nik_parent ||
      !form.name ||
      !form.birth_date ||
      !form.gender ||
      !form.mother_name ||
      !form.address ||
      !form.phone_parent
    ) {
      alert("Semua data wajib diisi.");
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
    formData.append("picture", "");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pasien/add`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      }
    );

    const result = await response.json();

    console.log("STATUS:", response.status);
    console.log("RESULT:", result);

    if (!response.ok) {
  console.log(result);
  alert(JSON.stringify(result, null, 2));
  return;
}

    alert("Pasien berhasil ditambahkan.");

    setForm({
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

    router.push("/patient");
  } catch (error) {
    console.error(error);
    alert("Gagal terhubung ke server.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Tambah Pasien
      </h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">

          <input
            type="text"
            placeholder="NIK Anak"
            className="rounded-lg border p-3"
            value={form.nik}
            onChange={(e) =>
              setForm({ ...form, nik: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="NIK Orang Tua"
            className="rounded-lg border p-3"
            value={form.nik_parent}
            onChange={(e) =>
              setForm({
                ...form,
                nik_parent: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Nama Anak"
            className="rounded-lg border p-3"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            type="date"
            className="rounded-lg border p-3"
            value={form.birth_date}
            onChange={(e) =>
              setForm({
                ...form,
                birth_date: e.target.value,
              })
            }
          />

          <select
            className="rounded-lg border p-3"
            value={form.gender}
            onChange={(e) =>
              setForm({
                ...form,
                gender: e.target.value,
              })
            }
          >
            <option value="">
              Pilih Gender
            </option>
            <option value="Laki-Laki">
              Laki-Laki
            </option>
            <option value="Perempuan">
              Perempuan
            </option>
          </select>

          <input
            type="text"
            placeholder="Nama Ibu"
            className="rounded-lg border p-3"
            value={form.mother_name}
            onChange={(e) =>
              setForm({
                ...form,
                mother_name: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Nama Ayah"
            className="rounded-lg border p-3"
            value={form.father_name}
            onChange={(e) =>
              setForm({
                ...form,
                father_name: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="No WA Orang Tua"
            className="rounded-lg border p-3"
            value={form.phone_parent}
            onChange={(e) =>
              setForm({
                ...form,
                phone_parent: e.target.value,
              })
            }
          />
        </div>

        <textarea
          placeholder="Alamat"
          className="mt-4 w-full rounded-lg border p-3"
          rows={4}
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={savePatient}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>

          <button
            onClick={() => router.push("/patient")}
            className="rounded-lg border px-5 py-3"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}