# Proposal: patungan — package npm hitung patungan gaya Indonesia

## Apa & kenapa

Setiap orang Indonesia pernah mengalami ini: makan bareng, satu orang bayar
dulu pakai QRIS, lalu grup WA berubah jadi sidang perhitungan. Siapa nombok
berapa, siapa transfer ke siapa, dan — yang paling khas Indonesia — nominalnya
harus **uang pas**: tidak ada yang mau transfer Rp 33.333,33.

`patungan` adalah package npm zero-dependency yang menyelesaikan satu masalah
itu dengan elegan: terima daftar pengeluaran (siapa bayar, berapa, buat siapa),
kembalikan **daftar transfer minimal** (siapa → siapa, berapa) plus ringkasan
siap tempel ke grup WA.

## Kenapa ini mengejutkan

- Bukan kalkulator generik: ini menyelesaikan rasa sakit sosial yang nyata
  (drama patungan di grup WA), bukan soal matematika abstrak.
- Twist "uang pas": opsi pembulatan ke Rp 500 / Rp 1.000 — karena di dunia
  nyata orang tidak transfer receh — dengan satu transfer "penampung sisa"
  sehingga total tetap pas, tidak ada rupiah yang hilang.
- Output `formatUntukWA()` — hasilnya langsung bisa ditempel ke chat grup,
  bukan cuma objek JSON untuk developer.
- Nama package `patungan` (satu kata Bahasa Indonesia) masih tersedia di npm
  (dicek 2026-10-27 via `npm view` → 404).

## Kenapa bentuk npm package (bukan web app)

- Rotasi program: tiga hari terakhir berturut-turut web app (22, 25, 26 Okt);
  hari ini giliran package. Logikanya murni komputasi — tidak butuh UI,
  tidak butuh backend, tidak butuh login/database.
- Package bisa dipakai developer Indonesia di app apa pun (bot WA, web
  patungan, CLI) — distribusinya lebih luas daripada satu web app.

## Kenapa tanpa backend

Seluruh komputasi deterministik dari input. Tidak ada data eksternal, tidak
ada kurs, tidak ada API. Client-side / library murni adalah pilihan yang
benar, bukan penghematan.

## Anti-AI-slop & IP

- Copy Bahasa Indonesia natural, tanpa emoji di label output, tanpa jargon
  "seamless" dan sejenisnya.
- Nol aset pihak ketiga: tidak ada gambar, tidak ada data berlisensi. Semua
  contoh memakai nama fiktif (Andi, Budi, Cici).
- Tidak ada secret dalam bentuk apa pun; tidak ada `.env`.

## Kepatuhan standar

- Kode mengikuti `CODE_STANDARDS.md` (Airbnb-based) dan `ARCHITECTURE.md`:
  modul kecil per tanggung jawab, tanpa god file, tanpa barrel file,
  error dengan pesan Bahasa Indonesia yang jelas.
