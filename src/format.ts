import type { HasilPatungan } from "./types.js";

/** Format bilangan bulat Rupiah: `125000` → `"Rp 125.000"`. */
export function formatRupiah(nilai: number): string {
  const bulat = Math.round(nilai);
  const negatif = bulat < 0;
  const digit = String(Math.abs(bulat)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negatif ? "-Rp " : "Rp "}${digit}`;
}

/**
 * Ringkasan hasil patungan dalam Bahasa Indonesia, siap ditempel ke
 * grup chat (misal WhatsApp). Satu baris per transfer, plus total
 * dan penutup bahwa setelah transfer semua lunas.
 */
export function formatUntukWA(hasil: HasilPatungan): string {
  const baris: string[] = [];
  baris.push(`Patungan: total ${formatRupiah(hasil.total)}`);
  baris.push("");
  if (hasil.transfer.length === 0) {
    baris.push("Sudah lunas semua, tidak ada yang perlu transfer.");
  } else {
    baris.push("Yang perlu transfer:");
    for (const t of hasil.transfer) {
      baris.push(`- ${t.dari} -> ${t.ke}: ${formatRupiah(t.jumlah)}`);
    }
  }
  baris.push("");
  baris.push("Setelah transfer di atas, semua lunas.");
  return baris.join("\n");
}
