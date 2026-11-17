// ============================================================================
// MODUL 2A & 2B: PROBABILITAS DASAR, BERSYARAT & TEOREMA BAYES
// Oleh: MUHAMAD HUSNI (2503010009)
// ============================================================================

// ============================================================================
// LOGIKA PROBABILITAS DASAR (SOAL 2A)
// ============================================================================
function hitungProbabilitasDasar() {
  const pa = parseFloat(document.getElementById("in-pa").value);
  const pb = parseFloat(document.getElementById("in-pb").value);
  const relasi = document.getElementById("in-relasi").value;

  if (Number.isNaN(pa) || Number.isNaN(pb) || pa < 0 || pa > 1 || pb < 0 || pb > 1) {
    tampilkanError("alert-2a", "Nilai P(A) dan P(B) harus berada pada rentang 0 sampai 1.");
    return;
  }

  let pInter = 0;
  let pUnion = 0;
  let langkah = "";
  let ket = "";

  if (relasi === "saling-lepas") {
    if (pa + pb > 1 + 1e-9) {
      tampilkanError("alert-2a", "Untuk kejadian saling lepas, jumlah P(A) + P(B) tidak boleh lebih dari 1.");
      return;
    }
    pInter = 0;
    pUnion = pa + pb;
    langkah =
      `Kejadian saling lepas: P(A ∩ B) = 0\n` +
      `P(A ∪ B) = P(A) + P(B) = ${fmt(pa)} + ${fmt(pb)} = ${fmt(pUnion)}`;
    ket =
      `Kejadian A dan B saling lepas sehingga tidak dapat terjadi bersamaan. ` +
      `Probabilitas kejadian A atau B terjadi adalah ${fmt(pUnion)} (${fmtPersen(pUnion)}).`;
  } else if (relasi === "independen") {
    pInter = pa * pb;
    pUnion = pa + pb - pInter;
    langkah =
      `Kejadian independen:\n` +
      `1. P(A ∩ B) = P(A) × P(B) = ${fmt(pa)} × ${fmt(pb)} = ${fmt(pInter)}\n` +
      `2. P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = ${fmt(pUnion)}`;
    ket =
      `Karena A dan B saling bebas, peluang keduanya terjadi bersamaan adalah ${fmt(pInter)} (${fmtPersen(pInter)}), ` +
      `sedangkan peluang A atau B terjadi adalah ${fmt(pUnion)} (${fmtPersen(pUnion)}).`;
  } else {
    const pManual = parseFloat(document.getElementById("in-pab").value);
    const minI = Math.max(0, pa + pb - 1);
    const maxI = Math.min(pa, pb);
    if (Number.isNaN(pManual) || pManual < minI - 1e-9 || pManual > maxI + 1e-9) {
      tampilkanError("alert-2a", `Nilai P(A ∩ B) harus di antara ${fmt(minI)} dan ${fmt(maxI)}.`);
      return;
    }
    pInter = pManual;
    pUnion = pa + pb - pInter;
    langkah =
      `Irisan diketahui: P(A ∩ B) = ${fmt(pInter)}\n` +
      `P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = ${fmt(pa)} + ${fmt(pb)} - ${fmt(pInter)} = ${fmt(pUnion)}`;
    ket =
      `Dengan nilai irisan ${fmt(pInter)}, probabilitas gabungan A atau B terjadi adalah ${fmt(pUnion)} (${fmtPersen(pUnion)}).`;
  }

  sembunyikanError("alert-2a");

  document.getElementById("out-2a-pa").textContent = `${fmt(pa)} (${fmtPersen(pa)})`;
  document.getElementById("out-2a-pac").textContent = `${fmt(1 - pa)} (${fmtPersen(1 - pa)})`;
  document.getElementById("out-2a-pb").textContent = `${fmt(pb)} (${fmtPersen(pb)})`;
  document.getElementById("out-2a-pbc").textContent = `${fmt(1 - pb)} (${fmtPersen(1 - pb)})`;
  document.getElementById("out-2a-inter").textContent = `${fmt(pInter)} (${fmtPersen(pInter)})`;
  document.getElementById("out-2a-union").textContent = `${fmt(pUnion)} (${fmtPersen(pUnion)})`;
  document.getElementById("rumus-2a").textContent = langkah;
  document.getElementById("ket-2a").textContent = ket;

  const hanyaA = Math.max(0, pa - pInter);
  const hanyaB = Math.max(0, pb - pInter);
  const sisa = Math.max(0, 1 - pUnion);

  document.getElementById("bar-only-a").style.width = (hanyaA * 100) + "%";
  document.getElementById("bar-inter").style.width = (pInter * 100) + "%";
  document.getElementById("bar-only-b").style.width = (hanyaB * 100) + "%";
  document.getElementById("label-sisa-ruang").textContent = "Di luar A∪B: " + fmtPersen(sisa);
}

// ============================================================================
// LOGIKA PROBABILITAS BERSYARAT & TEOREMA BAYES (SOAL 2B)
// ============================================================================
function hitungBersyarat() {
  const pa = parseFloat(document.getElementById("in-cond-pa").value);
  const pb = parseFloat(document.getElementById("in-cond-pb").value);
  const pab = parseFloat(document.getElementById("in-cond-pab").value);

  if (
    [pa, pb, pab].some((v) => Number.isNaN(v)) ||
    pa <= 0 || pa > 1 || pb <= 0 || pb > 1 || pab < 0 || pab > Math.min(pa, pb)
  ) {
    tampilkanError("alert-cond", "Pastikan 0 < P(A), P(B) ≤ 1 dan 0 ≤ P(A ∩ B) ≤ min(P(A), P(B)).");
    return;
  }

  sembunyikanError("alert-cond");

  const paGivenB = pab / pb;
  const pbGivenA = pab / pa;
  const independen = Math.abs(pab - pa * pb) < 1e-6;

  document.getElementById("out-cond-ab").textContent = `${fmt(paGivenB)} (${fmtPersen(paGivenB)})`;
  document.getElementById("out-cond-ba").textContent = `${fmt(pbGivenA)} (${fmtPersen(pbGivenA)})`;
  document.getElementById("ket-cond").textContent =
    `Apabila B sudah terjadi, peluang A terjadi adalah ${fmt(paGivenB)} (${fmtPersen(paGivenB)}). ` +
    (independen
      ? "Kedua kejadian independen karena P(A|B) = P(A)."
      : "Kedua kejadian saling bergantung karena terjadinya B memengaruhi peluang A.");
}

function hitungBayes() {
  const prev = parseFloat(document.getElementById("in-bayes-prev").value);
  const sens = parseFloat(document.getElementById("in-bayes-sens").value);
  const fp = parseFloat(document.getElementById("in-bayes-fp").value);

  if (
    [prev, sens, fp].some((v) => Number.isNaN(v)) ||
    prev <= 0 || prev >= 100 || sens < 0 || sens > 100 || fp < 0 || fp > 100
  ) {
    tampilkanError("alert-bayes", "Prevalensi harus antara 0% - 100%, sedangkan sensitivitas & false positive 0% - 100%.");
    return;
  }

  const pH = prev / 100;
  const pNotH = 1 - pH;
  const pEGivenH = sens / 100;
  const pEGivenNotH = fp / 100;

  const tp = pEGivenH * pH;
  const falsePos = pEGivenNotH * pNotH;
  const pE = tp + falsePos;

  if (pE === 0) {
    tampilkanError("alert-bayes", "Probabilitas email ditandai P(E) = 0 sehingga pembagian tidak valid.");
    return;
  }

  sembunyikanError("alert-bayes");
  const pHGivenE = tp / pE;

  document.getElementById("out-bayes-pe").textContent = `${fmt(pE)} (${fmtPersen(pE)})`;
  document.getElementById("out-bayes-post").textContent = `${fmt(pHGivenE)} (${fmtPersen(pHGivenE)})`;

  const totalEmail = 1000;
  const jmlPhishing = Math.round(totalEmail * pH);
  const jmlAman = totalEmail - jmlPhishing;
  const ditandaiBenar = Math.round(jmlPhishing * pEGivenH);
  const ditandaiSalah = Math.round(jmlAman * pEGivenNotH);
  const totalDitandai = ditandaiBenar + ditandaiSalah;

  document.getElementById("sim-bayes-text").textContent =
    `Dari ${totalEmail} email, terdapat ~${jmlPhishing} phishing (${ditandaiBenar} tertangkap sistem) dan ` +
    `~${jmlAman} email aman (${ditandaiSalah} salah ditandai). Total ${totalDitandai} email ditandai, ` +
    `sehingga proporsi phishing asli di folder peringatan adalah ${ditandaiBenar}/${totalDitandai} (${fmtPersen(pHGivenE)}).`;

  document.getElementById("rumus-bayes").textContent =
    `Diketahui: P(Phishing) = ${fmt(pH)}, P(Aman) = ${fmt(pNotH)}, P(Ditandai|Phishing) = ${fmt(pEGivenH)}, P(Ditandai|Aman) = ${fmt(pEGivenNotH)}\n` +
    `1. P(Ditandai) = (${fmt(pEGivenH)} × ${fmt(pH)}) + (${fmt(pEGivenNotH)} × ${fmt(pNotH)}) = ${fmt(tp)} + ${fmt(falsePos)} = ${fmt(pE)}\n` +
    `2. P(Phishing | Ditandai) = ${fmt(tp)} / ${fmt(pE)} = ${fmt(pHGivenE)} (${fmtPersen(pHGivenE)})`;

  document.getElementById("ket-bayes").textContent =
    `Sistem akan menandai ${fmtPersen(pE)} (${fmt(pE)}) dari total email yang masuk. ` +
    `Jika sebuah email ditandai oleh sistem, peluang email tersebut benar-benar phishing adalah ${fmtPersen(pHGivenE)} (${fmt(pHGivenE)}), ` +
    `sedangkan ${fmtPersen(1 - pHGivenE)} sisanya merupakan false positive.`;
}