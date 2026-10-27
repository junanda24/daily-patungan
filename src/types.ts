/**
 * Tipe publik package `patungan`.
 *
 * Semua nominal memakai Rupiah sebagai bilangan bulat (tanpa sen).
 * Fungsi-fungsi package ini murni: tidak mengubah input pemanggil.
 */

/** Satu pengeluaran dalam satu acara patungan. */
export interface Pengeluaran {
  /** Nama orang yang membayar di muka. Harus ada di daftar peserta. */
  pembayar: string;
  /** Nominal yang dibayar, bilangan bulat Rupiah (> 0). */
  jumlah: number;
  /**
   * Siapa saja yang menanggung pengeluaran ini. Default: semua peserta.
   * Pembayar yang tidak ada di daftar ini berarti mentraktir.
   */
  dibagiUntuk?: string[];
  /**
   * Bobot tiap orang (default 1). Misal makan berdua tapi satu orang
   * pesan dua porsi: `{ Andi: 2, Budi: 1 }`.
   */
  bobot?: Record<string, number>;
  /** Catatan bebas, misal "makan siang warteg". Tidak memengaruhi hitungan. */
  catatan?: string;
}

/** Opsi untuk {@link hitungPatungan}. */
export interface OpsiPatungan {
  /**
   * Pembulatan tiap transfer: `1` (apa adanya), `500`, atau `1000`.
   * Dengan pembulatan, semua transfer dibulatkan ke kelipatan terdekat,
   * kecuali satu transfer terbesar yang menampung sisa pembulatan
   * sehingga total uang yang berpindah tetap persis sama.
   * Default: `1`.
   */
  pembulatan?: 1 | 500 | 1000;
}

/** Satu transfer pelunasan: `dari` membayar `ke` sebesar `jumlah`. */
export interface Transfer {
  dari: string;
  ke: string;
  jumlah: number;
}

/** Posisi keuangan satu peserta setelah semua pengeluaran dijumlah. */
export interface SaldoOrang {
  nama: string;
  /** Total yang sudah dibayar di muka oleh orang ini. */
  sudahBayar: number;
  /** Total bagian yang seharusnya ditanggung orang ini. */
  bagian: number;
  /** `sudahBayar - bagian`: positif = piutang, negatif = utang. */
  selisih: number;
}

/** Hasil lengkap {@link hitungPatungan}. */
export interface HasilPatungan {
  /** Total semua pengeluaran. */
  total: number;
  /** Saldo tiap peserta, sesuai urutan daftar peserta. */
  perOrang: SaldoOrang[];
  /** Daftar transfer minimal yang melunasi semua saldo. */
  transfer: Transfer[];
}
