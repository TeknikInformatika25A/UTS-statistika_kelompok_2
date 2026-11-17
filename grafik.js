// ============================================================================
// MODUL VISUALISASI GRAFIK HTML5 CANVAS
// Oleh: MUHAMAD FRIAN ERLIANA (2503010017)
// ============================================================================

let areaHoverHistogram = [];
let areaHoverBatang = [];
let areaHoverBoxplot = [];

function setupCanvas(id) {
  const canvas = document.getElementById(id);
  const box = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(100, box.width) * dpr;
  canvas.height = Math.max(100, box.height) * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { canvas, ctx, w: box.width, h: box.height };
}

function gambarSemuaGrafik() {
  if (!dataStatistikAktif) return;
  gambarHistogram(dataStatistikAktif.bins);
  gambarBoxplot(dataStatistikAktif);
  gambarDiagramBatang(dataStatistikAktif.bins);
}

function gambarHistogram(bins) {
  const { ctx, w, h } = setupCanvas("canvas-hist");
  ctx.clearRect(0, 0, w, h);
  areaHoverHistogram = [];
  if (!bins || bins.length === 0) return;

  const pad = { top: 24, right: 16, bottom: 42, left: 38 };
  const areaW = w - pad.left - pad.right;
  const areaH = h - pad.top - pad.bottom;
  const maxF = Math.max(...bins.map((b) => b.frek), 1);

  ctx.strokeStyle = "#e4e4e7";
  ctx.fillStyle = "#71717a";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";

  const ticks = Math.min(maxF, 5);
  for (let i = 0; i <= ticks; i++) {
    const val = Math.round((maxF / ticks) * i);
    const y = pad.top + areaH - (val / maxF) * areaH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + areaW, y);
    ctx.stroke();
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  const barW = areaW / bins.length;
  bins.forEach((b, i) => {
    const barH = (b.frek / maxF) * areaH;
    const x = pad.left + i * barW;
    const y = pad.top + areaH - barH;

    ctx.fillStyle = "#0d9488";
    ctx.fillRect(x, y, barW, barH);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barW, barH);

    areaHoverHistogram.push({
      x, y, w: barW, h: barH,
      teks: `Interval: ${b.interval}\nFrekuensi: ${b.frek} (${b.relatif.toFixed(1)}%)`
    });

    ctx.fillStyle = "#18181b";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(b.frek, x + barW / 2, y - 5);

    ctx.fillStyle = "#52525b";
    ctx.font = "10px sans-serif";
    ctx.fillText(b.interval, x + barW / 2, pad.top + areaH + 16);
  });

  ctx.strokeStyle = "#52525b";
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + areaH);
  ctx.lineTo(pad.left + areaW, pad.top + areaH);
  ctx.stroke();
}

function gambarDiagramBatang(bins) {
  const { ctx, w, h } = setupCanvas("canvas-bar");
  ctx.clearRect(0, 0, w, h);
  areaHoverBatang = [];
  if (!bins || bins.length === 0) return;

  const pad = { top: 24, right: 20, bottom: 42, left: 42 };
  const areaW = w - pad.left - pad.right;
  const areaH = h - pad.top - pad.bottom;
  const maxF = Math.max(...bins.map((b) => b.frek), 1);

  ctx.strokeStyle = "#e4e4e7";
  ctx.fillStyle = "#71717a";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";

  const ticks = Math.min(maxF, 5);
  for (let i = 0; i <= ticks; i++) {
    const val = Math.round((maxF / ticks) * i);
    const y = pad.top + areaH - (val / maxF) * areaH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + areaW, y);
    ctx.stroke();
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  const slot = areaW / bins.length;
  const barW = Math.min(54, slot * 0.62);

  bins.forEach((b, i) => {
    const barH = (b.frek / maxF) * areaH;
    const x = pad.left + i * slot + (slot - barW) / 2;
    const y = pad.top + areaH - barH;

    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x, y, barW, barH);

    areaHoverBatang.push({
      x, y, w: barW, h: barH,
      teks: `Kelas ${b.kelas} (${b.interval})\nFrekuensi: ${b.frek} data\nRelatif: ${b.relatif.toFixed(2)}%`
    });

    ctx.fillStyle = "#18181b";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${b.frek} (${b.relatif.toFixed(0)}%)`, x + barW / 2, y - 5);

    ctx.fillStyle = "#52525b";
    ctx.font = "10px sans-serif";
    ctx.fillText(b.interval, x + barW / 2, pad.top + areaH + 16);
  });

  ctx.strokeStyle = "#52525b";
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + areaH);
  ctx.lineTo(pad.left + areaW, pad.top + areaH);
  ctx.stroke();
}

function gambarBoxplot(s) {
  const { ctx, w, h } = setupCanvas("canvas-box");
  ctx.clearRect(0, 0, w, h);
  areaHoverBoxplot = [];
  if (!s) return;

  const pad = { top: 26, right: 28, bottom: 42, left: 28 };
  const areaW = w - pad.left - pad.right;
  const midY = pad.top + (h - pad.top - pad.bottom) * 0.48;
  const boxH = 48;

  const normal = s.urut.filter((x) => x >= s.batasBawah && x <= s.batasAtas);
  const wLow = normal.length > 0 ? normal[0] : s.min;
  const wHigh = normal.length > 0 ? normal[normal.length - 1] : s.max;

  const span = s.max - s.min === 0 ? 1 : s.max - s.min;
  const toX = (val) => pad.left + ((val - s.min) / span) * areaW;

  const xLow = toX(wLow);
  const xHigh = toX(wHigh);
  const xQ1 = toX(s.q1);
  const xMed = toX(s.median);
  const xQ3 = toX(s.q3);

  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(xLow, midY);
  ctx.lineTo(xHigh, midY);
  ctx.moveTo(xLow, midY - 12);
  ctx.lineTo(xLow, midY + 12);
  ctx.moveTo(xHigh, midY - 12);
  ctx.lineTo(xHigh, midY + 12);
  ctx.stroke();

  const rectW = Math.max(4, xQ3 - xQ1);
  ctx.fillStyle = "#ccfbf1";
  ctx.strokeStyle = "#0d9488";
  ctx.lineWidth = 2;
  ctx.fillRect(xQ1, midY - boxH / 2, rectW, boxH);
  ctx.strokeRect(xQ1, midY - boxH / 2, rectW, boxH);

  areaHoverBoxplot.push({
    x: xQ1, y: midY - boxH / 2, w: rectW, h: boxH,
    teks: `Q1: ${fmt(s.q1, 2)}\nMedian: ${fmt(s.median, 2)}\nQ3: ${fmt(s.q3, 2)}\nIQR: ${fmt(s.iqr, 2)}`
  });

  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(xMed, midY - boxH / 2);
  ctx.lineTo(xMed, midY + boxH / 2);
  ctx.stroke();

  s.outlier.forEach((val) => {
    const ox = toX(val);
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(ox, midY, 5, 0, Math.PI * 2);
    ctx.fill();

    areaHoverBoxplot.push({
      x: ox - 7, y: midY - 7, w: 14, h: 14,
      teks: `Outlier terdeteksi: ${val}`
    });

    ctx.fillStyle = "#991b1b";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fmt(val, 1), ox, midY - 10);
  });

  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#0f766e";
  ctx.fillText("Q1: " + fmt(s.q1, 1), xQ1, midY + boxH / 2 + 15);
  ctx.fillText("Q3: " + fmt(s.q3, 1), xQ3, midY + boxH / 2 + 15);

  ctx.fillStyle = "#b45309";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("Med: " + fmt(s.median, 1), xMed, midY - boxH / 2 - 8);

  const axisY = h - 22;
  ctx.strokeStyle = "#a1a1aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, axisY);
  ctx.lineTo(pad.left + areaW, axisY);
  ctx.stroke();

  ctx.fillStyle = "#52525b";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Min: " + fmt(s.min, 1), pad.left, axisY + 13);
  ctx.textAlign = "right";
  ctx.fillText("Max: " + fmt(s.max, 1), pad.left + areaW, axisY + 13);
}

function pasangTooltipCanvas(canvasId, getAreas) {
  const canvas = document.getElementById(canvasId);
  const tooltip = document.getElementById("chart-tooltip");

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = getAreas().find(
      (a) => mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h
    );

    if (hit) {
      tooltip.textContent = hit.teks;
      tooltip.style.left = e.clientX + 12 + "px";
      tooltip.style.top = e.clientY + 12 + "px";
      tooltip.classList.remove("hidden");
    } else {
      tooltip.classList.add("hidden");
    }
  });

  canvas.addEventListener("mouseleave", () => {
    tooltip.classList.add("hidden");
  });
}