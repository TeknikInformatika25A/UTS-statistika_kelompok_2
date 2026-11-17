// ============================================================================
// KONTROLER UTAMA & INISIALISASI EVENT APLIKASI
// Oleh: RIZKAN ANWAR FAUZI (2503010021)
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Navigasi Sidebar
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".menu-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".page-view").forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const target = btn.getAttribute("data-target");
      document.getElementById(target).classList.add("active");

      if (target === "page-stat" && dataStatistikAktif) {
        gambarSemuaGrafik();
      }
    });
  });

  // Switcher Jenis Grafik
  document.querySelectorAll(".chart-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".chart-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const mode = tab.getAttribute("data-chart");
      const cardHist = document.getElementById("card-hist");
      const cardBox = document.getElementById("card-box");
      const cardBar = document.getElementById("card-bar");

      cardHist.classList.toggle("hidden", mode !== "all" && mode !== "hist");
      cardBox.classList.toggle("hidden", mode !== "all" && mode !== "box");
      cardBar.classList.toggle("hidden", mode !== "all" && mode !== "bar");

      cardHist.classList.toggle("full-span", mode === "hist");
      cardBox.classList.toggle("full-span", mode === "box");
      cardBar.classList.toggle("full-span", mode === "all" || mode === "bar");

      gambarSemuaGrafik();
    });
  });

  // Ubah pembulatan desimal secara real-time
  document.getElementById("pilih-desimal").addEventListener("change", () => {
    renderHasilStatistik();
    hitungProbabilitasDasar();
    hitungBersyarat();
    hitungBayes();
  });

  document.getElementById("btn-cetak").addEventListener("click", () => window.print());

  // Event Soal 1
  document.getElementById("btn-unduh-template").addEventListener("click", unduhTemplateCSV);
  document.getElementById("btn-ekspor-hasil").addEventListener("click", eksporHasilCSV);
  document.getElementById("btn-proses-stat").addEventListener("click", prosesStatistik);

  document.getElementById("btn-isi-contoh").addEventListener("click", () => {
    document.getElementById("input-angka").value = "72, 75, 78, 80, 82, 84, 84, 86, 88, 90, 92, 95, 38, 134";
    prosesStatistik();
  });

  document.getElementById("btn-bersihkan").addEventListener("click", () => {
    document.getElementById("input-angka").value = "";
    document.getElementById("input-file-csv").value = "";
    document.getElementById("nama-file-csv").textContent = "Klik untuk memilih file CSV";
    document.getElementById("box-kolom-csv").classList.add("hidden");
    sembunyikanError("alert-stat");

    dataStatistikAktif = null;
    document.getElementById("top-n").textContent = "0";
    document.getElementById("top-mean").textContent = "-";
    document.getElementById("top-median").textContent = "-";
    document.getElementById("top-sd").textContent = "-";
    document.getElementById("status-urut").textContent = "Menunggu input data";

    [
      "val-n", "val-sum", "val-mean", "val-median", "val-mode",
      "val-min", "val-max", "val-range", "val-var", "val-sd",
      "val-q1", "val-q3", "val-iqr", "val-outlier", "val-urut"
    ].forEach((id) => (document.getElementById(id).textContent = "-"));

    document.getElementById("tbody-freq").innerHTML =
      '<tr><td colspan="6" class="muted">Belum ada data yang diproses.</td></tr>';

    ["canvas-hist", "canvas-box", "canvas-bar"].forEach((id) => {
      const c = setupCanvas(id);
      c.ctx.clearRect(0, 0, c.w, c.h);
    });
  });

  // Upload CSV
  document.getElementById("input-file-csv").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById("nama-file-csv").textContent = "File aktif: " + file.name;
    const reader = new FileReader();

    reader.onload = (ev) => {
      const isi = ev.target.result;
      const kolom = bacaCSVMultiKolom(isi);
      const boxKolom = document.getElementById("box-kolom-csv");
      const selectKolom = document.getElementById("select-kolom-csv");

      if (kolom && kolom.length > 1) {
        daftarKolomCSV = kolom;
        selectKolom.innerHTML = kolom
          .map((k, idx) => `<option value="${idx}">${k.nama} (${k.data.length} baris)</option>`)
          .join("");
        boxKolom.classList.remove("hidden");
        document.getElementById("input-angka").value = kolom[0].data.join(", ");
        prosesStatistik();
      } else {
        daftarKolomCSV = null;
        boxKolom.classList.add("hidden");
        const angka = kolom ? kolom[0].data : ekstrakAngka(isi);
        document.getElementById("input-angka").value = angka.join(", ");
        prosesStatistik();
      }
    };

    reader.readAsText(file);
  });

  document.getElementById("select-kolom-csv").addEventListener("change", (e) => {
    const idx = Number(e.target.value);
    if (daftarKolomCSV && daftarKolomCSV[idx]) {
      document.getElementById("input-angka").value = daftarKolomCSV[idx].data.join(", ");
      prosesStatistik();
    }
  });

  // Event Soal 2A
  document.getElementById("in-relasi").addEventListener("change", (e) => {
    document.getElementById("box-irisan-manual").classList.toggle("hidden", e.target.value !== "umum");
    hitungProbabilitasDasar();
  });

  document.getElementById("btn-hitung-2a").addEventListener("click", hitungProbabilitasDasar);

  document.getElementById("btn-kasus-2a").addEventListener("click", () => {
    document.getElementById("in-pa").value = 0.3;
    document.getElementById("in-pb").value = 0.4;
    document.getElementById("in-relasi").value = "saling-lepas";
    document.getElementById("box-irisan-manual").classList.add("hidden");
    hitungProbabilitasDasar();
  });

  document.getElementById("btn-terapkan-ns").addEventListener("click", () => {
    const na = parseFloat(document.getElementById("in-na").value);
    const ns = parseFloat(document.getElementById("in-ns").value);
    if (Number.isNaN(na) || Number.isNaN(ns) || ns <= 0 || na < 0 || na > ns) {
      tampilkanError("alert-2a", "Syarat ruang sampel: 0 ≤ n(A) ≤ n(S) dan n(S) > 0.");
      return;
    }
    sembunyikanError("alert-2a");
    document.getElementById("in-pa").value = Number((na / ns).toFixed(4));
    hitungProbabilitasDasar();
  });

  // Event Soal 2B
  document.getElementById("btn-hitung-cond").addEventListener("click", hitungBersyarat);
  document.getElementById("btn-hitung-bayes").addEventListener("click", hitungBayes);

  document.getElementById("btn-kasus-2b").addEventListener("click", () => {
    document.getElementById("in-bayes-prev").value = 8;
    document.getElementById("in-bayes-sens").value = 92;
    document.getElementById("in-bayes-fp").value = 3;
    hitungBayes();
  });

  // Pasang Tooltip Grafik & Responsif Resize
  pasangTooltipCanvas("canvas-hist", () => areaHoverHistogram);
  pasangTooltipCanvas("canvas-box", () => areaHoverBoxplot);
  pasangTooltipCanvas("canvas-bar", () => areaHoverBatang);

  window.addEventListener("resize", () => {
    if (dataStatistikAktif) gambarSemuaGrafik();
  });

  // Jalankan data contoh awal agar halaman langsung terisi saat pertama dibuka
  document.getElementById("input-angka").value = "72, 75, 78, 80, 82, 84, 84, 86, 88, 90, 92, 95, 38, 134";
  prosesStatistik();
  hitungProbabilitasDasar();
  hitungBersyarat();
  hitungBayes();
});