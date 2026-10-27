import type { Pengeluaran } from "./types.js";

/**
 * Bagi satu pengeluaran ke para penanggungnya dengan metode sisa
 * terbesar (largest remainder):
 *
 * 1. Hitung bagian mentah tiap orang: `jumlah * bobot / totalBobot`.
 * 2. Ambil floor tiap bagian.
 * 3. Bagikan sisa rupiah satu per satu ke bagian dengan pecahan
 *    terbesar (seri diputus sesuai urutan daftar penanggung).
 *
 * Dijamin: semua bagian bilangan bulat dan jumlahnya persis sama
 * dengan `jumlah` — tidak ada rupiah yang hilang atau muncul.
 */
export function bagiPengeluaran(
  item: Pengeluaran,
  penanggung: string[],
): Map<string, number> {
  const bobot = new Map<string, number>();
  let totalBobot = 0;
  for (const nama of penanggung) {
    const w = item.bobot?.[nama] ?? 1;
    bobot.set(nama, w);
    totalBobot += w;
  }

  const bagian = new Map<string, number>();
  const pecahan: Array<{ nama: string; sisa: number }> = [];
  let sudahDibagi = 0;
  for (const nama of penanggung) {
    const mentah = (item.jumlah * (bobot.get(nama) as number)) / totalBobot;
    const bulat = Math.floor(mentah);
    bagian.set(nama, bulat);
    sudahDibagi += bulat;
    pecahan.push({ nama, sisa: mentah - bulat });
  }

  // Urutkan pecahan menurun, stabil sesuai urutan penanggung.
  const urutan = new Map(penanggung.map((nama, i) => [nama, i]));
  pecahan.sort(
    (a, b) =>
      b.sisa - a.sisa ||
      (urutan.get(a.nama) as number) - (urutan.get(b.nama) as number),
  );

  let sisa = item.jumlah - sudahDibagi;
  let i = 0;
  while (sisa > 0) {
    const nama = (pecahan[i % pecahan.length] as { nama: string }).nama;
    bagian.set(nama, (bagian.get(nama) as number) + 1);
    sisa -= 1;
    i += 1;
  }
  return bagian;
}
