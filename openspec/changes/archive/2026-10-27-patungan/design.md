# Design: patungan

## Stack

- TypeScript (strict), Node >= 18, zero runtime dependency.
- Build ganda seperti package sebelumnya: `tsc` ke `dist/esm` + `dist/cjs`
  (plus `dist/esm/package.json` bertipe module), type definitions dari `.d.ts`.
- Test: `node:test` + `node:assert/strict` bawaan Node (tanpa framework).

## Struktur modul (tanpa god file, tanpa barrel file)

- `src/types.ts` — tipe `Pengeluaran`, `OpsiPatungan`, `HasilPatungan`,
  `Transfer`, `SaldoOrang`.
- `src/validasi.ts` — semua validasi input, pesan error Bahasa Indonesia.
- `src/bagi.ts` — apportionment largest remainder per pengeluaran.
- `src/settlement.ts` — saldo → transfer minimal (serakah) → pembulatan
  uang pas dengan satu transfer penampung sisa.
- `src/format.ts` — `formatRupiah`, `formatUntukWA`.
- `src/index.ts` — orkestrasi `hitungPatungan` + re-export API publik saja.
- `test/*.test.ts` — satu file test per modul + satu test ujung-ke-ujung
  (saldo nol setelah transfer; total transfer = total piutang).

## Algoritma kunci

1. **Bagi (largest remainder):** untuk tiap pengeluaran, bagian mentah =
   `jumlah * bobot_i / totalBobot`. Ambil floor tiap bagian, lalu bagikan
   sisa rupiah satu per satu ke bagian dengan pecahan terbesar (tie-break:
   urutan peserta) sampai habis. Dijamin integer & total pas.
2. **Saldo:** `sudahBayar` = jumlah pengeluaran yang dibayar orang itu;
   `bagian` = jumlah bagiannya; `selisih = sudahBayar - bagian`.
3. **Settlement (serakah):** pisah debitur (selisih < 0) dan kreditur
   (selisih > 0), urutkan menurun, pasangkan terbesar-dengan-terbesar
   sampai semua nol. Jumlah transfer <= (debitur + kreditur - 1).
4. **Pembulatan:** bulatkan tiap transfer ke kelipatan `pembulatan`
   terdekat; hitung selisih total vs target; tambahkan selisih itu ke
   transfer terbesar (penampung sisa); hapus transfer yang menjadi 0.

## State (lima keranjang)

Tidak ada state persisten: fungsi murni (input → output), tanpa efek
samping, tanpa I/O, tanpa global mutable. Ini keranjang "derived" murni —
cocok untuk library.

## API publik

```ts
hitungPatungan(peserta, pengeluaran, opsi?) -> HasilPatungan
formatRupiah(nilai) -> string
formatUntukWA(hasil) -> string
```

## Yang sengaja TIDAK dibuat

- Tidak ada CLI (library dulu; CLI bisa menyusul tanpa mengubah API).
- Tidak ada kurs/valuta asing — patungan Indonesia = Rupiah.
- Tidak ada bunga/denda telat bayar — di luar masalah inti.
