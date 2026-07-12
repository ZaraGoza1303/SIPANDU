import Link from "next/link";

export default function Header() {
  return (
    <div className="flex items-center justify-between">

      <div>

        <p className="text-sm text-gray-400">
          Manajemen /
          <span className="font-medium text-blue-600">
            {" "}Jadwal Pemeriksaan
          </span>
        </p>

        <h1 className="mt-2 text-4xl text-black font-bold">
          Jadwal Pemeriksaan
        </h1>

        <p className="mt-1 text-gray-500">
          Atur dan pantau agenda rutin kesehatan anak.
        </p>

      </div>

      <Link
        href="/jadwal/add"
        className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        + Tambah Jadwal
      </Link>

    </div>
  );
}