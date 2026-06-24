export function calculateAgeMonths(birthdate: Date | string): number {
  const tglLahir = new Date(birthdate);
  const tglSekarang = new Date();

  if (isNaN(tglLahir.getTime())) {
    throw new Error("Format tanggal lahir tidak valid");
  }

  let totalBulan = (tglSekarang.getFullYear() - tglLahir.getFullYear()) * 12;
  totalBulan += tglSekarang.getMonth() - tglLahir.getMonth();

  if (tglSekarang.getDate() < tglLahir.getDate()) {
    totalBulan--;
  }

  return Math.max(0, totalBulan);
}