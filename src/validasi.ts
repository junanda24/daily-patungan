import type { OpsiPatungan, Pengeluaran } from "./types.js";

/**
 * Validasi input {@link hitungPatungan}. Melempar Error berbahasa
 * Indonesia yang menyebut persis apa yang salah, supaya pemanggil
 * bisa memperbaikinya tanpa menebak-nebak.
 */
export function validasiInput(
  peserta: string[],
  pengeluaran: Pengeluaran[],
  opsi: OpsiPatungan,
): void {
  if (!Array.isArray(peserta) || peserta.length === 0) {
    throw new Error("Daftar peserta tidak boleh kosong.");
  }
  const namaDilihat = new Set<string>();
  for (const nama of peserta) {
    if (typeof nama !== "string" || nama.trim() === "") {
      throw new Error("Nama peserta tidak boleh kosong.");
    }
    if (namaDilihat.has(nama)) {
      throw new Error(`Nama peserta "${nama}" muncul lebih dari sekali.`);
    }
    namaDilihat.add(nama);
  }

  if (opsi.pembulatan !== undefined && ![1, 500, 1000].includes(opsi.pembulatan)) {
    throw new Error("Opsi pembulatan hanya boleh 1, 500, atau 1000.");
  }

  if (!Array.isArray(pengeluaran)) {
    throw new Error("Daftar pengeluaran harus berupa array.");
  }
  for (const item of pengeluaran) {
    if (!namaDilihat.has(item.pembayar)) {
      throw new Error(
        `Pembayar "${item.pembayar}" tidak ada di daftar peserta.`,
      );
    }
    if (!Number.isInteger(item.jumlah) || item.jumlah <= 0) {
      throw new Error(
        `Jumlah pengeluaran "${item.catatan ?? item.pembayar}" harus bilangan bulat Rupiah di atas 0.`,
      );
    }
    const dibagiUntuk = item.dibagiUntuk ?? peserta;
    if (dibagiUntuk.length === 0) {
      throw new Error("Daftar yang menanggung pengeluaran tidak boleh kosong.");
    }
    for (const nama of dibagiUntuk) {
      if (!namaDilihat.has(nama)) {
        throw new Error(
          `Orang "${nama}" yang ikut menanggung tidak ada di daftar peserta.`,
        );
      }
    }
    if (item.bobot !== undefined) {
      for (const [nama, bobot] of Object.entries(item.bobot)) {
        if (!namaDilihat.has(nama)) {
          throw new Error(
            `Bobot untuk "${nama}" tidak ada di daftar peserta.`,
          );
        }
        if (typeof bobot !== "number" || !(bobot > 0)) {
          throw new Error(`Bobot untuk "${nama}" harus bilangan di atas 0.`);
        }
      }
      const adaBobot = dibagiUntuk.some(
        (nama) => (item.bobot as Record<string, number>)[nama] !== undefined,
      );
      if (!adaBobot) {
        throw new Error(
          "Bobot harus menyebut setidaknya satu orang yang ikut menanggung.",
        );
      }
    }
  }
}
