"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from "react-icons/fi";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    old_password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/auth/profile");
        const userData = response.data || response;
        
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          password: "",
          old_password: "",
        });
      } catch (error) {
        console.error("Gagal memuat profil:", error);
        toast.error("Gagal memuat informasi profil");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && !formData.old_password) {
      toast.error("Wajib mengisi password lama untuk mengganti password!");
      return;
    }

    setLoading(true);

    try {
      await api.put("/api/auth/profile", formData);
      
      toast.success("Profil berhasil diupdate!");
      
      setFormData((prev) => ({
        ...prev,
        password: "",
        old_password: "",
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Gagal mengupdate profil";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
        <p className="text-sm text-gray-600">Kelola informasi akun dan keamanan posyandu Anda.</p>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Nama Lengkap</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FiUser size={18} />
              </span>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="Andi Pratama"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FiMail size={18} />
              </span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="andi@example.com"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Nomor Telepon</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FiPhone size={18} />
            </span>
            <input
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
              placeholder="081234567890"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Ubah Password</h3>
            <p className="text-xs text-gray-600">Kosongkan bagian ini jika tidak ingin mengubah password.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Password Lama</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <FiLock size={18} />
                </span>
                <input
                  name="old_password"
                  type="password"
                  value={formData.old_password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Password Baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <FiLock size={18} />
                </span>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:bg-gray-300 shadow-sm"
          >
            <FiSave size={18} />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}