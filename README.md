# patungan

Hitung patungan gaya Indonesia: siapa nombok berapa, siapa transfer ke
siapa — dengan jumlah transfer minimal, pembulatan uang pas, dan ringkasan
siap tempel ke grup WA.

## Masalah yang diselesaikan

Makan bareng, satu orang bayar dulu pakai QRIS, lalu grup WA berubah jadi
sidang perhitungan. `patungan` mengubah daftar pengeluaran menjadi jawaban
yang bisa langsung dieksekusi: transfer siapa ke siapa, berapa — sesedikit
mungkin, dan kalau mau, dibulatkan ke uang pas (Rp 500 / Rp 1.000) karena
tidak ada yang mau transfer Rp 33.333,33.

## Kenapa ide ini dipilih

Ini rasa sakit sosial yang nyata, bukan soal matematika abstrak — dan
jawabannya punya twist khas Indonesia: **uang pas**. Saat pembulatan aktif,
semua transfer dibulatkan ke kelipatan terdekat, kecuali satu transfer
terbesar yang menampung sisa pembulatan — jadi total uang yang berpindah
tetap persis sama, tidak ada rupiah yang hilang atau muncul dari udara.
Plus `formatUntukWA()`: hasilnya langsung ditempel ke grup chat, bukan
cuma objek JSON untuk developer.

## Instalasi

Package ini **belum dipublikasikan ke npm registry** (keputusan publikasi
ada di pemilik repo). Instal langsung dari GitHub:

```bash
npm i github:junanda24/daily-patungan
```

Setelah instalasi, build otomatis berjalan (`prepare` script) sehingga
`dist/` tersedia. Persyaratan: Node.js >= 18.

## Cara pakai

```ts
import { hitungPatungan, formatUntukWA } from "patungan";

const hasil = hitungPatungan(
  ["Andi", "Budi", "Cici"],
  [
    { pembayar: "Andi", jumlah: 150000, catatan: "makan siang" },
    { pembayar: "Budi", jumlah: 60000, catatan: "kopi" },
  ],
  { pembulatan: 1000 },
);

console.log(formatUntukWA(hasil));
```

Keluaran:

```
Patungan: total Rp 210.000

Yang perlu transfer:
- Cici -> Andi: Rp 70.000
- Budi -> Andi: Rp 10.000

Setelah transfer di atas, semua lunas.
```

CommonJS juga didukung:

```js
const { hitungPatungan } = require("patungan");
```

## Fitur

- **Bagi adil dengan metode sisa terbesar.** Pengeluaran Rp 100.000 dibagi
  3 orang menjadi Rp 33.334 + Rp 33.333 + Rp 33.333 — selalu bilangan bulat
  Rupiah dan totalnya persis sama dengan pengeluaran.
- **Bobot.** Satu orang pesan dua porsi? `{ Andi: 2, Budi: 1 }` — bagiannya
  mengikuti bobot.
- **Traktir.** Pembayar yang tidak ikut `dibagiUntuk` menanggung 0 dari
  pengeluaran itu — traktir ditangani secara alami.
- **Transfer minimal.** Pencocokan serakah debitur–kreditur: jumlah
  transfer mendekati minimal, tidak ada yang transfer ke dirinya sendiri.
- **Pembulatan uang pas.** Opsi `pembulatan: 500 | 1000` (default `1` =
  apa adanya). Satu transfer terbesar menampung sisa pembulatan sehingga
  total tetap pas.
- **Ringkasan WA.** `formatUntukWA(hasil)` menghasilkan teks Bahasa
  Indonesia siap tempel ke grup chat.
- **Format Rupiah.** `formatRupiah(125000)` → `"Rp 125.000"`.
- **Validasi jelas.** Semua error memakai pesan Bahasa Indonesia yang
  menyebut persis apa yang salah (pembayar tak dikenal, jumlah bukan
  bilangan bulat, nama duplikat, dan lain-lain).
- **Fungsi murni.** Input pemanggil tidak pernah diubah; tanpa I/O,
  tanpa state global, tanpa dependensi.

## API

### `hitungPatungan(peserta, pengeluaran, opsi?)`

| Parameter | Tipe | Keterangan |
| --- | --- | --- |
| `peserta` | `string[]` | Nama-nama peserta, unik dan tidak kosong |
| `pengeluaran` | `Pengeluaran[]` | Daftar pengeluaran (boleh kosong) |
| `opsi.pembulatan` | `1 \| 500 \| 1000` | Default `1` |

`Pengeluaran`:

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `pembayar` | `string` | Harus ada di `peserta` |
| `jumlah` | `number` | Bilangan bulat Rupiah > 0 |
| `dibagiUntuk?` | `string[]` | Default: semua peserta |
| `bobot?` | `Record<string, number>` | Default: 1 tiap orang |
| `catatan?` | `string` | Bebas, tidak memengaruhi hitungan |

Mengembalikan `HasilPatungan`: `{ total, perOrang, transfer }`, dengan
`perOrang[]` berisi `{ nama, sudahBayar, bagian, selisih }` dan
`transfer[]` berisi `{ dari, ke, jumlah }`.

### `formatRupiah(nilai)` → `string`

### `formatUntukWA(hasil)` → `string`

## Mengembangkan dari source

```bash
npm install
npm test        # build + 18 test, harus hijau
npm run pack:dry # simulasi isi tarball publikasi
```

## Tech stack

TypeScript (strict), Node.js >= 18, `node:test` + `node:assert/strict`
untuk test. Zero runtime dependency. Build ganda ESM + CommonJS plus
type definitions.

## Struktur folder

```
src/
  index.ts       # orkestrasi hitungPatungan + export API publik
  types.ts       # tipe publik
  validasi.ts    # validasi input, pesan error Bahasa Indonesia
  bagi.ts        # apportionment largest remainder
  settlement.ts  # transfer minimal + pembulatan uang pas
  format.ts      # formatRupiah, formatUntukWA
test/
  bagi.test.ts
  settlement.test.ts
  index.test.ts
openspec/changes/2026-10-27-patungan/   # proposal, spec, design, tasks
```

## Link hasil

- Repo: https://github.com/junanda24/daily-patungan
- Nama npm (terverifikasi tersedia 2026-10-27, belum dipublikasikan):
  `patungan`
- Tanggal rilis: 2026-10-27

## Catatan saat build

- TypeScript 7 menghapus `moduleResolution: node` (node10) dan menuntut
  pasangan modul/resolusi yang konsisten — konfigurasi akhirnya memakai
  modul eksplisit (`ESNext` untuk ESM, `CommonJS` untuk CJS) dengan
  resolusi `bundler`, plus `"types": ["node"]` agar `node:test` ter-resolve.
- Pembulatan punya satu pengaman: bila penampung sisa gagal membuat total
  pas (kasus ekstrem yang belum pernah ditemui di test), fungsi
  mengembalikan transfer tanpa pembulatan daripada mengarang angka.
- Yang sengaja tidak dibuat: CLI (library dulu; CLI bisa menyusul tanpa
  mengubah API), valuta asing, dan bunga/denda telat bayar.
