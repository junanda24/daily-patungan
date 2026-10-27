import { bagiPengeluaran } from "./bagi.js";
import { formatRupiah, formatUntukWA } from "./format.js";
import { bulatkanTransfer, hitungTransfer } from "./settlement.js";
import type {
  HasilPatungan,
  OpsiPatungan,
  Pengeluaran,
  SaldoOrang,
  Transfer,
} from "./types.js";
import { validasiInput } from "./validasi.js";

export type { HasilPatungan, OpsiPatungan, Pengeluaran, SaldoOrang, Transfer };
export { formatRupiah, formatUntukWA };

/**
 * Hitung patungan dari daftar peserta dan pengeluaran.
 *
 * @example
 * ```ts
 * const hasil = hitungPatungan(
 *   ["Andi", "Budi", "Cici"],
 *   [
 *     { pembayar: "Andi", jumlah: 150000, catatan: "makan siang" },
 *     { pembayar: "Budi", jumlah: 60000, catatan: "kopi" },
 *   ],
 *   { pembulatan: 1000 },
 * );
 * console.log(formatUntukWA(hasil));
 * ```
 */
export function hitungPatungan(
  peserta: string[],
  pengeluaran: Pengeluaran[],
  opsi: OpsiPatungan = {},
): HasilPatungan {
  validasiInput(peserta, pengeluaran, opsi);

  const sudahBayar = new Map(peserta.map((nama) => [nama, 0]));
  const bagian = new Map(peserta.map((nama) => [nama, 0]));
  let total = 0;

  for (const item of pengeluaran) {
    total += item.jumlah;
    sudahBayar.set(
      item.pembayar,
      (sudahBayar.get(item.pembayar) as number) + item.jumlah,
    );
    const penanggung = item.dibagiUntuk ?? peserta;
    const hasilBagi = bagiPengeluaran(item, penanggung);
    for (const [nama, nominal] of hasilBagi) {
      bagian.set(nama, (bagian.get(nama) as number) + nominal);
    }
  }

  const perOrang: SaldoOrang[] = peserta.map((nama) => {
    const bayar = sudahBayar.get(nama) as number;
    const bagi = bagian.get(nama) as number;
    return { nama, sudahBayar: bayar, bagian: bagi, selisih: bayar - bagi };
  });

  const transfer = bulatkanTransfer(
    hitungTransfer(perOrang),
    opsi.pembulatan ?? 1,
  );
  return { total, perOrang, transfer };
}
