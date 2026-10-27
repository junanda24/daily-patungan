import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatRupiah, formatUntukWA, hitungPatungan } from "../src/index.js";

describe("hitungPatungan ujung-ke-ujung", () => {
  it("contoh makan siang: saldo nol setelah transfer", () => {
    const hasil = hitungPatungan(
      ["Andi", "Budi", "Cici"],
      [
        { pembayar: "Andi", jumlah: 150000, catatan: "makan siang" },
        { pembayar: "Budi", jumlah: 60000, catatan: "kopi" },
      ],
    );
    assert.equal(hasil.total, 210000);
    assert.equal(
      hasil.perOrang.reduce((a, p) => a + p.sudahBayar, 0),
      210000,
    );
    assert.equal(
      hasil.perOrang.reduce((a, p) => a + p.bagian, 0),
      210000,
    );
    assert.equal(
      hasil.perOrang.reduce((a, p) => a + p.selisih, 0),
      0,
    );
    // Terapkan transfer ke saldo: semua harus nol.
    const saldo = new Map(hasil.perOrang.map((p) => [p.nama, p.selisih]));
    for (const t of hasil.transfer) {
      saldo.set(t.dari, (saldo.get(t.dari) as number) + t.jumlah);
      saldo.set(t.ke, (saldo.get(t.ke) as number) - t.jumlah);
    }
    assert.ok([...saldo.values()].every((v) => v === 0));
  });

  it("traktir: pembayar tidak ikut dibagi", () => {
    const hasil = hitungPatungan(
      ["Andi", "Budi"],
      [
        {
          pembayar: "Andi",
          jumlah: 100000,
          dibagiUntuk: ["Budi"],
          catatan: "traktir Budi",
        },
      ],
    );
    const andi = hasil.perOrang.find((p) => p.nama === "Andi") as {
      bagian: number;
    };
    assert.equal(andi.bagian, 0);
    assert.deepEqual(hasil.transfer, [
      { dari: "Budi", ke: "Andi", jumlah: 100000 },
    ]);
  });

  it("pembulatan 500 menjaga total transfer", () => {
    const hasil = hitungPatungan(
      ["Andi", "Budi", "Cici"],
      [{ pembayar: "Andi", jumlah: 100001 }],
      { pembulatan: 500 },
    );
    const totalPiutang = hasil.perOrang
      .filter((p) => p.selisih > 0)
      .reduce((a, p) => a + p.selisih, 0);
    assert.equal(
      hasil.transfer.reduce((a, t) => a + t.jumlah, 0),
      totalPiutang,
    );
  });

  it("tidak mengubah input pemanggil", () => {
    const pengeluaran = [{ pembayar: "Andi", jumlah: 90000 }];
    const salinan = JSON.parse(JSON.stringify(pengeluaran)) as unknown;
    hitungPatungan(["Andi", "Budi"], pengeluaran);
    assert.deepEqual(pengeluaran, salinan);
  });
});

describe("validasi", () => {
  it("menolak pembayar yang tidak dikenal", () => {
    assert.throws(
      () => hitungPatungan(["Andi"], [{ pembayar: "Zed", jumlah: 1000 }]),
      /tidak ada di daftar peserta/,
    );
  });

  it("menolak jumlah bukan bilangan bulat", () => {
    assert.throws(
      () =>
        hitungPatungan(["Andi", "Budi"], [
          { pembayar: "Andi", jumlah: 10.5 },
        ]),
      /bilangan bulat/,
    );
  });

  it("menolak nama peserta duplikat", () => {
    assert.throws(
      () => hitungPatungan(["Andi", "Andi"], []),
      /lebih dari sekali/,
    );
  });

  it("menolak pembulatan yang tidak didukung", () => {
    assert.throws(
      () =>
        hitungPatungan(["Andi"], [], {
          pembulatan: 200 as 1,
        }),
      /pembulatan/,
    );
  });
});

describe("format", () => {
  it("formatRupiah memakai titik sebagai pemisah ribuan", () => {
    assert.equal(formatRupiah(125000), "Rp 125.000");
    assert.equal(formatRupiah(0), "Rp 0");
  });

  it("formatUntukWA memuat semua transfer", () => {
    const hasil = hitungPatungan(
      ["Andi", "Budi"],
      [{ pembayar: "Andi", jumlah: 80000 }],
    );
    const teks = formatUntukWA(hasil);
    assert.match(teks, /Andi/);
    assert.match(teks, /Budi/);
    assert.match(teks, /Rp 40\.000/);
    assert.match(teks, /lunas/);
  });
});
