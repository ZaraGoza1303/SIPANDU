"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiSave, FiUpload } from "react-icons/fi";
import Link from "next/link";

export default function AddPatientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [picture, setPicture] = useState<File | null>(null);
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
      if (!token) { alert("Silakan login terlebih dahulu."); return; }

      if (!form.nik || !form.nik_parent || !form.name || !form.birth_date ||
          !form.gender || !form.mother_name || !form.address || !form.phone_parent) {
        alert("Semua data wajib diisi.");
        return;
      }

      if (!picture) { alert("Foto pasien wajib dipilih."); return; }

      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("picture", picture);

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
      if (!response.ok) { alert(JSON.stringify(result, null, 2)); return; }

      alert("Pasien berhasil ditambahkan.");
      router.push(from === "pemeriksaan" ? "/pemeriksaan/add" : "/patient");
    } catch (error) {
      console.error(error);
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 transition";
  const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/patient"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            <FiArrowLeft size={14} />
            Kembali ke Data Pasien
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Pasien</h1>
          <p className="mt-1 text-sm text-gray-500">Isi data lengkap pasien baru.</p>
        </div>
        <button
          onClick={savePatient}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          <FiSave size={15} />
          {loading ? "Menyimpan..." : "Simpan Pasien"}
        </button>
      </div>

      {/* Data Anak */}
      <Section title="Data Anak">
        <div className="grid grid-cols-2 gap-5">
          <Field label="NIK Anak">
            <input
              type="text"
              placeholder="NIK lengkap anak"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Nama Anak">
            <input
              type="text"
              placeholder="Nama lengkap anak"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Tanggal Lahir">
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Jenis Kelamin">
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className={inputCls}
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-Laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Data Orang Tua */}
      <Section title="Data Orang Tua">
        <div className="grid grid-cols-2 gap-5">
          <Field label="NIK Orang Tua">
            <input
              type="text"
              placeholder="NIK lengkap orang tua"
              value={form.nik_parent}
              onChange={(e) => setForm({ ...form, nik_parent: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Nama Ibu">
            <input
              type="text"
              placeholder="Nama lengkap ibu"
              value={form.mother_name}
              onChange={(e) => setForm({ ...form, mother_name: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Nama Ayah">
            <input
              type="text"
              placeholder="Nama lengkap ayah"
              value={form.father_name}
              onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="No. WhatsApp Orang Tua">
            <input
              type="text"
              placeholder="Contoh: 08123456789"
              value={form.phone_parent}
              onChange={(e) => setForm({ ...form, phone_parent: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="col-span-2">
            <Field label="Alamat">
              <textarea
                rows={3}
                placeholder="Alamat lengkap"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Foto Pasien */}
      <Section title="Foto Pasien">
        <Field label="Upload Foto">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition">
            <FiUpload size={22} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {picture ? picture.name : "Klik untuk pilih foto (PNG, JPG)"}
            </span>
            {picture && (
              <span className="text-xs text-blue-600 font-medium">File terpilih ✓</span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPicture(file);
              }}
            />
          </label>
        </Field>
      </Section>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/patient")}
          className="rounded-xl border border-red-200 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition"
        >
          Batal
        </button>
        <button
          onClick={savePatient}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {loading ? "Menyimpan..." : "Simpan Pasien"}
        </button>
      </div>

    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xs font-semibold tracking-widest text-blue-600 uppercase">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}