// server/api/vetrx-report-pdf.js
// Generates a VetRx Scan report PDF server-side using Puppeteer.
// CSS `break-inside: avoid` lets Chrome handle page breaks correctly.

import puppeteer from 'puppeteer';

// ── Palette ──────────────────────────────────────────────────────────
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
};

const SEV_COLOR = {
    mild: C.green, low: C.green,
    moderate: C.amber,
    high: C.red, severe: C.red, critical: C.red,
};
const URG_COLOR = {
    routine:   C.green,
    urgent:    C.amber,
    emergency: C.red,
};

function clean(str) {
    if (str == null) return '';
    return String(str)
        .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
        .replace(/[☀-➿]/g, '')
        .replace(/[︀-️]/g, '')
        .replace(/[^\x00-\xFF]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function e(str) {
    return clean(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function scoreColor(s) {
    const n = Number(s) || 0;
    return n < 50 ? C.red : n < 70 ? C.amber : C.green;
}

// ── HTML helpers ──────────────────────────────────────────────────────

function sectionHead(label) {
    return `
    <div class="section-head">
        <div class="section-label">${label}</div>
        <div class="section-rule"></div>
    </div>`;
}

// Wrapper that prevents page breaks inside
function noBreak(inner, extraStyle = '') {
    return `<div class="no-break" style="${extraStyle}">${inner}</div>`;
}

function colorCard(inner, bg, border) {
    return `<div class="color-card" style="background:${bg};border-color:${border};">${inner}</div>`;
}

// ── Build full HTML document ──────────────────────────────────────────
function buildDocument(r, dog, ownerName, scanDate) {
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

    const body = `
        <!-- DOG META -->
        <div class="dog-meta-row">
            <span class="dog-name">${e(dog.name || 'Dog')}</span>
            ${ownerName ? `<span class="owner-name">Owner: ${e(ownerName)}</span>` : ''}
        </div>
        ${dogMeta ? `<div class="dog-meta-sub">${e(dogMeta)}</div>` : ''}

        <!-- DIAGNOSIS -->
        ${r.diagnosis ? noBreak(`
            ${colorCard(`
                <div class="diag-title">${e(r.diagnosis)}</div>
                <div class="pills-row">
                    ${r.severity ? `<span class="pill" style="background:${sevFill};">${e(r.severity.toUpperCase())}</span>` : ''}
                    ${r.urgency  ? `<span class="pill pill-wrap" style="background:${urgFill};">${e(r.urgency.toUpperCase())}</span>` : ''}
                    ${r.confidence != null ? `<span class="confidence">${r.confidence}% ${e(r.confidenceLabel || '')} Confidence</span>` : ''}
                </div>
            `, C.bgLight, C.borderLight)}
        `) : ''}

        <!-- HEALTH SCORE -->
        ${noBreak(`
            ${sectionHead('Health Score')}
            <div class="bar-row">
                <span class="bar-label">Current Health</span>
                <span class="bar-value" style="color:${sc};">${r.healthScore ?? 0}/100</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.min(r.healthScore ?? 0, 100)}%;background:${sc};"></div></div>
            <div class="bar-row" style="margin-top:10px;">
                <span class="bar-label">After ${r.daysToImprove || 10}-day treatment</span>
                <span class="bar-value" style="color:${C.green};">${r.healthTarget ?? 85}/100</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.min(r.healthTarget ?? 85, 100)}%;background:${C.green};"></div></div>
        `)}

        <!-- AI FINDINGS -->
        ${r.imageFindings || r.summary ? noBreak(`
            ${sectionHead('AI Findings')}
            ${r.imageFindings ? `<p class="findings-italic">${e(r.imageFindings)}</p>` : ''}
            ${r.summary       ? `<p class="findings-text">${e(r.summary)}</p>`          : ''}
        `) : ''}

        <!-- TREATMENT STEPS -->
        ${steps.length > 0 ? `
            ${noBreak(`
                ${sectionHead('Treatment Steps')}
                <div class="step-row">
                    <div class="step-num">1</div>
                    <p class="step-text">${e(steps[0])}</p>
                </div>
            `)}
            ${steps.slice(1).map((s, i) => noBreak(`
                <div class="step-row">
                    <div class="step-num">${i + 2}</div>
                    <p class="step-text">${e(s)}</p>
                </div>
            `)).join('')}
        ` : ''}

        <!-- NATURAL REMEDIES -->
        ${natural.length > 0 ? noBreak(`
            ${sectionHead('Natural Remedies')}
            ${colorCard(
                natural.map(n => `<p class="card-item" style="color:#1A4A1A;">&bull; ${e(n)}</p>`).join(''),
                C.bgGreen, C.borderGreen
            )}
        `) : ''}

        <!-- DIET RECOMMENDATION -->
        ${dietText ? noBreak(`
            ${sectionHead('Diet Recommendation')}
            ${colorCard(`
                <p class="card-item" style="color:#5C3800;">${e(dietText)}</p>
                ${r.currentDietAssessment ? `<p class="card-sub">${e('Current assessment: ' + r.currentDietAssessment)}</p>` : ''}
            `, C.bgAmber, C.borderAmber)}
        `) : ''}

        <!-- RED FLAGS -->
        ${redFlags.length > 0 ? noBreak(`
            ${sectionHead('See Vet If You Notice')}
            ${colorCard(
                redFlags.map(f => `<p class="card-item" style="color:#7A1A1A;">[!] &nbsp;${e(f)}</p>`).join(''),
                C.bgRed, C.borderRed
            )}
        `) : ''}

        <!-- DOG PROFILE -->
        ${noBreak(`
            ${sectionHead('Dog Profile')}
            <div class="profile-grid">
                ${profileRows.map(([label, value]) => `
                <div class="profile-cell">
                    <div class="profile-label">${e(label)}</div>
                    <div class="profile-value">${e(String(value))}</div>
                </div>`).join('')}
            </div>
        `)}
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* ── Reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    color: #2A1E00;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Page setup ── */
  /* Puppeteer controls physical margins via page.pdf({ margin }).
     We only set @page :first to cancel the top margin on page 1
     so the header banner sits flush at the top. */
  @page {
    size: A4;
  }
  @page :first {
    margin-top: 0;
  }

  /* ── Header banner — full bleed, cancels the top page margin on page 1 ── */
  .header-banner {
    background: ${C.brand};
    padding: 18px 15mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 16px;
  }
  .header-left {}
  .header-title { font-size: 20px; font-weight: 900; color: ${C.light}; letter-spacing: -0.3px; }
  .header-sub   { font-size: 10px; color: ${C.gold}; margin-top: 3px; }
  .header-date  { font-size: 10px; color: ${C.gold}; margin-top: 2px; }
  .header-score { text-align: right; }
  .score-num  { font-size: 38px; font-weight: 900; line-height: 1; }
  .score-denom { font-size: 10px; color: ${C.gold}; }

  /* ── Dog meta ── */
  .dog-meta-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
  .dog-name     { font-size: 17px; font-weight: 900; color: ${C.brand}; }
  .owner-name   { font-size: 11px; color: ${C.gray}; }
  .dog-meta-sub { font-size: 11px; color: ${C.gray}; margin-bottom: 14px; }

  /* ── no-break wrapper ── */
  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 4px;
  }

  /* ── Section header ── */
  .section-head  { margin: 14px 0 8px; }
  .section-label { font-size: 9px; font-weight: 800; color: ${C.gray}; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
  .section-rule  { height: 1px; background: ${C.gold}; opacity: 0.55; }

  /* ── Color card ── */
  .color-card {
    border: 1.5px solid;
    border-radius: 10px;
    padding: 14px 16px;
    margin-top: 2px;
  }

  /* ── Diagnosis ── */
  .diag-title { font-size: 14px; font-weight: 800; color: ${C.brand}; line-height: 1.5; margin-bottom: 12px; }
  .pills-row  { display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-start; }
  .pill       { color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 5px; white-space: nowrap; }
  .pill-wrap  { white-space: normal; word-break: break-word; max-width: 440px; line-height: 1.4; }
  .confidence { font-size: 10px; color: ${C.gray}; margin-left: auto; white-space: nowrap; padding-top: 4px; }

  /* ── Health bars ── */
  .bar-row   { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .bar-label { color: ${C.brand}; }
  .bar-value { font-weight: 800; }
  .bar-track { background: ${C.border}; border-radius: 4px; height: 7px; overflow: hidden; }
  .bar-fill  { height: 100%; border-radius: 4px; }

  /* ── AI findings ── */
  .findings-italic { font-size: 12px; color: ${C.gray}; font-style: italic; line-height: 1.6; margin-bottom: 6px; }
  .findings-text   { font-size: 12px; color: ${C.brand}; line-height: 1.6; }

  /* ── Treatment steps ── */
  .step-row  { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 6px; }
  .step-num  {
    min-width: 22px; width: 22px; height: 22px; border-radius: 50%;
    background: ${C.brand}; color: #fff;
    font-size: 10px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .step-text { font-size: 12px; color: #2A1E00; line-height: 1.6; }

  /* ── Card items ── */
  .card-item { font-size: 12px; line-height: 1.6; margin-bottom: 6px; }
  .card-item:last-child { margin-bottom: 0; }
  .card-sub  { font-size: 11px; color: ${C.gray}; font-style: italic; line-height: 1.5; margin-top: 8px; }

  /* ── Dog profile grid ── */
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
  .profile-cell { margin-bottom: 10px; }
  .profile-label { font-size: 9px; font-weight: 800; color: ${C.gray}; text-transform: uppercase; letter-spacing: 0.4px; }
  .profile-value { font-size: 12px; color: ${C.brand}; margin-top: 2px; word-break: break-word; }
</style>
</head>
<body>

  <!-- HEADER BANNER — full bleed, no wrapper padding -->
  <div class="header-banner">
    <div class="header-left">
      <div class="header-title">VetRx Scan</div>
      <div class="header-sub">AI Dog Health Diagnosis Report</div>
      <div class="header-date">${e(dateStr)}</div>
    </div>
    <div class="header-score">
      <div class="score-num" style="color:${sc};">${e(String(r.healthScore ?? '--'))}</div>
      <div class="score-denom">/100</div>
    </div>
  </div>

  <!-- BODY — padded wrapper so content has side margins -->
  <div style="padding: 0 15mm 20mm;">
    ${body}
  </div>

</body>
</html>`;
}

// ── Browser singleton ─────────────────────────────────────────────────
// Reuse one browser instance across requests; restart if it crashes.
let _browser = null;

async function getBrowser() {
    if (_browser) {
        try {
            // Quick health check
            await _browser.version();
            return _browser;
        } catch {
            _browser = null;
        }
    }
    _browser = await puppeteer.launch({
        headless: true,
        // Use system Chromium in Docker (set via PUPPETEER_EXECUTABLE_PATH env var).
        // Falls back to Puppeteer's bundled Chrome in local dev where the env var is unset.
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
    return _browser;
}

// ── Handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { report, dogProfile, ownerName, scanDate } = req.body || {};
    const r   = report     || {};
    const dog = dogProfile || {};

    const html = buildDocument(r, dog, ownerName || '', scanDate || null);

    let page;
    try {
        const browser = await getBrowser();
        page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const safeName = clean(dog.name || 'dog').replace(/\s+/g, '-') || 'dog';
        const dateSlug = new Date().toISOString().slice(0, 10);

        const pdf = await page.pdf({
            format:          'A4',
            printBackground: true,
            margin:          { top: '10mm', right: '0', bottom: '12mm', left: '0' },
            displayHeaderFooter: true,
            headerTemplate: '<span></span>',
            footerTemplate: `
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:7px;color:#9B7E4A;
                            width:100%;padding:0 15mm;box-sizing:border-box;
                            display:flex;justify-content:space-between;align-items:center;">
                    <span>VetRx Scan is an AI assistance tool. Consult a licensed veterinarian for medical decisions.</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span>&nbsp;&nbsp;|&nbsp;&nbsp;doglicious.in</span>
                </div>`,
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="VetRx-${safeName}-${dateSlug}.pdf"`);
        res.setHeader('Content-Length', pdf.length);
        res.end(pdf);
    } catch (err) {
        console.error('[vetrx-report-pdf] Error:', err);
        if (!res.headersSent) res.status(500).json({ error: err.message || 'PDF generation failed' });
    } finally {
        if (page) await page.close().catch(() => {});
    }
}
