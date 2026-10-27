import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bulatkanTransfer, hitungTransfer } from "../src/settlement.js";
import type { SaldoOrang } from "../src/types.js";

const saldo = (nama: string, selisih: number): SaldoOrang => ({
  nama,
  sudahBayar: selisih > 0 ? selisih : 0,
  bagian: selisih > 0 ? 0 : -selisih,
  selisih,
});

describe("hitungTransfer", () => {
  it("satu debitur ke satu kreditur", () => {
    const t = hitungTransfer([saldo("Andi", -50000), saldo("Budi", 50000)]);
    assert.deepEqual(t, [{ dari: "Andi", ke: "Budi", jumlah: 50000 }]);
  });

  it("tidak ada transfer bila semua sudah pas", () => {
    assert.deepEqual(hitungTransfer([saldo("Andi", 0), saldo("Budi", 0)]), []);
  });

  it("tidak ada yang transfer ke dirinya sendiri", () => {
    const t = hitungTransfer([
      saldo("Andi", -70000),
      saldo("Budi", 40000),
      saldo("Cici", 30000),
    ]);
    assert.ok(t.every((x) => x.dari !== x.ke));
    assert.equal(
      t.reduce((a, x) => a + x.jumlah, 0),
      70000,
    );
  });
});

describe("bulatkanTransfer", () => {
  it("membulatkan ke 1000 dan total tetap sama", () => {
    const t = bulatkanTransfer(
      [
        { dari: "Andi", ke: "Budi", jumlah: 33333 },
        { dari: "Cici", ke: "Budi", jumlah: 33334 },
      ],
      1000,
    );
    assert.equal(
      t.reduce((a, x) => a + x.jumlah, 0),
      66667,
    );
    // Semua kecuali penampung sisa adalah kelipatan 1000.
    const kelipatan = t.filter((x) => x.jumlah % 1000 === 0);
    assert.ok(kelipatan.length >= t.length - 1);
  });

  it("tanpa pembulatan tidak mengubah apa pun", () => {
    const awal = [{ dari: "Andi", ke: "Budi", jumlah: 33333 }];
    assert.deepEqual(bulatkanTransfer(awal, 1), awal);
  });
});
