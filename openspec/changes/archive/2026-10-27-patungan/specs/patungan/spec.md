# Spec: patungan

## Requirement

### R1 — Hitung patungan dari daftar pengeluaran

- SHALL menerima `peserta: string[]` dan `pengeluaran: Pengeluaran[]`.
- SHALL `Pengeluaran` berisi: `pembayar: string`, `jumlah: number` (Rupiah,
  bilangan bulat positif), `dibagiUntuk?: string[]` (default: semua peserta),
  `bobot?: Record<string, number>` (default: 1 tiap orang),
  `catatan?: string`.
- WHEN pengeluaran dibagi ke N orang dengan bobot, THEN tiap bagian dihitung
  dengan metode sisa terbesar (largest remainder) sehingga semua bagian
  bilangan bulat Rupiah dan jumlahnya PERSIS sama dengan `jumlah` pengeluaran.
- WHEN seseorang membayar tapi tidak ikut dibagi, THEN ia dianggap menanggung
  0 dari pengeluaran itu (traktir) dan tetap masuk perhitungan saldo.

### R2 — Saldo per orang

- SHALL mengembalikan `perOrang[]` berisi `nama`, `sudahBayar`,
  `bagian`, dan `selisih` (`sudahBayar - bagian`).
- WHEN semua pengeluaran dijumlah, THEN `sum(sudahBayar) == sum(bagian) ==
  total` dan `sum(selisih) == 0`.

### R3 — Transfer minimal

- SHALL mengembalikan `transfer[]` berisi `dari`, `ke`, `jumlah` (bilangan
  bulat Rupiah positif).
- WHEN saldo dihitung, THEN transfer memakai pencocokan serakah
  (debitur terbesar → kreditur terbesar) sehingga jumlah transfer mendekati
  minimal dan tidak ada orang yang transfer ke dirinya sendiri.
- WHEN transfer diterapkan ke saldo, THEN semua saldo menjadi 0 (tidak ada
  utang tersisa).

### R4 — Pembulatan uang pas

- SHALL opsi `pembulatan: 1 | 500 | 1000` (default 1 = tanpa pembulatan).
- WHEN `pembulatan > 1`, THEN tiap transfer dibulatkan ke kelipatan terdekat
  dari nilai itu, KECUALI satu transfer terbesar yang menampung sisa
  pembulatan sehingga total uang yang berpindah tetap PERSIS sama dengan
  total sebelum pembulatan.
- WHEN hasil pembulatan membuat satu transfer bernilai 0, THEN transfer itu
  dihapus dari daftar.

### R5 — Format & ringkasan WA

- SHALL `formatRupiah(n)` mengembalikan string `Rp 125.000` (pemisah ribuan
  titik, tanpa desimal).
- SHALL `formatUntukWA(hasil)` mengembalikan teks Bahasa Indonesia berisi
  total patungan, transfer per orang (satu baris per transfer), dan baris
  penutup bahwa setelah transfer semua lunas — siap tempel ke grup chat.

### R6 — Validasi & error

- SHALL melempar `Error` dengan pesan Bahasa Indonesia WHEN:
  - daftar peserta kosong atau berisi nama kosong/duplikat;
  - pembayar tidak ada di daftar peserta;
  - orang di `dibagiUntuk`/`bobot` tidak ada di daftar peserta;
  - `dibagiUntuk` kosong;
  - `jumlah` bukan bilangan bulat positif;
  - bobot bukan bilangan positif;
  - `pembulatan` bukan 1, 500, atau 1000.
- SHALL TIDAK mengubah (mutate) objek input pemanggil.

### R7 — Package

- SHALL nama package `patungan`, versi 1.0.0, lisensi MIT, zero dependency,
  mendukung `import` (ESM) dan `require` (CJS) plus type definitions.
- SHALL `npm test` hijau dan `npm pack --dry-run` sukses.
