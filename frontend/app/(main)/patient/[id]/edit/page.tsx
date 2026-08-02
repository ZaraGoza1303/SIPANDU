"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

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
      toast.error("Gagal mengambil data pasien.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePatient() {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Silakan login.");
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
        toast.error(result.message);
        return;
      }

      toast.success("Data pasien berhasil diperbarui.");
      router.push(`/patient/${id}`);
    } catch (err) {
      console.log(err);
      toast.error("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600">
          <svg className="h-5 w-5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Memuat data pasien...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => router.push(`/patient/${id}`)}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Detail
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Data Pasien
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Perbarui informasi rekam medis dan identitas pasien di bawah ini.
          </p>
        </div>
      </div>

      {/* Main Card Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        
        {/* SECTION: Identitas Pasien */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Data Anak / Pasien
          </h2>
          <p className="text-xs text-slate-500 mb-4">Informasi dasar mengenai anak yang terdaftar.</p>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">NIK Anak</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan NIK Anak"
                value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nama Lengkap Anak</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nama sesuai dokumen"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Tanggal Lahir</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Jenis Kelamin</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-Laki">Laki-Laki (L)</option>
                <option value="Perempuan">Perempuan (P)</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* SECTION: Data Orang Tua */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Informasi Orang Tua / Wali
          </h2>
          <p className="text-xs text-slate-500 mb-4">Kontak dan identitas penanggung jawab pasien.</p>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">NIK Orang Tua / Wali</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan NIK Orang Tua"
                value={form.nik_parent}
                onChange={(e) => setForm({ ...form, nik_parent: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">No. WhatsApp Orang Tua</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nomor telepon aktif"
                value={form.phone_parent}
                onChange={(e) => setForm({ ...form, phone_parent: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nama Ibu Kandung</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nama Ibu Kandung"
                value={form.mother_name}
                onChange={(e) => setForm({ ...form, mother_name: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nama Ayah Kandung</label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nama Ayah Kandung"
                value={form.father_name}
                onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              />
            </div>
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* SECTION: Alamat & Berkas */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Alamat & Foto Pasien
          </h2>
          <p className="text-xs text-slate-500 mb-4">Lokasi domisili serta foto profil pasien terbaru.</p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Alamat Lengkap</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                rows={3}
                placeholder="Tuliskan jalan, RT/RW, kelurahan, dan kecamatan..."
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Foto Profil Pasien
              </label>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Preview Foto Lama / Foto Baru */}
                {(oldPicture || picture) && (
                  <div className="relative group shrink-0">
                    <img
                      src={picture ? URL.createObjectURL(picture) : oldPicture}
                      alt="Preview Foto Pasien"
                      className="h-28 w-28 rounded-2xl border border-slate-200 object-cover shadow-sm"
                    />
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {picture ? "Preview Baru" : "Foto Saat Ini"}
                    </span>
                  </div>
                )}

                {/* Field Upload Foto */}
                <div className="flex-1">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center transition hover:border-slate-400">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPicture(file);
                      }}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-2 block text-xs font-semibold text-blue-600 hover:underline">
                        Klik untuk pilih foto baru
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        Format PNG, JPG, atau JPEG
                      </span>
                    </label>
                  </div>

                  {picture && (
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <span>File terpilih: <strong>{picture.name}</strong></span>
                      <button
                        type="button"
                        onClick={() => setPicture(null)}
                        className="text-red-500 hover:underline font-medium"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push(`/patient/${id}`)}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={updatePatient}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}