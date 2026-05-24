// PoopSense AI — PDF generator using Canvas API (no external deps)
// Produces a clean A4-style report as a downloadable PDF via print-to-PDF trick
// or a canvas-rendered image blob.

const BRAND = '#3A2700';
const AMBER = '#C47808';
const GREEN = '#195C30';
const RED   = '#AD2218';
const LIGHT = '#F9F5EF';
const WHITE = '#FFFFFF';
const GREY  = '#9C7D52';

const RISK_COLOR = { g: GREEN, w: AMBER, c: RED };
const RISK_LABEL = { g: 'Low Risk ✓', w: 'Monitor ⚠', c: 'Urgent ✕' };
const RISK_BG    = { g: '#E7F4EC', w: '#FFF6E8', c: '#FCECEA' };

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;
  const words = String(text).split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) { ctx.fillText(line, x, y); y += lineHeight; }
  return y;
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

export async function buildPoopSensePDF(entry, dog) {
  const W = 595; // A4 width in px at 72dpi
  const PAD = 28;
  const INNER = W - PAD * 2;

  // We'll draw to a tall canvas then crop
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = 1200; // will trim later
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = LIGHT;
  ctx.fillRect(0, 0, W, canvas.height);

  let y = 0;

  // ── HEADER BAND ──────────────────────────────────────────────────
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, W, 72);

  ctx.fillStyle = WHITE;
  ctx.font = 'bold 18px Poppins, Arial, sans-serif';
  ctx.fillText('PoopSense AI', PAD, 28);

  ctx.font = '10px Poppins, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText('by Doglicious.in  ·  AI Stool Health Analysis', PAD, 44);

  // Report ID top-right
  ctx.font = '9px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textAlign = 'right';
  ctx.fillText(`#${entry.id}`, W - PAD, 28);
  ctx.textAlign = 'left';

  // Date/time
  ctx.font = '9px Poppins, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(`${entry.date}  ·  ${entry.time}`, PAD, 60);

  y = 88;

  // ── DOG INFO ─────────────────────────────────────────────────────
  if (dog) {
    roundRect(ctx, PAD, y, INNER, 44, 8, WHITE, 'rgba(58,39,0,0.1)');
    ctx.font = 'bold 13px Poppins, Arial, sans-serif';
    ctx.fillStyle = BRAND;
    ctx.fillText(`${dog.av || '🐕'}  ${dog.name}`, PAD + 12, y + 17);
    ctx.font = '10px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText(`${dog.breed || ''}  ·  ${dog.age || '?'}yr  ·  ${dog.wt || '?'}kg  ·  ${dog.diet || ''}`, PAD + 12, y + 33);
    y += 56;
  }

  // ── SCORE BAND ───────────────────────────────────────────────────
  const rk = entry.risk || 'w';
  roundRect(ctx, PAD, y, INNER, 64, 10, RISK_BG[rk], RISK_COLOR[rk] + '44');

  // Score circle
  ctx.beginPath();
  ctx.arc(PAD + 40, y + 32, 26, 0, Math.PI * 2);
  ctx.fillStyle = RISK_COLOR[rk];
  ctx.fill();
  ctx.font = 'bold 18px Poppins, Arial, sans-serif';
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.fillText(String(entry.score ?? 0), PAD + 40, y + 38);
  ctx.textAlign = 'left';

  ctx.font = 'bold 14px Poppins, Arial, sans-serif';
  ctx.fillStyle = RISK_COLOR[rk];
  ctx.fillText(RISK_LABEL[rk], PAD + 76, y + 24);

  ctx.font = '10px Poppins, Arial, sans-serif';
  ctx.fillStyle = BRAND;
  ctx.fillText(entry.stoolType || '', PAD + 76, y + 40);

  ctx.font = '9px Poppins, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText(`Bristol Scale: Type ${entry.bristolScore || '?'}/7`, PAD + 76, y + 54);

  y += 76;

  // ── CHARACTERISTICS GRID ─────────────────────────────────────────
  const cells = [
    { l: 'Colour',      v: entry.color       || 'N/A' },
    { l: 'Consistency', v: entry.consistency || 'N/A' },
    { l: 'Bristol',     v: `Type ${entry.bristolScore || '?'}/7` },
    { l: 'Type',        v: entry.stoolType   || 'N/A' },
  ];
  const cw = (INNER - 8) / 2;
  cells.forEach(({ l, v }, i) => {
    const cx = PAD + (i % 2) * (cw + 8);
    const cy = y + Math.floor(i / 2) * 48;
    roundRect(ctx, cx, cy, cw, 42, 7, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = '8px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText(l.toUpperCase(), cx + 10, cy + 14);
    ctx.font = 'bold 11px Poppins, Arial, sans-serif';
    ctx.fillStyle = BRAND;
    ctx.fillText(v, cx + 10, cy + 30);
  });
  y += 2 * 48 + 12;

  // ── SCORE PARAMS BAR CHART ───────────────────────────────────────
  if (entry.params) {
    roundRect(ctx, PAD, y, INNER, 110, 8, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 9px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('SCORE BREAKDOWN', PAD + 10, y + 16);

    const params = [
      { k: 'color',       l: 'Colour',      max: 20 },
      { k: 'consistency', l: 'Consistency', max: 25 },
      { k: 'shape',       l: 'Shape',       max: 15 },
      { k: 'contents',    l: 'Contents',    max: 20 },
      { k: 'riskPattern', l: 'Risk Pattern',max: 20 },
    ];
    const barX = PAD + 90;
    const barW = INNER - 90 - 36;
    params.forEach(({ k, l, max }, i) => {
      const py = y + 28 + i * 16;
      const val = entry.params[k] ?? 0;
      const pct = val / max;

      ctx.font = '9px Poppins, Arial, sans-serif';
      ctx.fillStyle = BRAND;
      ctx.fillText(l, PAD + 10, py + 8);

      // Track
      roundRect(ctx, barX, py, barW, 8, 4, '#EAE0D0');
      // Fill
      roundRect(ctx, barX, py, Math.max(4, barW * pct), 8, 4, RISK_COLOR[rk]);

      // Value
      ctx.font = '8px Poppins, Arial, sans-serif';
      ctx.fillStyle = GREY;
      ctx.textAlign = 'right';
      ctx.fillText(`${val}/${max}`, PAD + INNER - 4, py + 8);
      ctx.textAlign = 'left';
    });
    y += 122;
  }

  // ── CLINICAL SUMMARY ─────────────────────────────────────────────
  if (entry.sum) {
    roundRect(ctx, PAD, y, INNER, 8, 0, AMBER); // left accent bar
    roundRect(ctx, PAD + 4, y, INNER - 4, 8, 0, '#FFF6E8');
    // Measure text height
    ctx.font = '10px Poppins, Arial, sans-serif';
    const lines = Math.ceil(ctx.measureText(entry.sum).width / (INNER - 24)) + 1;
    const boxH = Math.max(40, lines * 14 + 20);
    roundRect(ctx, PAD, y, INNER, boxH, 6, '#FFF6E8', AMBER + '44');
    ctx.fillStyle = BRAND;
    ctx.font = 'bold 9px Poppins, Arial, sans-serif';
    ctx.fillText('CLINICAL SUMMARY', PAD + 10, y + 14);
    ctx.font = '10px Poppins, Arial, sans-serif';
    ctx.fillStyle = '#5C3F18';
    wrapText(ctx, entry.sum, PAD + 10, y + 28, INNER - 20, 14);
    y += boxH + 10;
  }

  // ── SIMPLE TERMS ─────────────────────────────────────────────────
  if (entry.simpleEn) {
    ctx.font = '10px Poppins, Arial, sans-serif';
    const lines = Math.ceil(ctx.measureText(entry.simpleEn).width / (INNER - 24)) + 1;
    const boxH = Math.max(44, lines * 14 + 24);
    roundRect(ctx, PAD, y, INNER, boxH, 6, '#E8F4FD', 'rgba(52,152,219,0.3)');
    ctx.font = 'bold 9px Poppins, Arial, sans-serif';
    ctx.fillStyle = '#1A5276';
    ctx.fillText('💡 IN SIMPLE TERMS', PAD + 10, y + 14);
    ctx.font = '10px Poppins, Arial, sans-serif';
    ctx.fillStyle = '#1A3550';
    wrapText(ctx, entry.simpleEn, PAD + 10, y + 28, INNER - 20, 14);
    y += boxH + 10;
  }

  // ── RECOMMENDATIONS ──────────────────────────────────────────────
  if (entry.recommendations?.length) {
    const recH = entry.recommendations.length * 18 + 28;
    roundRect(ctx, PAD, y, INNER, recH, 6, '#EEF6F1', 'rgba(25,92,48,0.2)');
    ctx.font = 'bold 9px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREEN;
    ctx.fillText('🩺 AI ACTION PLAN', PAD + 10, y + 14);
    entry.recommendations.forEach((rec, i) => {
      // Number circle
      ctx.beginPath();
      ctx.arc(PAD + 18, y + 26 + i * 18, 7, 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.fill();
      ctx.font = 'bold 8px Poppins, Arial, sans-serif';
      ctx.fillStyle = WHITE;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), PAD + 18, y + 29 + i * 18);
      ctx.textAlign = 'left';
      ctx.font = '9px Poppins, Arial, sans-serif';
      ctx.fillStyle = '#5C3F18';
      ctx.fillText(rec, PAD + 32, y + 29 + i * 18);
    });
    y += recH + 10;
  }

  // ── STOOL IMAGE ──────────────────────────────────────────────────
  if (entry.imgB64) {
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const imgH = 120;
        const imgW = Math.min(INNER, (img.width / img.height) * imgH);
        roundRect(ctx, PAD, y, INNER, imgH + 20, 8, WHITE, 'rgba(58,39,0,0.08)');
        ctx.font = 'bold 9px Poppins, Arial, sans-serif';
        ctx.fillStyle = GREY;
        ctx.fillText('SCAN PHOTO', PAD + 10, y + 14);
        ctx.drawImage(img, PAD + (INNER - imgW) / 2, y + 18, imgW, imgH);
        y += imgH + 32;
        resolve();
      };
      img.onerror = resolve;
      img.src = `data:image/jpeg;base64,${entry.imgB64}`;
    });
  }

  // ── FOOTER ───────────────────────────────────────────────────────
  y += 8;
  ctx.fillStyle = 'rgba(58,39,0,0.12)';
  ctx.fillRect(PAD, y, INNER, 1);
  y += 10;
  ctx.font = '8px Poppins, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText('PoopSense AI by Doglicious.in  ·  AI analysis only — not a substitute for veterinary diagnosis', PAD, y + 8);
  ctx.textAlign = 'right';
  ctx.fillText(`Report ID: ${entry.id}`, W - PAD, y + 8);
  ctx.textAlign = 'left';
  y += 24;

  // ── TRIM CANVAS ──────────────────────────────────────────────────
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = W;
  finalCanvas.height = y;
  const fCtx = finalCanvas.getContext('2d');
  fCtx.drawImage(canvas, 0, 0);

  return finalCanvas;
}

export async function downloadPoopSensePDF(entry, dog) {
  const canvas = await buildPoopSensePDF(entry, dog);
  const dogName = dog?.name || 'Dog';
  const filename = `PoopSense_${dogName}_${entry.date}_${entry.id}.pdf`;

  // Use print window approach for true PDF output
  const imgData = canvas.toDataURL('image/png', 1.0);

  const win = window.open('', '_blank');
  if (!win) {
    // Fallback: download as PNG if popup blocked
    const a = document.createElement('a');
    a.href = imgData;
    a.download = filename.replace('.pdf', '.png');
    a.click();
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; }
    img { display: block; width: 100%; max-width: 595px; margin: 0 auto; }
    @media print {
      body { margin: 0; }
      img { width: 100%; max-width: 100%; page-break-inside: avoid; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
  <img src="${imgData}" />
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`);
  win.document.close();
}

// ─── PROGRESS / HISTORY REPORT PDF ───────────────────────────────────────────

function filterByDays(history, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutStr = cutoff.toISOString().slice(0, 10);
  return [...history]
    .filter(e => e.date >= cutStr)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

function fmtDateShortLocal(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[parseInt(m,10)-1]} ${y}`;
}

export async function buildProgressPDF(history, dog, days) {
  const entries = filterByDays(history, days);
  const W = 595;
  const PAD = 28;
  const INNER = W - PAD * 2;

  // Estimate height: header + summary + bar chart + entries list
  const estimatedH = 200 + 120 + entries.length * 52 + 100;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = Math.max(800, estimatedH);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = LIGHT;
  ctx.fillRect(0, 0, W, canvas.height);

  let y = 0;

  // ── HEADER ───────────────────────────────────────────────────────
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, W, 72);

  ctx.fillStyle = WHITE;
  ctx.font = 'bold 18px Poppins, Arial, sans-serif';
  ctx.fillText('PoopSense AI', PAD, 28);
  ctx.font = '10px Poppins, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(`${days}-Day Progress Report  ·  by Doglicious.in`, PAD, 44);

  const now = new Date();
  ctx.font = '9px Poppins, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(`Generated: ${fmtDateShortLocal(now.toISOString().slice(0,10))}`, PAD, 60);

  ctx.textAlign = 'right';
  ctx.font = '9px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText(`${entries.length} scan${entries.length !== 1 ? 's' : ''}`, W - PAD, 44);
  ctx.textAlign = 'left';

  y = 88;

  // ── DOG INFO ─────────────────────────────────────────────────────
  if (dog) {
    roundRect(ctx, PAD, y, INNER, 44, 8, WHITE, 'rgba(58,39,0,0.1)');
    ctx.font = 'bold 13px Poppins, Arial, sans-serif';
    ctx.fillStyle = BRAND;
    ctx.fillText(`${dog.av || '🐕'}  ${dog.name}`, PAD + 12, y + 17);
    ctx.font = '10px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText(`${dog.breed || ''}  ·  ${dog.age || '?'}yr  ·  ${dog.wt || '?'}kg`, PAD + 12, y + 33);
    y += 56;
  }

  // ── SUMMARY STATS ────────────────────────────────────────────────
  if (entries.length === 0) {
    roundRect(ctx, PAD, y, INNER, 60, 8, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 13px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.textAlign = 'center';
    ctx.fillText(`No scans in the last ${days} days`, W / 2, y + 36);
    ctx.textAlign = 'left';
    y += 72;
  } else {
    const avg = Math.round(entries.reduce((s, e) => s + (e.score || 0), 0) / entries.length);
    const good = entries.filter(e => e.score >= 75).length;
    const warn = entries.filter(e => e.score >= 50 && e.score < 75).length;
    const urg  = entries.filter(e => e.score < 50).length;

    const cells = [
      { label: 'Total Scans', value: String(entries.length), color: BRAND },
      { label: 'Avg Score',   value: String(avg),            color: avg >= 75 ? GREEN : avg >= 50 ? AMBER : RED },
      { label: 'Healthy',     value: String(good),           color: GREEN },
      { label: 'Monitor',     value: String(warn),           color: AMBER },
      { label: 'Urgent',      value: String(urg),            color: RED },
    ];
    const cw = (INNER - 16) / cells.length;
    cells.forEach(({ label, value, color }, i) => {
      const cx = PAD + i * (cw + 4);
      roundRect(ctx, cx, y, cw, 52, 7, WHITE, 'rgba(58,39,0,0.08)');
      ctx.font = 'bold 18px Poppins, Arial, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(value, cx + cw / 2, y + 28);
      ctx.font = '8px Poppins, Arial, sans-serif';
      ctx.fillStyle = GREY;
      ctx.fillText(label, cx + cw / 2, y + 42);
      ctx.textAlign = 'left';
    });
    y += 64;

    // ── SCORE BAR CHART ─────────────────────────────────────────────
    roundRect(ctx, PAD, y, INNER, 90, 8, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 9px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('SCORE TREND', PAD + 10, y + 14);

    const chartEntries = [...entries].reverse().slice(-60); // max 60 bars
    const barW = Math.max(3, (INNER - 20) / chartEntries.length - 1);
    const chartH = 60;
    const chartY = y + 22;

    chartEntries.forEach((e, i) => {
      const h = Math.max(3, ((e.score || 0) / 100) * chartH);
      const bx = PAD + 10 + i * ((INNER - 20) / chartEntries.length);
      const by = chartY + chartH - h;
      ctx.fillStyle = e.risk === 'g' ? GREEN : e.risk === 'w' ? AMBER : RED;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, barW, h, [2, 2, 0, 0]);
      else ctx.rect(bx, by, barW, h);
      ctx.fill();
    });

    // Baseline
    ctx.fillStyle = 'rgba(58,39,0,0.12)';
    ctx.fillRect(PAD + 10, chartY + chartH, INNER - 20, 1);

    y += 102;
  }

  // ── SCAN LIST ────────────────────────────────────────────────────
  if (entries.length > 0) {
    ctx.font = 'bold 9px Poppins, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('SCAN HISTORY', PAD, y + 10);
    y += 18;

    for (const entry of entries) {
      const rk = entry.risk || 'w';
      const rowH = 46;

      roundRect(ctx, PAD, y, INNER, rowH, 7, WHITE, 'rgba(58,39,0,0.07)');

      // Score circle
      ctx.beginPath();
      ctx.arc(PAD + 22, y + rowH / 2, 16, 0, Math.PI * 2);
      ctx.fillStyle = RISK_COLOR[rk];
      ctx.fill();
      ctx.font = 'bold 11px Poppins, Arial, sans-serif';
      ctx.fillStyle = WHITE;
      ctx.textAlign = 'center';
      ctx.fillText(String(entry.score ?? 0), PAD + 22, y + rowH / 2 + 4);
      ctx.textAlign = 'left';

      // Type + date
      ctx.font = 'bold 10px Poppins, Arial, sans-serif';
      ctx.fillStyle = BRAND;
      ctx.fillText(entry.stoolType || 'Unknown', PAD + 46, y + 16);

      ctx.font = '8.5px Poppins, Arial, sans-serif';
      ctx.fillStyle = GREY;
      ctx.fillText(`${fmtDateShortLocal(entry.date)}  ·  ${entry.time || ''}  ·  Bristol ${entry.bristolScore || '?'}/7`, PAD + 46, y + 28);

      // Risk label right-aligned
      ctx.font = 'bold 8px Poppins, Arial, sans-serif';
      ctx.fillStyle = RISK_COLOR[rk];
      ctx.textAlign = 'right';
      ctx.fillText(RISK_LABEL[rk], W - PAD - 6, y + 20);
      ctx.textAlign = 'left';

      // Summary snippet
      if (entry.sum) {
        ctx.font = '8px Poppins, Arial, sans-serif';
        ctx.fillStyle = '#8B6B3D';
        const snippet = entry.sum.length > 90 ? entry.sum.slice(0, 90) + '…' : entry.sum;
        ctx.fillText(snippet, PAD + 46, y + 40);
      }

      y += rowH + 5;
    }
  }

  // ── FOOTER ───────────────────────────────────────────────────────
  y += 10;
  ctx.fillStyle = 'rgba(58,39,0,0.12)';
  ctx.fillRect(PAD, y, INNER, 1);
  y += 10;
  ctx.font = '8px Poppins, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText('PoopSense AI by Doglicious.in  ·  AI analysis only — not a substitute for veterinary diagnosis', PAD, y + 8);
  y += 24;

  // Trim
  const final = document.createElement('canvas');
  final.width = W;
  final.height = y;
  final.getContext('2d').drawImage(canvas, 0, 0);
  return final;
}

export async function downloadProgressPDF(history, dog, days) {
  const canvas = await buildProgressPDF(history, dog, days);
  const dogName = dog?.name || 'Dog';
  const filename = `PoopSense_Progress_${dogName}_${days}days.pdf`;
  const imgData = canvas.toDataURL('image/png', 1.0);

  const win = window.open('', '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = imgData;
    a.download = filename.replace('.pdf', '.png');
    a.click();
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#fff; }
    img { display:block; width:100%; max-width:595px; margin:0 auto; }
    @media print {
      img { width:100%; max-width:100%; }
      @page { margin:0; size:A4; }
    }
  </style>
</head>
<body>
  <img src="${imgData}" />
  <script>window.onload=function(){setTimeout(function(){window.print();},400);};</script>
</body>
</html>`);
  win.document.close();
}
