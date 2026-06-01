// src/utils/generateReportPDF.js
// Generates the VetRx Scan report entirely client-side using the Canvas API.
// No Puppeteer / Chromium required — same approach as PoopSense's psPdf.js.
// Page breaks: the single tall canvas is sliced into A4 pages; each slice is
// drawn so that no content block is ever cut mid-render (blocks are kept whole
// by measuring before drawing, then advancing to the next page if needed).

const SCALE = 4;          // render at 4× for crisp output
const W     = 595;        // A4 width in pt (72 dpi logical)
const A4_H  = 842;        // A4 height in pt
const PAD   = 28;         // horizontal padding
const INNER = W - PAD * 2;

// ── Palette ───────────────────────────────────────────────────────────
const C = {
  brand:       '#3D2B00',
  gold:        '#C4A87A',
  light:       '#FBF6EC',
  gray:        '#9B7E4A',
  green:       '#2D6A2D',
  amber:       '#D97706',
  red:         '#B33A3A',
  bgAmber:     '#FFF8ED',
  bgRed:       '#FFF0F0',
  bgGreen:     '#F0F7F0',
  bgLight:     '#FBF6EC',
  borderAmber: '#E8C97A',
  borderRed:   '#E8A8A8',
  borderGreen: '#C8DFC8',
  borderLight: '#D4B896',
  border:      '#EDE8DC',
  white:       '#FFFFFF',
};

const SEV_COLOR = { mild: C.green, low: C.green, moderate: C.amber, high: C.red, severe: C.red, critical: C.red };
const URG_COLOR = { routine: C.green, urgent: C.amber, emergency: C.red };

function scoreColor(s) {
  const n = Number(s) || 0;
  return n < 50 ? C.red : n < 70 ? C.amber : C.green;
}

// ── Canvas helpers ────────────────────────────────────────────────────

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
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

/** Wrap text, return new y after last line. */
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

/** Count lines text will occupy. */
function measureLines(ctx, text, maxWidth) {
  if (!text) return 0;
  const words = String(text).split(' ');
  let line = '', lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines++; line = word; }
    else line = test;
  }
  if (line) lines++;
  return lines;
}

// ── Page-break-aware drawing context ─────────────────────────────────
// We draw onto one tall canvas. Before drawing each block we check if it
// fits on the current page; if not we advance y to the next page boundary.

const HEADER_H  = 80;   // height of the top banner (only on page 1)
const FOOTER_H  = 28;   // reserved at the bottom of every page for footer text
const PAGE_TOP  = 12;   // top margin on pages 2+
const USABLE_H  = A4_H - FOOTER_H - PAGE_TOP; // usable height per page after page 1

/**
 * Advance y to the next page if the block of `blockH` won't fit.
 * Returns the (possibly advanced) y value.
 */
function ensureFits(y, blockH) {
  // Which page are we on? Page 1 starts at 0, page 2 at A4_H, etc.
  const pageIndex = Math.floor(y / A4_H);
  const pageStart = pageIndex * A4_H;
  const pageEnd   = pageStart + A4_H - FOOTER_H;

  if (y + blockH > pageEnd) {
    // Move to next page
    return (pageIndex + 1) * A4_H + PAGE_TOP;
  }
  return y;
}

/** Draw the footer line on every page of the canvas. */
function drawFooters(ctx, totalH, dateStr) {
  const pages = Math.ceil(totalH / A4_H);
  for (let p = 0; p < pages; p++) {
    const isLastPage = p === pages - 1;
    // For last page, place footer at actual content bottom; for others, at A4 page boundary
    const fy = isLastPage 
      ? totalH - FOOTER_H + 10
      : p * A4_H + A4_H - FOOTER_H + 10;
    
    ctx.fillStyle = 'rgba(61,43,0,0.12)';
    ctx.fillRect(PAD, fy - 4, INNER, 1);
    ctx.font = '7.5px Arial, sans-serif';
    ctx.fillStyle = C.gray;
    ctx.textAlign = 'left';
    ctx.fillText('VetRx Scan is an AI assistance tool. Consult a licensed veterinarian for medical decisions.', PAD, fy + 8);
    ctx.textAlign = 'right';
    ctx.fillText(`Page ${p + 1} of ${pages}  |  doglicious.in`, W - PAD, fy + 8);
    ctx.textAlign = 'left';
  }
}

// ── Height estimation pass ────────────────────────────────────────────

function estimateTotalHeight(r, dog, mCtx) {
  let h = HEADER_H + 10; // header banner

  // Dog meta
  h += 50;

  // Diagnosis card
  if (r.diagnosis) h = ensureFits(h, 80) + 80 + 8;

  // Health score
  h = ensureFits(h, 90) + 90 + 8;

  // AI Findings
  if (r.imageFindings || r.summary) {
    mCtx.font = '12px Arial, sans-serif';
    const l1 = r.imageFindings ? measureLines(mCtx, r.imageFindings, INNER - 20) : 0;
    const l2 = r.summary       ? measureLines(mCtx, r.summary,       INNER - 20) : 0;
    const bh = 30 + (l1 + l2) * 16 + 10;
    h = ensureFits(h, bh) + bh + 8;
  }

  // Treatment steps
  const steps = Array.isArray(r.steps) ? r.steps.filter(Boolean) : [];
  if (steps.length) {
    mCtx.font = '12px Arial, sans-serif';
    let sh = 28;
    steps.forEach(s => { sh += Math.max(1, measureLines(mCtx, s, INNER - 50)) * 16 + 8; });
    h = ensureFits(h, sh) + sh + 8;
  }

  // Natural remedies
  const natural = Array.isArray(r.natural) ? r.natural.filter(Boolean) : [];
  if (natural.length) {
    mCtx.font = '12px Arial, sans-serif';
    let nh = 28;
    natural.forEach(n => { nh += Math.max(1, measureLines(mCtx, n, INNER - 20)) * 16 + 6; });
    h = ensureFits(h, nh) + nh + 8;
  }

  // Diet
  const dietText = r.diet || r.dietAdvice || '';
  if (dietText) {
    mCtx.font = '12px Arial, sans-serif';
    const dl = measureLines(mCtx, dietText, INNER - 20);
    const dh = 28 + dl * 16 + (r.currentDietAssessment ? 20 : 0) + 10;
    h = ensureFits(h, dh) + dh + 8;
  }

  // Red flags
  const redFlags = Array.isArray(r.redFlags) ? r.redFlags.filter(Boolean) : [];
  if (redFlags.length) {
    mCtx.font = '12px Arial, sans-serif';
    let rh = 28;
    redFlags.forEach(f => { rh += Math.max(1, measureLines(mCtx, f, INNER - 20)) * 16 + 6; });
    h = ensureFits(h, rh) + rh + 8;
  }

  // Dog profile grid
  h = ensureFits(h, 120) + 120 + 20;

  return h + 40;
}

// ── Section header ────────────────────────────────────────────────────

function drawSectionHead(ctx, label, y) {
  ctx.font = 'bold 8.5px Arial, sans-serif';
  ctx.fillStyle = C.gray;
  ctx.fillText(label.toUpperCase(), PAD, y + 10);
  ctx.fillStyle = C.gold;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(PAD, y + 14, INNER, 1);
  ctx.globalAlpha = 1;
  return y + 20;
}

// ── Main draw function ────────────────────────────────────────────────

async function buildVetRxCanvas(r, dog, ownerName, scanDate) {
  const dateStr = scanDate
    ? new Date(scanDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const sc      = scoreColor(r.healthScore);
  const sevKey  = (r.severity || '').toLowerCase();
  const urgKey  = (r.urgency  || '').toLowerCase();
  const sevFill = SEV_COLOR[sevKey] || C.amber;
  const urgFill = URG_COLOR[urgKey] || C.green;

  const dogAge  = [dog.ageYears && `${dog.ageYears}yr`, dog.ageMonths && `${dog.ageMonths}mo`].filter(Boolean).join(' ');
  const dogMeta = [dog.breed, dogAge, dog.weight && `${dog.weight}kg`].filter(Boolean).join('  |  ');

  const steps    = Array.isArray(r.steps)    ? r.steps.filter(Boolean)    : [];
  const natural  = Array.isArray(r.natural)  ? r.natural.filter(Boolean)  : [];
  const redFlags = Array.isArray(r.redFlags) ? r.redFlags.filter(Boolean) : [];
  const dietText = r.diet || r.dietAdvice || '';

  const profileRows = [
    ['Name',          dog.name],
    ['Breed',         dog.breed],
    ['Age',           dogAge],
    ['Weight',        dog.weight && `${dog.weight}kg`],
    ['Food Type',     dog.foodType],
    ['Food Amount',   dog.foodGrams && `${dog.foodGrams}g`],
    ['Feeding Times', dog.foodTimes],
    ['Area Examined', dog.selectedPart || r.bodyPart],
    ['Symptoms',      Array.isArray(r.symptoms) ? r.symptoms.join(', ') : (typeof r.symptoms === 'string' ? r.symptoms : null)],
    ['Notes',         dog.notes],
  ].filter(([, v]) => v);

  // Measure pass
  const measure = document.createElement('canvas');
  measure.width = W; measure.height = 10;
  const mCtx = measure.getContext('2d');
  // Add a full A4 page buffer to prevent clipping if the estimate is too low
  const totalH = Math.max(A4_H, estimateTotalHeight(r, dog, mCtx)) + A4_H;

  // Draw pass
  const canvas = document.createElement('canvas');
  canvas.width  = W * SCALE;
  canvas.height = totalH * SCALE;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.scale(SCALE, SCALE);

  // Enable high-quality text rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.textRendering = 'optimizeLegibility';

  // Fill background for all pages
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, W, totalH);

  let y = 0;

  // ── HEADER BANNER ────────────────────────────────────────────────
  ctx.fillStyle = C.brand;
  ctx.fillRect(0, 0, W, HEADER_H);

  ctx.fillStyle = C.light;
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('VetRx Scan', PAD, 30);
  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = C.gold;
  ctx.fillText('AI Dog Health Diagnosis Report', PAD, 46);
  ctx.fillText(dateStr, PAD, 62);

  // Score in header
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.fillStyle = sc;
  ctx.textAlign = 'right';
  ctx.fillText(String(r.healthScore ?? '--'), W - PAD, 58);
  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = C.gold;
  ctx.fillText('/100', W - PAD, 72);
  ctx.textAlign = 'left';

  y = HEADER_H + 14;

  // ── DOG META ─────────────────────────────────────────────────────
  ctx.font = 'bold 17px Arial, sans-serif';
  ctx.fillStyle = C.brand;
  ctx.fillText(dog.name || 'Dog', PAD, y + 14);
  if (ownerName) {
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = C.gray;
    ctx.textAlign = 'right';
    ctx.fillText(`Owner: ${ownerName}`, W - PAD, y + 14);
    ctx.textAlign = 'left';
  }
  if (dogMeta) {
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = C.gray;
    ctx.fillText(dogMeta, PAD, y + 28);
  }
  y += 44;


  // ── DIAGNOSIS CARD ───────────────────────────────────────────────
  if (r.diagnosis) {
    const blockH = 80;
    y = ensureFits(y, blockH);
    roundRect(ctx, PAD, y, INNER, blockH, 10, C.bgLight, C.borderLight);
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillStyle = C.brand;
    ctx.fillText(String(r.diagnosis).slice(0, 80), PAD + 14, y + 22);

    let px = PAD + 14;
    const pillY = y + 38;
    
    // Set font early to measure text width
    ctx.font = 'bold 9px Arial, sans-serif';

    if (r.severity) {
      // Clean AI verbosity: "CRITICAL - POTENTIALLY FATAL" -> "CRITICAL"
      let sevText = r.severity.split(/[-:(]/)[0].trim().toUpperCase();
      if (sevText.length > 25) sevText = sevText.substring(0, 22) + '...';
      const sevW = ctx.measureText(sevText).width + 20;
      
      roundRect(ctx, px, pillY, sevW, 22, 5, sevFill);
      ctx.fillStyle = C.white;
      ctx.textAlign = 'center';
      ctx.fillText(sevText, px + (sevW / 2), pillY + 14);
      ctx.textAlign = 'left';
      px += sevW + 8;
    }
    if (r.urgency) {
      // Clean AI verbosity: "EMERGENCY - REQUIRES IMMEDIATE..." -> "EMERGENCY"
      let urgText = r.urgency.split(/[-:(]/)[0].trim().toUpperCase();
      if (urgText.length > 25) urgText = urgText.substring(0, 22) + '...';
      const urgW = ctx.measureText(urgText).width + 20;
      
      roundRect(ctx, px, pillY, urgW, 22, 5, urgFill);
      ctx.fillStyle = C.white;
      ctx.textAlign = 'center';
      ctx.fillText(urgText, px + (urgW / 2), pillY + 14);
      ctx.textAlign = 'left';
      px += urgW + 8;
    }
    if (r.confidence != null) {
      ctx.font = '10px Arial, sans-serif';
      ctx.fillStyle = C.gray;
      // Right-align the confidence score to the far right edge of the card
      ctx.textAlign = 'right';
      ctx.fillText(`${r.confidence}% ${r.confidenceLabel || ''} Confidence`, PAD + INNER - 14, pillY + 14);
      ctx.textAlign = 'left'; // Reset alignment for the rest of the document
    }
    y += blockH + 10;
  }

  // ── HEALTH SCORE ─────────────────────────────────────────────────
  {
    const blockH = 88;
    y = ensureFits(y, blockH);
    y = drawSectionHead(ctx, 'Health Score', y);

    const drawBar = (label, value, color, barY) => {
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = C.brand;
      ctx.fillText(label, PAD, barY + 10);
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'right';
      ctx.fillText(`${value}/100`, W - PAD, barY + 10);
      ctx.textAlign = 'left';
      roundRect(ctx, PAD, barY + 14, INNER, 7, 4, C.border);
      roundRect(ctx, PAD, barY + 14, Math.max(4, INNER * Math.min(value, 100) / 100), 7, 4, color);
    };

    drawBar('Current Health', r.healthScore ?? 0, sc, y);
    y += 28;
    drawBar(`After ${r.daysToImprove || 10}-day treatment`, r.healthTarget ?? 85, C.green, y);
    y += 28 + 10;
  }

  // ── AI FINDINGS ──────────────────────────────────────────────────
  if (r.imageFindings || r.summary) {
    ctx.font = '12px Arial, sans-serif';
    const l1 = r.imageFindings ? measureLines(ctx, r.imageFindings, INNER - 20) : 0;
    const l2 = r.summary       ? measureLines(ctx, r.summary,       INNER - 20) : 0;
    const blockH = 30 + (l1 + l2) * 16 + 10;
    y = ensureFits(y, blockH);
    y = drawSectionHead(ctx, 'AI Findings', y);
    if (r.imageFindings) {
      ctx.font = 'italic 12px Arial, sans-serif';
      ctx.fillStyle = C.gray;
      y = wrapText(ctx, r.imageFindings, PAD, y + 4, INNER, 16);
      y += 4;
    }
    if (r.summary) {
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = C.brand;
      y = wrapText(ctx, r.summary, PAD, y + 4, INNER, 16);
    }
    y += 10;
  }

  // ── TREATMENT STEPS ──────────────────────────────────────────────
  if (steps.length) {
    ctx.font = '12px Arial, sans-serif';
    let sh = 28;
    const stepData = steps.map(s => {
      const lines = Math.max(1, measureLines(ctx, s, INNER - 50));
      const h = lines * 16 + 8;
      sh += h;
      return { s, lines, h };
    });
    y = ensureFits(y, sh);
    y = drawSectionHead(ctx, 'Treatment Steps', y);

    stepData.forEach(({ s, lines }, i) => {
      // Check if this individual step fits on the current page
      const stepH = lines * 16 + 8;
      y = ensureFits(y, stepH + 4);

      // Number circle
      ctx.beginPath();
      ctx.arc(PAD + 11, y + 11, 11, 0, Math.PI * 2);
      ctx.fillStyle = C.brand;
      ctx.fill();
      ctx.font = 'bold 9px Arial, sans-serif';
      ctx.fillStyle = C.white;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), PAD + 11, y + 15);
      ctx.textAlign = 'left';

      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#2A1E00';
      wrapText(ctx, s, PAD + 28, y + 14, INNER - 36, 16);
      y += stepH + 4;
    });
    y += 6;
  }

  // ── NATURAL REMEDIES ─────────────────────────────────────────────
  if (natural.length) {
    ctx.font = '12px Arial, sans-serif';
    let nh = 28;
    const natData = natural.map(n => {
      const lines = Math.max(1, measureLines(ctx, n, INNER - 30));
      const h = lines * 16 + 6;
      nh += h;
      return { n, h };
    });
    y = ensureFits(y, nh);
    roundRect(ctx, PAD, y, INNER, nh, 10, C.bgGreen, C.borderGreen);
    ctx.font = 'bold 8.5px Arial, sans-serif';
    ctx.fillStyle = C.green;
    ctx.fillText('NATURAL REMEDIES', PAD + 12, y + 14);
    let ny = y + 24;
    natData.forEach(({ n, h }) => {
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#1A4A1A';
      ny = wrapText(ctx, `• ${n}`, PAD + 12, ny + 4, INNER - 24, 16);
    });
    y += nh + 10;
  }

  // ── DIET RECOMMENDATION ──────────────────────────────────────────
  if (dietText) {
    ctx.font = '12px Arial, sans-serif';
    const dl = measureLines(ctx, dietText, INNER - 24);
    const dh = 28 + dl * 16 + (r.currentDietAssessment ? 22 : 0) + 10;
    y = ensureFits(y, dh);
    roundRect(ctx, PAD, y, INNER, dh, 10, C.bgAmber, C.borderAmber);
    ctx.font = 'bold 8.5px Arial, sans-serif';
    ctx.fillStyle = '#7A4A00';
    ctx.fillText('DIET RECOMMENDATION', PAD + 12, y + 14);
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#5C3800';
    let dy = wrapText(ctx, dietText, PAD + 12, y + 28, INNER - 24, 16);
    if (r.currentDietAssessment) {
      ctx.font = 'italic 11px Arial, sans-serif';
      ctx.fillStyle = C.gray;
      ctx.fillText(`Current: ${r.currentDietAssessment}`, PAD + 12, dy + 6);
    }
    y += dh + 10;
  }

  // ── RED FLAGS ────────────────────────────────────────────────────
  if (redFlags.length) {
    ctx.font = '12px Arial, sans-serif';
    let rh = 28;
    const rfData = redFlags.map(f => {
      const lines = Math.max(1, measureLines(ctx, f, INNER - 30));
      const h = lines * 16 + 6;
      rh += h;
      return { f, h };
    });
    y = ensureFits(y, rh);
    roundRect(ctx, PAD, y, INNER, rh, 10, C.bgRed, C.borderRed);
    ctx.font = 'bold 8.5px Arial, sans-serif';
    ctx.fillStyle = C.red;
    ctx.fillText('SEE VET IF YOU NOTICE', PAD + 12, y + 14);
    let ry2 = y + 24;
    rfData.forEach(({ f, h }) => {
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#7A1A1A';
      ry2 = wrapText(ctx, `[!]  ${f}`, PAD + 12, ry2 + 4, INNER - 24, 16);
    });
    y += rh + 10;
  }

  // ── DOG PROFILE ──────────────────────────────────────────────────
  if (profileRows.length) {
    const colW = (INNER - 16) / 2;
    const rowCount = Math.ceil(profileRows.length / 2);
    const profileH = 28 + rowCount * 32 + 10;
    y = ensureFits(y, profileH);
    y = drawSectionHead(ctx, 'Dog Profile', y);

    profileRows.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = PAD + col * (colW + 16);
      const cy = y + row * 32;
      ctx.font = 'bold 8px Arial, sans-serif';
      ctx.fillStyle = C.gray;
      ctx.fillText(label.toUpperCase(), cx, cy + 10);
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = C.brand;
      ctx.fillText(String(value).slice(0, 40), cx, cy + 24);
    });
    y += rowCount * 32 + 16;
  }

  // Pad the final height to a full A4 page multiple so all pages are uniform
  const actualH = y + 20;
  const pages   = Math.ceil(actualH / A4_H);
  const fullH   = pages * A4_H;

  // ── FOOTERS on every page (based on actual content) ──────────────
  drawFooters(ctx, fullH, dateStr);

  // Copy to final canvas (now sized to full A4 pages)
  const final = document.createElement('canvas');
  final.width  = W * SCALE;
  final.height = fullH * SCALE;
  const fCtx = final.getContext('2d', { alpha: false });
  
  // Explicitly fill white to prevent any black backgrounds
  fCtx.fillStyle = C.white;
  fCtx.fillRect(0, 0, final.width, final.height);
  
  const copyH = Math.min(totalH, fullH);
  fCtx.drawImage(canvas, 0, 0, W * SCALE, copyH * SCALE, 0, 0, W * SCALE, copyH * SCALE);
  
  final._logicalWidth  = W;
  final._logicalHeight = fullH;
  final._pages         = pages;
  return final;
}

// ── Public API ────────────────────────────────────────────────────────

export async function generateReportPDF(report, dogProfile, ownerName, scanDate) {
  const r   = report     || {};
  const dog = dogProfile || {};

  const canvas = await buildVetRxCanvas(r, dog, ownerName || '', scanDate || null);

  const dogName  = (dog.name || 'dog').replace(/\s+/g, '-');
  const dateSlug = new Date().toISOString().slice(0, 10);
  const filename = `VetRx-${dogName}-${dateSlug}.pdf`;

  const imgData  = canvas.toDataURL('image/png');
  const pages    = canvas._pages || 1;
  const contentH = canvas._logicalHeight || canvas.height / SCALE;

  // Build one <img> per A4 page so the browser's print dialog paginates correctly
  const pageImgs = [];
  const pageHeights = [];
  for (let p = 0; p < pages; p++) {
    // All pages are now exactly standard A4 height
    const pageH = A4_H;
    
    const slice = document.createElement('canvas');
    slice.width  = W * SCALE;
    slice.height = pageH * SCALE;
    const sCtx = slice.getContext('2d', { alpha: false });
    
    // Explicitly fill white to prevent black artifacts during slice creation
    sCtx.fillStyle = '#FFFFFF';
    sCtx.fillRect(0, 0, slice.width, slice.height);
    
    sCtx.imageSmoothingEnabled = false; // preserve sharpness when slicing
    sCtx.drawImage(canvas, 0, p * A4_H * SCALE, W * SCALE, pageH * SCALE, 0, 0, W * SCALE, pageH * SCALE);
    pageImgs.push(slice.toDataURL('image/png'));
    pageHeights.push(pageH);
  }

  const win = window.open('', '_blank');
  if (!win) {
    // Fallback: download as PNG if popup blocked
    const a = document.createElement('a');
    a.href = imgData;
    a.download = filename.replace('.pdf', '.png');
    a.click();
    return;
  }


  // Removed hardcoded width/height attributes to prevent print engine scaling conflicts
  const imgTags = pageImgs.map((src, i) =>
    `<div class="page${i === pageImgs.length - 1 ? ' last' : ''}">
       <img src="${src}" />
     </div>`
  ).join('');

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { background:#fff; margin:0; padding:0; }

    .page {
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      display: block;
      overflow: hidden;
      background: #fff;
      page-break-after: always;
    }
    .page.last { page-break-after: auto; }
    
    .page img {
      display: block;
      width: 100%;
      height: 100%;
      /* The magic property: ensures aspect ratio fits inside boundaries without spilling */
      object-fit: cover;
      object-position: top center; 
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }

    @media print {
      @page { margin:0; size:A4 portrait; }
      html, body { margin:0; padding:0; }
      .page {
        width: 100%;
        /* Hard boundary exactly 1mm under A4 height to consume the 0.19mm spillover */
        height: 296mm; 
        margin: 0;
        page-break-inside: avoid;
        page-break-after: always;
      }
      .page.last { page-break-after: auto; }
    }
  </style>
</head>
<body>
  ${imgTags}
  <script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script>
</body>
</html>`);
  win.document.close();
}
