import type { SaldoOrang, Transfer } from "./types.js";

/**
 * Ubah saldo menjadi daftar transfer minimal dengan pencocokan serakah:
 * debitur terbesar dipasangkan dengan kreditur terbesar, berulang sampai
 * semua saldo nol. Jumlah transfer tidak pernah melebihi
 * (jumlah debitur + jumlah kreditur - 1), dan tidak ada yang transfer
 * ke dirinya sendiri.
 */
export function hitungTransfer(saldo: SaldoOrang[]): Transfer[] {
  const debitur = saldo
    .filter((s) => s.selisih < 0)
    .map((s) => ({ nama: s.nama, utang: -s.selisih }))
    .sort((a, b) => b.utang - a.utang);
  const kreditur = saldo
    .filter((s) => s.selisih > 0)
    .map((s) => ({ nama: s.nama, piutang: s.selisih }))
    .sort((a, b) => b.piutang - a.piutang);

  const transfer: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debitur.length && j < kreditur.length) {
    const d = debitur[i] as { nama: string; utang: number };
    const k = kreditur[j] as { nama: string; piutang: number };
    const jumlah = Math.min(d.utang, k.piutang);
    if (jumlah > 0) {
      transfer.push({ dari: d.nama, ke: k.nama, jumlah });
    }
    d.utang -= jumlah;
    k.piutang -= jumlah;
    if (d.utang === 0) i += 1;
    if (k.piutang === 0) j += 1;
  }
  return transfer;
}

/**
 * Terapkan pembulatan uang pas ke daftar transfer.
 *
 * Tiap transfer dibulatkan ke kelipatan `pembulatan` terdekat. Selisih
 * antara total target dan total hasil pembulatan ditampung oleh transfer
 * terbesar, sehingga total uang yang berpindah tetap persis sama.
 * Transfer yang menjadi 0 setelah pembulatan dihapus.
 */
export function bulatkanTransfer(
  transfer: Transfer[],
  pembulatan: number,
): Transfer[] {
  if (pembulatan <= 1 || transfer.length === 0) {
    return transfer.map((t) => ({ ...t }));
  }
  const target = transfer.reduce((acc, t) => acc + t.jumlah, 0);
  const hasil = transfer.map((t) => ({
    ...t,
    jumlah: Math.round(t.jumlah / pembulatan) * pembulatan,
  }));
  let totalHasil = hasil.reduce((acc, t) => acc + t.jumlah, 0);
  let sisa = target - totalHasil;

  if (sisa !== 0) {
    // Transfer terbesar menampung sisa pembulatan.
    let idxTerbesar = 0;
    for (let i = 1; i < hasil.length; i += 1) {
      if (
        (hasil[i] as Transfer).jumlah > (hasil[idxTerbesar] as Transfer).jumlah
      ) {
        idxTerbesar = i;
      }
    }
    (hasil[idxTerbesar] as Transfer).jumlah += sisa;
    totalHasil = hasil.reduce((acc, t) => acc + t.jumlah, 0);
    sisa = target - totalHasil;
  }

  // Bila penampung sisa justru membuat total meleset (kasus ekstrem),
  // kembalikan apa adanya tanpa pembulatan daripada mengarang angka.
  if (sisa !== 0) {
    return transfer.map((t) => ({ ...t }));
  }
  return hasil.filter((t) => t.jumlah > 0);
}
