import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bagiPengeluaran } from "../src/bagi.js";

describe("bagiPengeluaran", () => {
  it("membagi rata dan totalnya persis sama dengan jumlah", () => {
    const hasil = bagiPengeluaran(
      { pembayar: "Andi", jumlah: 100000 },
      ["Andi", "Budi", "Cici"],
    );
    const nilai = [...hasil.values()];
    assert.equal(nilai.reduce((a, b) => a + b, 0), 100000);
    // 100000 / 3 = 33333,33... -> 33334 + 33333 + 33333
    assert.deepEqual(nilai.sort((a, b) => b - a), [33334, 33333, 33333]);
  });

  it("menghormati bobot", () => {
    const hasil = bagiPengeluaran(
      { pembayar: "Andi", jumlah: 90000, bobot: { Andi: 2, Budi: 1 } },
      ["Andi", "Budi"],
    );
    assert.equal(hasil.get("Andi"), 60000);
    assert.equal(hasil.get("Budi"), 30000);
  });

  it("satu orang menanggung semua", () => {
    const hasil = bagiPengeluaran(
      { pembayar: "Andi", jumlah: 50000 },
      ["Budi"],
    );
    assert.equal(hasil.get("Budi"), 50000);
  });
});
