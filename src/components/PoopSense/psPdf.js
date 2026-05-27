// PoopSense AI — PDF generator using Canvas API (no external deps)
// Renders at 3x resolution for crisp, non-blurry output.

const SCALE = 3; // render at 3x, display at 1x → sharp on all screens

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

// ── Helpers ───────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (w <= 0 || h <= 0) return;
  r = Math.min(r, w / 2, h / 2);
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
  if (fill)   { ctx.fillStyle = fill;     ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

// Wrap text and return new y position
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

// Measure how many lines text will take
function measureLines(ctx, text, maxWidth) {
  if (!text) return 0;
  const words = String(text).split(' ');
  let line = '', lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines++;
  return lines;
}

// ── Main PDF builder ──────────────────────────────────────────────────

export async function buildPoopSensePDF(entry, dog) {
  const W   = 595;
  const PAD = 28;
  const INNER = W - PAD * 2;
  const rk = entry.risk || 'w';

  // ── Pre-load image so we know its dimensions ──────────────────────
  let loadedImg = null;
  if (entry.imgB64) {
    await new Promise(resolve => {
      const img = new Image();
      img.onload = () => { loadedImg = img; resolve(); };
      img.onerror = resolve;
      img.src = `data:image/jpeg;base64,${entry.imgB64}`;
    });
  }

  // ── Measure pass — calculate total height needed ──────────────────
  // Use an offscreen canvas just for measurement
  const measure = document.createElement('canvas');
  measure.width = W; measure.height = 10;
  const mCtx = measure.getContext('2d');

  function calcHeight() {
    let h = 88; // header

    // Dog info
    if (dog) h += 56;

    // Score band
    h += 76;

    // Characteristics grid — 2 rows of cells, each cell needs to fit text
    // Calculate max cell height needed
    const cw = (INNER - 8) / 2;
    const cellValues = [
      entry.color || 'N/A',
      entry.consistency || 'N/A',
      `Type ${entry.bristolScore || '?'}/7`,
      entry.stoolType || 'N/A',
    ];
    let maxCellH = 42;
    mCtx.font = 'bold 10px Arial, sans-serif';
    cellValues.forEach(v => {
      const lines = measureLines(mCtx, v, cw - 20);
      const needed = 18 + lines * 13 + 6;
      if (needed > maxCellH) maxCellH = needed;
    });
    h += 2 * (maxCellH + 6) + 12;

    // Score params
    if (entry.params) h += 122;

    // Clinical summary
    if (entry.sum) {
      mCtx.font = '10px Arial, sans-serif';
      const lines = measureLines(mCtx, entry.sum, INNER - 20);
      h += Math.max(50, lines * 14 + 30) + 10;
    }

    // Simple terms
    if (entry.simpleEn) {
      mCtx.font = '10px Arial, sans-serif';
      const lines = measureLines(mCtx, entry.simpleEn, INNER - 20);
      h += Math.max(54, lines * 14 + 34) + 10;
    }

    // Recommendations
    if (entry.recommendations?.length) {
      mCtx.font = '9px Arial, sans-serif';
      let recH = 28;
      entry.recommendations.forEach(rec => {
        const lines = Math.max(1, measureLines(mCtx, rec, INNER - 50));
        recH += lines * 14 + 6;
      });
      h += recH + 10;
    }

    // Possible conditions
    if (entry.possibleConditions?.length) {
      mCtx.font = '10px Arial, sans-serif';
      let condH = 28;
      entry.possibleConditions.forEach(c => {
        const lines = Math.max(1, measureLines(mCtx, c, INNER - 40));
        condH += lines * 14 + 6;
      });
      h += condH + 10;
    }

    // Image
    if (loadedImg) {
      const imgH = 160;
      h += imgH + 40;
    }

    // Footer
    h += 40;

    return h + 40; // extra padding
  }

  const totalH = calcHeight();

  // ── Draw pass ─────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width  = W * SCALE;
  canvas.height = totalH * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE); // all drawing coords stay in logical pixels

  ctx.fillStyle = LIGHT;
  ctx.fillRect(0, 0, W, totalH);

  let y = 0;

  // ── HEADER ───────────────────────────────────────────────────────
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, W, 72);

  ctx.fillStyle = WHITE;
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('PoopSense AI', PAD, 28);

  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText('by Doglicious.in  ·  AI Stool Health Analysis', PAD, 44);
  ctx.fillText(`${entry.date}  ·  ${entry.time}`, PAD, 60);

  ctx.font = '9px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textAlign = 'right';
  ctx.fillText(`#${entry.id}`, W - PAD, 28);
  ctx.textAlign = 'left';

  y = 88;

  // ── DOG INFO ─────────────────────────────────────────────────────
  if (dog) {
    roundRect(ctx, PAD, y, INNER, 44, 8, WHITE, 'rgba(58,39,0,0.1)');
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = BRAND;
    ctx.fillText(`${dog.name}`, PAD + 12, y + 17);
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText(`${dog.breed || ''}  ·  ${dog.age || '?'}yr  ·  ${dog.wt || '?'}kg  ·  ${dog.diet || ''}`, PAD + 12, y + 33);
    y += 56;
  }

  // ── SCORE BAND ───────────────────────────────────────────────────
  roundRect(ctx, PAD, y, INNER, 64, 10, RISK_BG[rk], RISK_COLOR[rk] + '44');

  ctx.beginPath();
  ctx.arc(PAD + 40, y + 32, 26, 0, Math.PI * 2);
  ctx.fillStyle = RISK_COLOR[rk];
  ctx.fill();
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.fillText(String(entry.score ?? 0), PAD + 40, y + 38);
  ctx.textAlign = 'left';

  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillStyle = RISK_COLOR[rk];
  ctx.fillText(RISK_LABEL[rk], PAD + 76, y + 24);

  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = BRAND;
  ctx.fillText(entry.stoolType || '', PAD + 76, y + 40);

  ctx.font = '9px Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText(`Bristol Scale: Type ${entry.bristolScore || '?'}/7`, PAD + 76, y + 54);

  y += 76;

  // ── CHARACTERISTICS GRID ─────────────────────────────────────────
  const cw = (INNER - 8) / 2;
  const cells = [
    { l: 'COLOUR',      v: entry.color       || 'N/A' },
    { l: 'CONSISTENCY', v: entry.consistency || 'N/A' },
    { l: 'BRISTOL',     v: `Type ${entry.bristolScore || '?'}/7` },
    { l: 'TYPE',        v: entry.stoolType   || 'N/A' },
  ];

  // Calculate cell height based on longest text
  ctx.font = 'bold 10px Arial, sans-serif';
  let maxCellH = 42;
  cells.forEach(({ v }) => {
    const lines = measureLines(ctx, v, cw - 20);
    const needed = 18 + lines * 13 + 8;
    if (needed > maxCellH) maxCellH = needed;
  });

  cells.forEach(({ l, v }, i) => {
    const cx = PAD + (i % 2) * (cw + 8);
    const cy = y + Math.floor(i / 2) * (maxCellH + 6);
    roundRect(ctx, cx, cy, cw, maxCellH, 7, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = '8px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText(l, cx + 10, cy + 13);
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.fillStyle = BRAND;
    wrapText(ctx, v, cx + 10, cy + 27, cw - 20, 13);
  });
  y += 2 * (maxCellH + 6) + 12;

  // ── SCORE PARAMS ─────────────────────────────────────────────────
  if (entry.params) {
    roundRect(ctx, PAD, y, INNER, 110, 8, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('SCORE BREAKDOWN', PAD + 10, y + 16);

    const params = [
      { k: 'color',       l: 'Colour',       max: 20 },
      { k: 'consistency', l: 'Consistency',  max: 25 },
      { k: 'shape',       l: 'Shape',        max: 15 },
      { k: 'contents',    l: 'Contents',     max: 20 },
      { k: 'riskPattern', l: 'Risk Pattern', max: 20 },
    ];
    const barX = PAD + 90;
    const barW = INNER - 90 - 36;
    params.forEach(({ k, l, max }, i) => {
      const py = y + 28 + i * 16;
      const val = entry.params[k] ?? 0;
      const pct = val / max;
      ctx.font = '9px Arial, sans-serif';
      ctx.fillStyle = BRAND;
      ctx.fillText(l, PAD + 10, py + 8);
      roundRect(ctx, barX, py, barW, 8, 4, '#EAE0D0');
      roundRect(ctx, barX, py, Math.max(4, barW * pct), 8, 4, RISK_COLOR[rk]);
      ctx.font = '8px Arial, sans-serif';
      ctx.fillStyle = GREY;
      ctx.textAlign = 'right';
      ctx.fillText(`${val}/${max}`, PAD + INNER - 4, py + 8);
      ctx.textAlign = 'left';
    });
    y += 122;
  }

  // ── CLINICAL SUMMARY ─────────────────────────────────────────────
  if (entry.sum) {
    ctx.font = '10px Arial, sans-serif';
    const lines = measureLines(ctx, entry.sum, INNER - 20);
    const boxH = Math.max(50, lines * 14 + 30);
    roundRect(ctx, PAD, y, INNER, boxH, 6, '#FFF6E8', AMBER + '44');
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = BRAND;
    ctx.fillText('CLINICAL SUMMARY', PAD + 10, y + 14);
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = '#5C3F18';
    wrapText(ctx, entry.sum, PAD + 10, y + 28, INNER - 20, 14);
    y += boxH + 10;
  }

  // ── SIMPLE TERMS ─────────────────────────────────────────────────
  if (entry.simpleEn) {
    ctx.font = '10px Arial, sans-serif';
    const lines = measureLines(ctx, entry.simpleEn, INNER - 20);
    const boxH = Math.max(54, lines * 14 + 34);
    roundRect(ctx, PAD, y, INNER, boxH, 6, '#E8F4FD', 'rgba(52,152,219,0.3)');
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = '#1A5276';
    ctx.fillText('IN SIMPLE TERMS', PAD + 10, y + 14);
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = '#1A3550';
    wrapText(ctx, entry.simpleEn, PAD + 10, y + 28, INNER - 20, 14);
    y += boxH + 10;
  }

  // ── RECOMMENDATIONS ──────────────────────────────────────────────
  if (entry.recommendations?.length) {
    // Measure total height first
    ctx.font = '9px Arial, sans-serif';
    let recH = 28;
    const recLineData = entry.recommendations.map(rec => {
      const lines = Math.max(1, measureLines(ctx, rec, INNER - 50));
      const h = lines * 14 + 6;
      recH += h;
      return { rec, lines, h };
    });

    roundRect(ctx, PAD, y, INNER, recH, 6, '#EEF6F1', 'rgba(25,92,48,0.2)');
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = GREEN;
    ctx.fillText('AI ACTION PLAN', PAD + 10, y + 14);

    let ry = y + 26;
    recLineData.forEach(({ rec, lines }, i) => {
      // Number circle
      ctx.beginPath();
      ctx.arc(PAD + 18, ry + 7, 7, 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.fill();
      ctx.font = 'bold 8px Arial, sans-serif';
      ctx.fillStyle = WHITE;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), PAD + 18, ry + 10);
      ctx.textAlign = 'left';
      ctx.font = '9px Arial, sans-serif';
      ctx.fillStyle = '#5C3F18';
      wrapText(ctx, rec, PAD + 32, ry + 10, INNER - 50, 14);
      ry += lines * 14 + 6;
    });
    y += recH + 10;
  }

  // ── POSSIBLE CONDITIONS ──────────────────────────────────────────
  if (entry.possibleConditions?.length) {
    ctx.font = '10px Arial, sans-serif';
    let condH = 28;
    const condLineData = entry.possibleConditions.map(c => {
      const lines = Math.max(1, measureLines(ctx, c, INNER - 40));
      const h = lines * 14 + 6;
      condH += h;
      return { c, lines, h };
    });

    roundRect(ctx, PAD, y, INNER, condH, 6, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('POSSIBLE CONDITIONS (NON-DIAGNOSTIC)', PAD + 10, y + 14);

    let cy2 = y + 26;
    condLineData.forEach(({ c, lines }) => {
      // Bullet dot
      ctx.beginPath();
      ctx.arc(PAD + 14, cy2 + 6, 3, 0, Math.PI * 2);
      ctx.fillStyle = AMBER;
      ctx.fill();
      ctx.font = '10px Arial, sans-serif';
      ctx.fillStyle = BRAND;
      wrapText(ctx, c, PAD + 24, cy2 + 10, INNER - 40, 14);
      cy2 += lines * 14 + 6;
    });
    y += condH + 10;
  }

  // ── SCAN IMAGE ───────────────────────────────────────────────────
  if (loadedImg) {
    const imgH = 160;
    const aspect = loadedImg.width / loadedImg.height;
    const imgW = Math.min(INNER - 20, aspect * imgH);
    roundRect(ctx, PAD, y, INNER, imgH + 30, 8, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('SCAN PHOTO', PAD + 10, y + 14);
    ctx.drawImage(loadedImg, PAD + (INNER - imgW) / 2, y + 20, imgW, imgH);
    y += imgH + 42;
  }

  // ── FOOTER ───────────────────────────────────────────────────────
  y += 8;
  ctx.fillStyle = 'rgba(58,39,0,0.12)';
  ctx.fillRect(PAD, y, INNER, 1);
  y += 12;
  ctx.font = '8px Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText('PoopSense AI by Doglicious.in  ·  AI analysis only — not a substitute for veterinary diagnosis', PAD, y + 8);
  ctx.textAlign = 'right';
  ctx.fillText(`Report ID: ${entry.id}`, W - PAD, y + 8);
  ctx.textAlign = 'left';
  y += 24;

  // ── TRIM to actual content ────────────────────────────────────────
  const finalH = Math.min(y + 10, totalH);
  const final = document.createElement('canvas');
  final.width  = W * SCALE;
  final.height = finalH * SCALE;
  final.getContext('2d').drawImage(canvas, 0, 0);
  // Store logical dimensions for print window
  final._logicalWidth  = W;
  final._logicalHeight = finalH;
  return final;
}

export async function downloadPoopSensePDF(entry, dog) {
  const canvas = await buildPoopSensePDF(entry, dog);
  const dogName = dog?.name || 'Dog';
  const filename = `PoopSense_${dogName}_${entry.date}_${entry.id}.pdf`;
  const imgData = canvas.toDataURL('image/png', 1.0);
  const logicalW = canvas._logicalWidth || 595;
  const logicalH = canvas._logicalHeight || canvas.height / SCALE;

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
    img { display:block; width:${logicalW}px; height:${logicalH}px; max-width:100%; margin:0 auto; image-rendering:crisp-edges; }
    @media print {
      body { margin:0; }
      img { width:${logicalW}px; height:${logicalH}px; max-width:100%; }
      @page { margin:0; size:A4; }
    }
  </style>
</head>
<body>
  <img src="${imgData}" width="${logicalW}" height="${logicalH}" />
  <script>window.onload=function(){setTimeout(function(){window.print();},400);};</script>
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

  // Estimate height dynamically
  const rowH = 52;
  const estimatedH = 260 + (entries.length > 0 ? 120 + entries.length * (rowH + 5) : 80) + 60;

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = Math.max(800, estimatedH) * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = LIGHT;
  ctx.fillRect(0, 0, W, Math.max(800, estimatedH));

  let y = 0;

  // ── HEADER ───────────────────────────────────────────────────────
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, W, 72);

  ctx.fillStyle = WHITE;
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('PoopSense AI', PAD, 28);
  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(`${days}-Day Progress Report  ·  by Doglicious.in`, PAD, 44);

  const now = new Date();
  ctx.font = '9px Arial, sans-serif';
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
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = BRAND;
    ctx.fillText(dog.name, PAD + 12, y + 17);
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText(`${dog.breed || ''}  ·  ${dog.age || '?'}yr  ·  ${dog.wt || '?'}kg`, PAD + 12, y + 33);
    y += 56;
  }

  // ── SUMMARY STATS ────────────────────────────────────────────────
  if (entries.length === 0) {
    roundRect(ctx, PAD, y, INNER, 60, 8, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.textAlign = 'center';
    ctx.fillText(`No scans in the last ${days} days`, W / 2, y + 36);
    ctx.textAlign = 'left';
    y += 72;
  } else {
    const avg  = Math.round(entries.reduce((s, e) => s + (e.score || 0), 0) / entries.length);
    const good = entries.filter(e => e.score >= 75).length;
    const warn = entries.filter(e => e.score >= 50 && e.score < 75).length;
    const urg  = entries.filter(e => e.score < 50).length;

    const statCells = [
      { label: 'Total Scans', value: String(entries.length), color: BRAND },
      { label: 'Avg Score',   value: String(avg),            color: avg >= 75 ? GREEN : avg >= 50 ? AMBER : RED },
      { label: 'Healthy',     value: String(good),           color: GREEN },
      { label: 'Monitor',     value: String(warn),           color: AMBER },
      { label: 'Urgent',      value: String(urg),            color: RED },
    ];
    const scw = (INNER - 16) / statCells.length;
    statCells.forEach(({ label, value, color }, i) => {
      const cx = PAD + i * (scw + 4);
      roundRect(ctx, cx, y, scw, 52, 7, WHITE, 'rgba(58,39,0,0.08)');
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(value, cx + scw / 2, y + 28);
      ctx.font = '8px Arial, sans-serif';
      ctx.fillStyle = GREY;
      ctx.fillText(label, cx + scw / 2, y + 42);
      ctx.textAlign = 'left';
    });
    y += 64;

    // ── SCORE BAR CHART ─────────────────────────────────────────────
    roundRect(ctx, PAD, y, INNER, 90, 8, WHITE, 'rgba(58,39,0,0.08)');
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('SCORE TREND', PAD + 10, y + 14);

    const chartEntries = [...entries].reverse().slice(-60);
    const barW = Math.max(3, (INNER - 20) / chartEntries.length - 1);
    const chartH = 60;
    const chartY = y + 22;

    chartEntries.forEach((e, i) => {
      const h = Math.max(3, ((e.score || 0) / 100) * chartH);
      const bx = PAD + 10 + i * ((INNER - 20) / chartEntries.length);
      const by = chartY + chartH - h;
      ctx.fillStyle = e.risk === 'g' ? GREEN : e.risk === 'w' ? AMBER : RED;
      ctx.beginPath();
      ctx.rect(bx, by, barW, h);
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(58,39,0,0.12)';
    ctx.fillRect(PAD + 10, chartY + chartH, INNER - 20, 1);
    y += 102;
  }

  // ── SCAN LIST ────────────────────────────────────────────────────
  if (entries.length > 0) {
    ctx.font = 'bold 9px Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText('SCAN HISTORY', PAD, y + 10);
    y += 18;

    for (const entry of entries) {
      const rk = entry.risk || 'w';

      roundRect(ctx, PAD, y, INNER, rowH, 7, WHITE, 'rgba(58,39,0,0.07)');

      // Score circle
      ctx.beginPath();
      ctx.arc(PAD + 22, y + rowH / 2, 16, 0, Math.PI * 2);
      ctx.fillStyle = RISK_COLOR[rk];
      ctx.fill();
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.fillStyle = WHITE;
      ctx.textAlign = 'center';
      ctx.fillText(String(entry.score ?? 0), PAD + 22, y + rowH / 2 + 4);
      ctx.textAlign = 'left';

      // Type + date
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.fillStyle = BRAND;
      // Truncate stool type if too long
      const typeText = (entry.stoolType || 'Unknown').slice(0, 40);
      ctx.fillText(typeText, PAD + 46, y + 16);

      ctx.font = '8.5px Arial, sans-serif';
      ctx.fillStyle = GREY;
      ctx.fillText(`${fmtDateShortLocal(entry.date)}  ·  ${entry.time || ''}  ·  Bristol ${entry.bristolScore || '?'}/7`, PAD + 46, y + 28);

      // Risk label
      ctx.font = 'bold 8px Arial, sans-serif';
      ctx.fillStyle = RISK_COLOR[rk];
      ctx.textAlign = 'right';
      ctx.fillText(RISK_LABEL[rk], W - PAD - 6, y + 20);
      ctx.textAlign = 'left';

      // Summary snippet — truncated to fit
      if (entry.sum) {
        ctx.font = '8px Arial, sans-serif';
        ctx.fillStyle = '#8B6B3D';
        const snippet = entry.sum.length > 85 ? entry.sum.slice(0, 85) + '…' : entry.sum;
        ctx.fillText(snippet, PAD + 46, y + 42);
      }

      y += rowH + 5;
    }
  }

  // ── FOOTER ───────────────────────────────────────────────────────
  y += 10;
  ctx.fillStyle = 'rgba(58,39,0,0.12)';
  ctx.fillRect(PAD, y, INNER, 1);
  y += 12;
  ctx.font = '8px Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText('PoopSense AI by Doglicious.in  ·  AI analysis only — not a substitute for veterinary diagnosis', PAD, y + 8);
  y += 24;

  // Trim
  const finalH2 = Math.min(y + 10, Math.max(800, estimatedH));
  const final = document.createElement('canvas');
  final.width  = W * SCALE;
  final.height = finalH2 * SCALE;
  final.getContext('2d').drawImage(canvas, 0, 0);
  final._logicalWidth  = W;
  final._logicalHeight = finalH2;
  return final;
}

export async function downloadProgressPDF(history, dog, days) {
  const canvas = await buildProgressPDF(history, dog, days);
  const dogName = dog?.name || 'Dog';
  const filename = `PoopSense_Progress_${dogName}_${days}days.pdf`;
  const imgData = canvas.toDataURL('image/png', 1.0);
  const logicalW = canvas._logicalWidth || 595;
  const logicalH = canvas._logicalHeight || canvas.height / SCALE;

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
    img { display:block; width:${logicalW}px; height:${logicalH}px; max-width:100%; margin:0 auto; image-rendering:crisp-edges; }
    @media print {
      img { width:${logicalW}px; height:${logicalH}px; max-width:100%; }
      @page { margin:0; size:A4; }
    }
  </style>
</head>
<body>
  <img src="${imgData}" width="${logicalW}" height="${logicalH}" />
  <script>window.onload=function(){setTimeout(function(){window.print();},400);};</script>
</body>
</html>`);
  win.document.close();
}
