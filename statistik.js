// ============================================================================
// MODUL 1: STATISTIK DESKRIPTIF & PARSING CSV
// Oleh: ADRIANDRA (2503010016)
// ============================================================================

let dataStatistikAktif = null;
let daftarKolomCSV = null;

function ambilDigitDesimal() {
  const el = document.getElementById("pilih-desimal");
  return el ? Number(el.value) : 4;
}

function fmt(nilai, digitManual = null) {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai)) return "-";
  const d = digitManual !== null ? digitManual : ambilDigitDesimal();
  return Number(nilai.toFixed(d)).toString();
}

function fmtPersen(peluang) {
  return (peluang * 100).toFixed(2) + "%";
}

function tampilkanError(id, pesan) {
  const el = document.getElementById(id);
  el.textContent = pesan;
  el.classList.remove("hidden");
}

function sembunyikanError(id) {
  document.getElementById(id).classList.add("hidden");
}

// ============================================================================
// PARSING INPUT MANUAL & CSV
// ============================================================================
function ekstrakAngka(teks) {
  if (!teks || !teks.trim()) return [];
  return teks
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

function bacaCSVMultiKolom(isiTeks) {
  const baris = isiTeks
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  if (baris.length < 2) return null;

  const pemisah = baris[0].includes(";") ? ";" : ",";
  const tabel = baris.map((b) => b.split(pemisah).map((sel) => sel.trim()));
  const jumlahKolom = tabel[0].length;

  if (jumlahKolom <= 1) return null;

  const adaHeader = tabel[0].some((sel) => Number.isNaN(Number(sel)));
  const namaKolom = adaHeader
    ? tabel[0]
    : tabel[0].map((_, i) => "Kolom " + (i + 1));
  const barisData = adaHeader ? tabel.slice(1) : tabel;

  const kolomValid = [];
  for (let c = 0; c < jumlahKolom; c++) {
    const angka = barisData
      .map((r) => (r[c] !== undefined && r[c] !== "" ? Number(r[c]) : NaN))
      .filter((n) => Number.isFinite(n));

    if (angka.length > 0) {
      kolomValid.push({
        nama: namaKolom[c] || "Kolom " + (c + 1),
        data: angka,
      });
    }
  }

  return kolomValid.length > 0 ? kolomValid : null;
}

function unduhTemplateCSV() {
  const isiCSV =
    "No,NIM,Nilai_Statistika\n" +
    "1,2503010001,78\n" +
    "2,2503010002,82\n" +
    "3,2503010003,85\n" +
    "4,2503010004,88\n" +
    "5,2503010005,88\n" +
    "6,2503010006,90\n" +
    "7,2503010007,92\n" +
    "8,2503010008,74\n" +
    "9,2503010009,80\n" +
    "10,2503010010,95\n" +
    "11,2503010011,42\n" +
    "12,2503010012,135\n";

  const blob = new Blob([isiCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "template_data_uts.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function eksporHasilCSV() {
  if (!dataStatistikAktif) {
    tampilkanError("alert-stat", "Hitung data terlebih dahulu sebelum mengekspor hasil ke CSV.");
    return;
  }

  const s = dataStatistikAktif;
  const baris = [
    ["No", "Ukuran Statistik", "Hasil"],
    ["1", "Jumlah data (n)", s.n],
    ["2", "Total nilai (Sigma x)", fmt(s.sum)],
    ["3", "Mean (rata-rata)", fmt(s.mean)],
    ["4", "Median", fmt(s.median)],
    ["5", "Modus", `"${s.modus}"`],
    ["6", "Nilai minimum", fmt(s.min)],
    ["7", "Nilai maksimum", fmt(s.max)],
    ["8", "Range (jangkauan)", fmt(s.range)],
    ["9", "Varians sampel (s^2)", s.varSampel !== null ? fmt(s.varSampel) : "-"],
    ["10", "Standar deviasi sampel (s)", s.sdSampel !== null ? fmt(s.sdSampel) : "-"],
    ["11", "Kuartil 1 (Q1)", fmt(s.q1)],
    ["12", "Kuartil 3 (Q3)", fmt(s.q3)],
    ["13", "Interquartile Range (IQR)", fmt(s.iqr)],
    ["14", "Outlier terdeteksi", s.outlier.length > 0 ? `"${s.outlier.join(", ")}"` : "Tidak ada"],
  ];

  const konten = baris.map((r) => r.join(",")).join("\n");
  const blob = new Blob([konten], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hasil_statistik_deskriptif.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// PERHITUNGAN 14 UKURAN STATISTIK DESKRIPTIF
// ============================================================================
function hitungKuartil(urut, q) {
  const n = urut.length;
  if (n === 1) return urut[0];
  const pos = q * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const frac = pos - lo;
  return urut[lo] + frac * (urut[hi] - urut[lo]);
}

function cariModus(urut) {
  const mapFrek = new Map();
  let maks = 0;

  for (const angka of urut) {
    const jumlah = (mapFrek.get(angka) || 0) + 1;
    mapFrek.set(angka, jumlah);
    if (jumlah > maks) maks = jumlah;
  }

  if (maks <= 1) return "Tidak ada modus";

  const hasil = [];
  mapFrek.forEach((jumlah, nilai) => {
    if (jumlah === maks) hasil.push(nilai);
  });

  if (hasil.length === mapFrek.size) return "Tidak ada modus";
  return hasil.join(", ") + " (" + maks + "x)";
}

function buatDistribusiFrekuensi(urut) {
  const n = urut.length;
  const min = urut[0];
  const max = urut[n - 1];

  if (min === max) {
    return [{
      kelas: 1,
      interval: fmt(min, 2),
      tengah: min,
      frek: n,
      relatif: 100,
      kumulatif: n,
    }];
  }

  // Aturan Sturges: k = 1 + 3.322 log10(n)
  const k = Math.max(1, Math.ceil(1 + 3.322 * Math.log10(n)));
  const lebar = (max - min) / k;
  const daftarKelas = [];
  let kumulatif = 0;

  for (let i = 0; i < k; i++) {
    const bawah = min + i * lebar;
    const atas = i === k - 1 ? max : min + (i + 1) * lebar;
    const frek = urut.filter((x) =>
      i === k - 1 ? x >= bawah && x <= atas : x >= bawah && x < atas
    ).length;

    kumulatif += frek;
    daftarKelas.push({
      kelas: i + 1,
      interval: fmt(bawah, 1) + " - " + fmt(atas, 1),
      tengah: (bawah + atas) / 2,
      frek: frek,
      relatif: (frek / n) * 100,
      kumulatif: kumulatif,
    });
  }

  return daftarKelas;
}

function prosesStatistik() {
  const teks = document.getElementById("input-angka").value;
  const angka = ekstrakAngka(teks);

  if (angka.length === 0) {
    tampilkanError("alert-stat", "Masukkan minimal 1 data angka yang valid sebelum menghitung.");
    return;
  }

  sembunyikanError("alert-stat");

  const urut = [...angka].sort((a, b) => a - b);
  const n = urut.length;
  const sum = urut.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? urut[mid] : (urut[mid - 1] + urut[mid]) / 2;
  const modus = cariModus(urut);

  const min = urut[0];
  const max = urut[n - 1];
  const range = max - min;

  const ss = urut.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const varPop = ss / n;
  const sdPop = Math.sqrt(varPop);
  const varSampel = n > 1 ? ss / (n - 1) : null;
  const sdSampel = n > 1 ? Math.sqrt(varSampel) : null;

  const q1 = hitungKuartil(urut, 0.25);
  const q3 = hitungKuartil(urut, 0.75);
  const iqr = q3 - q1;

  // Metode Tukey Fences untuk deteksi outlier
  const batasBawah = q1 - 1.5 * iqr;
  const batasAtas = q3 + 1.5 * iqr;
  const outlier = urut.filter((x) => x < batasBawah || x > batasAtas);
  const bins = buatDistribusiFrekuensi(urut);

  dataStatistikAktif = {
    urut, n, sum, mean, median, modus, min, max, range,
    varSampel, varPop, sdSampel, sdPop, q1, q3, iqr,
    batasBawah, batasAtas, outlier, bins
  };

  renderHasilStatistik();
}

function renderHasilStatistik() {
  if (!dataStatistikAktif) return;
  const s = dataStatistikAktif;

  // Kartu KPI Atas
  document.getElementById("top-n").textContent = s.n;
  document.getElementById("top-mean").textContent = fmt(s.mean);
  document.getElementById("top-median").textContent = fmt(s.median);
  document.getElementById("top-sd").textContent = s.sdSampel !== null ? fmt(s.sdSampel) : fmt(s.sdPop);

  // Tabel 14 Parameter
  document.getElementById("status-urut").textContent = s.n + " data terurut";
  document.getElementById("val-n").textContent = s.n;
  document.getElementById("val-sum").textContent = fmt(s.sum);
  document.getElementById("val-mean").textContent = fmt(s.mean);
  document.getElementById("val-median").textContent = fmt(s.median);
  document.getElementById("val-mode").textContent = s.modus;
  document.getElementById("val-min").textContent = fmt(s.min);
  document.getElementById("val-max").textContent = fmt(s.max);
  document.getElementById("val-range").textContent = fmt(s.range);

  document.getElementById("val-var").textContent =
    s.varSampel !== null
      ? fmt(s.varSampel) + " (s²) | " + fmt(s.varPop) + " (σ²)"
      : "- (s²) | " + fmt(s.varPop) + " (σ²)";

  document.getElementById("val-sd").textContent =
    s.sdSampel !== null
      ? fmt(s.sdSampel) + " (s) | " + fmt(s.sdPop) + " (σ)"
      : "- (s) | " + fmt(s.sdPop) + " (σ)";

  document.getElementById("val-q1").textContent = fmt(s.q1);
  document.getElementById("val-q3").textContent = fmt(s.q3);
  document.getElementById("val-iqr").textContent = fmt(s.iqr);

  const infoPagar = " [batas: " + fmt(s.batasBawah, 2) + " s.d. " + fmt(s.batasAtas, 2) + "]";
  document.getElementById("val-outlier").textContent =
    s.outlier.length > 0 ? s.outlier.join(", ") + infoPagar : "Tidak ada" + infoPagar;

  document.getElementById("val-urut").textContent = s.urut.join(", ");

  // Tabel Frekuensi
  const tbody = document.getElementById("tbody-freq");
  tbody.innerHTML = s.bins
    .map(
      (b) => `
      <tr>
        <td>${b.kelas}</td>
        <td>${b.interval}</td>
        <td>${fmt(b.tengah, 2)}</td>
        <td><strong>${b.frek}</strong></td>
        <td>${b.relatif.toFixed(2)}%</td>
        <td>${b.kumulatif}</td>
      </tr>`
    )
    .join("");

  gambarSemuaGrafik();
}