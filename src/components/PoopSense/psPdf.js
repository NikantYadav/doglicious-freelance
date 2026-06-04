// src/components/PoopSense/psPdf.js
// Generates PoopSense single-scan and progress reports client-side using pdfmake.
// Styling mirrors generateReportPDF.js (VetRx Scan).
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// ── Palette (mirrors VetRx) ───────────────────────────────────────────
const C = {
  brand:        '#3A2700',
  gold:         '#C4A87A',
  light:        '#FBF6EC',
  gray:         '#9B7E4A',
  green:        '#2D6A2D',
  amber:        '#D97706',
  red:          '#B33A3A',
  white:        '#FFFFFF',
  border:       '#EDE8DC',
  borderLight:  '#D4B896',
  bgAmber:      '#FFF8ED',
  bgGreen:      '#F0F7F0',
  bgBlue:       '#EBF5FB',
  borderAmber:  '#E8C97A',
  borderGreen:  '#C8DFC8',
  borderBlue:   '#AED6F1',
  // Risk
  bgRiskG:      '#F0F7F0',
  bgRiskW:      '#FFF8ED',
  bgRiskC:      '#FFF0F0',
  borderRiskG:  '#C8DFC8',
  borderRiskW:  '#E8C97A',
  borderRiskC:  '#E8A8A8',
};

const RISK_MAP = {
  g: { color: C.green, label: 'Low Risk',  bg: C.bgRiskG, border: C.borderRiskG },
  w: { color: C.amber, label: 'Monitor',   bg: C.bgRiskW, border: C.borderRiskW },
  c: { color: C.red,   label: 'Urgent',    bg: C.bgRiskC, border: C.borderRiskC },
};

function scoreColor(s) {
  return s >= 75 ? C.green : s >= 50 ? C.amber : C.red;
}

// ── Shared helpers (same pattern as generateReportPDF.js) ─────────────

function sectionHeader(title) {
  return {
    stack: [
      { text: title.toUpperCase(), style: 'sectionTitle' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: C.gold, strokeOpacity: 0.55 }], margin: [0, 4, 0, 10] }
    ],
    unbreakable: true
  };
}

function progressBar(label, value, max, color) {
  const w = 515;
  const fillW = Math.max(4, w * Math.min(value, max) / max);
  return {
    stack: [
      {
        columns: [
          { text: label, fontSize: 12, color: C.brand },
          { text: `${value}/${max}`, fontSize: 12, color, bold: true, alignment: 'right' }
        ],
        margin: [0, 0, 0, 4]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: w, y2: 0, lineWidth: 7, lineColor: C.border, lineCap: 'round' },
          { type: 'line', x1: 0, y1: 0, x2: fillW, y2: 0, lineWidth: 7, lineColor: color, lineCap: 'round' }
        ],
        margin: [0, 0, 0, 10]
      }
    ],
    unbreakable: true
  };
}

function coloredBox(title, itemsOrContent, bgColor, borderColor, titleColor, textColor) {
  let bodyContent;
  if (Array.isArray(itemsOrContent)) {
    bodyContent = {
      stack: itemsOrContent.map(item => ({
        text: `•  ${item}`,
        color: textColor,
        fontSize: 12,
        margin: [0, 4, 0, 0],
        unbreakable: true
      }))
    };
  } else {
    bodyContent = itemsOrContent;
  }
  return {
    table: {
      widths: ['*'],
      body: [[{
        stack: [
          { text: title.toUpperCase(), color: titleColor, bold: true, fontSize: 8.5 },
          bodyContent
        ]
      }]]
    },
    layout: {
      fillColor: bgColor,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => borderColor, vLineColor: () => borderColor,
      paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 12, paddingBottom: () => 12
    },
    margin: [0, 0, 0, 10],
    unbreakable: true
  };
}

// Score pill — light background with risk-colored text, visible on light card bg
function scorePill(score, color) {
  return {
    table: {
      widths: [44],
      body: [[{
        text: String(score ?? 0),
        fontSize: 20, bold: true, color: color,
        alignment: 'center', margin: [0, 8, 0, 8]
      }]]
    },
    layout: {
      fillColor: C.white,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => color, vLineColor: () => color,
      paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
    }
  };
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

// ── Shared doc definition ─────────────────────────────────────────────

function makeDocDef(content, footerFn) {
  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    content,
    footer: footerFn,
    styles: {
      sectionTitle: { fontSize: 8.5, bold: true, color: C.gray },
      gridLabel:    { fontSize: 8,   bold: true, color: C.gray,  margin: [0, 0, 0, 2] },
      gridValue:    { fontSize: 12,  color: C.brand },
      gridCell:     { margin: [2, 2, 2, 2] }
    },
    defaultStyle: { font: 'Roboto' }
  };
}

// ── Report 1: Single Stool Analysis ──────────────────────────────────

export async function downloadPoopSensePDF(entry, dog) {
  const rk   = entry.risk || 'w';
  const risk = RISK_MAP[rk] || RISK_MAP.w;
  const sc   = scoreColor(entry.score ?? 0);
  const content = [];

  // 1. Header Banner — same full-bleed pattern as VetRx
  content.push({
    margin: [-40, -40, -40, 20],
    table: {
      widths: ['*'],
      body: [[{
        fillColor: C.brand,
        border: [false, false, false, false],
        columns: [
          {
            stack: [
              { text: 'PoopSense AI', color: C.light, fontSize: 20, bold: true },
              { text: 'AI Stool Health Analysis  ·  doglicious.in', color: C.gold, fontSize: 10, margin: [0, 4, 0, 2] },
              { text: `${entry.date || ''}  ·  ${entry.time || ''}`, color: C.gold, fontSize: 10 }
            ],
            margin: [40, 30, 0, 20]
          },
          {
            stack: [{
              text: [
                { text: String(entry.score ?? 0), fontSize: 38, color: sc, bold: true },
                { text: '/100', fontSize: 10, color: C.gold }
              ]
            }],
            alignment: 'right',
            margin: [0, 34, 40, 20]
          }
        ]
      }]]
    },
    layout: 'noBorders'
  });

  // 2. Dog meta — same inline pattern as VetRx
  if (dog) {
    const dogMeta = [dog.breed, dog.age && `${dog.age}yr`, dog.wt && `${dog.wt}kg`, dog.diet].filter(Boolean).join('  |  ');
    content.push({
      columns: [
        { text: dog.name || 'Dog', fontSize: 17, bold: true, color: C.brand },
        { text: `#${entry.id || ''}`, fontSize: 11, color: C.gray, alignment: 'right', margin: [0, 4, 0, 0] }
      ],
      margin: [0, 0, 0, 4]
    });
    if (dogMeta) {
      content.push({ text: dogMeta, fontSize: 11, color: C.gray, margin: [0, 0, 0, 20] });
    }
  }

  // 3. Risk / Score card — mirrors VetRx diagnosis card
  content.push({
    table: {
      widths: ['*'],
      body: [[{
        stack: [
          {
            columns: [
              { ...scorePill(entry.score, risk.color), width: 'auto' },
              {
                stack: [
                  { text: risk.label, fontSize: 14, bold: true, color: risk.color, margin: [0, 0, 0, 4] },
                  {
                    columns: [
                      { text: entry.stoolType || 'Stool Analysis', fontSize: 10, bold: true, color: C.brand, width: 'auto' },
                      { text: `  ·  Bristol Type ${entry.bristolScore || '?'}/7`, fontSize: 10, color: C.brand, width: 'auto' }
                    ]
                  }
                ],
                margin: [12, 4, 0, 0]
              }
            ]
          }
        ]
      }]]
    },
    layout: {
      fillColor: risk.bg,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => risk.border, vLineColor: () => risk.border,
      paddingLeft: () => 14, paddingRight: () => 14, paddingTop: () => 14, paddingBottom: () => 14
    },
    margin: [0, 0, 0, 20],
    unbreakable: true
  });

  // 4. Score breakdown — uses progressBar helper like VetRx health score
  if (entry.params) {
    content.push(sectionHeader('Score Breakdown'));
    const params = [
      { key: 'color',       label: 'Colour',       max: 20 },
      { key: 'consistency', label: 'Consistency',  max: 25 },
      { key: 'shape',       label: 'Shape',        max: 15 },
      { key: 'contents',    label: 'Contents',     max: 20 },
      { key: 'riskPattern', label: 'Risk Pattern', max: 20 },
    ];
    params.forEach(p => {
      content.push(progressBar(p.label, entry.params[p.key] ?? 0, p.max, risk.color));
    });
    content.push({ text: '', margin: [0, 0, 0, 10] });
  }

  // 5. Characteristics grid — same 2-col grid as VetRx dog profile
  content.push(sectionHeader('Stool Characteristics'));
  const chars = [
    ['Colour',      entry.color       || 'N/A'],
    ['Consistency', entry.consistency || 'N/A'],
    ['Bristol',     `Type ${entry.bristolScore || '?'}/7`],
    ['Type',        entry.stoolType   || 'N/A'],
  ];
  const charGrid = [];
  for (let i = 0; i < chars.length; i += 2) {
    const c1 = chars[i];
    const c2 = chars[i + 1] || ['', ''];
    charGrid.push([
      { stack: [{ text: c1[0].toUpperCase(), style: 'gridLabel' }, { text: c1[1], style: 'gridValue' }], margin: [0, 0, 0, 10] },
      { stack: [{ text: c2[0].toUpperCase(), style: 'gridLabel' }, { text: c2[1], style: 'gridValue' }], margin: [0, 0, 0, 10] }
    ]);
  }
  content.push({ table: { widths: ['*', '*'], body: charGrid }, layout: 'noBorders', margin: [0, 0, 0, 10] });

  // 6. Clinical Summary
  if (entry.sum) {
    content.push(coloredBox('Clinical Summary', {
      text: entry.sum, fontSize: 12, color: '#5C3800', margin: [0, 4, 0, 0]
    }, C.bgAmber, C.borderAmber, '#7A4A00', '#5C3800'));
  }

  // 7. In Simple Terms
  if (entry.simpleEn) {
    content.push(coloredBox('In Simple Terms', {
      text: entry.simpleEn, fontSize: 12, color: '#1A3550', margin: [0, 4, 0, 0]
    }, C.bgBlue, C.borderBlue, '#1A5276', '#1A3550'));
  }

  // 8. AI Action Plan — numbered steps like VetRx treatment steps
  if (entry.recommendations?.length) {
    content.push(sectionHeader('AI Action Plan'));
    const stepsStack = entry.recommendations.map((rec, idx) => ({
      columns: [
        { text: `${idx + 1}.`, width: 18, fontSize: 12, color: C.brand, bold: true },
        { text: rec, width: '*', fontSize: 12, color: '#2A1E00' }
      ],
      margin: [0, 0, 0, 8],
      unbreakable: true
    }));
    content.push({ stack: stepsStack, margin: [0, 0, 0, 20] });
  }

  // 9. Possible Conditions
  if (entry.possibleConditions?.length) {
    content.push(coloredBox(
      'Possible Conditions (Non-Diagnostic)',
      entry.possibleConditions,
      C.light, C.borderLight, C.gray, C.brand
    ));
  }

  // 10. Scan Image
  if (entry.imgB64) {
    content.push({ text: '', margin: [0, 10, 0, 0] });
    content.push(sectionHeader('Scan Photo'));
    content.push({
      image: `data:image/jpeg;base64,${entry.imgB64}`,
      fit: [515, 220],
      alignment: 'center',
      margin: [0, 0, 0, 16],
      unbreakable: true
    });
  }

  const dogName = (dog?.name || 'Dog').replace(/\s+/g, '-');
  const filename = `PoopSense-${dogName}-${entry.date || 'report'}-${entry.id || ''}.pdf`;

  pdfMake.createPdf(makeDocDef(content, (currentPage, pageCount) => ({
    margin: [40, 10, 40, 0],
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: C.brand, strokeOpacity: 0.12 }], margin: [0, 0, 0, 8] },
      {
        columns: [
          { text: 'PoopSense AI is an AI assistance tool. Not a substitute for veterinary diagnosis.', color: C.gray, fontSize: 7.5 },
          { text: `Report ID: ${entry.id || ''}  |  Page ${currentPage} of ${pageCount}  |  doglicious.in`, color: C.gray, fontSize: 7.5, alignment: 'right' }
        ]
      }
    ]
  }))).download(filename);
}

// ── Report 2: Progress / History ──────────────────────────────────────

export async function downloadProgressPDF(history, dog, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutStr = cutoff.toISOString().slice(0, 10);
  const entries = [...history]
    .filter(e => e.date >= cutStr)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const content = [];

  // 1. Header Banner
  content.push({
    margin: [-40, -40, -40, 20],
    table: {
      widths: ['*'],
      body: [[{
        fillColor: C.brand,
        border: [false, false, false, false],
        columns: [
          {
            stack: [
              { text: 'PoopSense AI', color: C.light, fontSize: 20, bold: true },
              { text: `${days}-Day Progress Report  ·  doglicious.in`, color: C.gold, fontSize: 10, margin: [0, 4, 0, 2] },
              { text: `Generated: ${fmtDate(new Date().toISOString().slice(0, 10))}`, color: C.gold, fontSize: 10 }
            ],
            margin: [40, 30, 0, 20]
          },
          {
            stack: [{
              text: [
                { text: String(entries.length), fontSize: 38, color: C.gold, bold: true },
                { text: entries.length === 1 ? ' scan' : ' scans', fontSize: 10, color: C.gold }
              ]
            }],
            alignment: 'right',
            margin: [0, 34, 40, 20]
          }
        ]
      }]]
    },
    layout: 'noBorders'
  });

  // 2. Dog meta
  if (dog) {
    const dogMeta = [dog.breed, dog.age && `${dog.age}yr`, dog.wt && `${dog.wt}kg`].filter(Boolean).join('  |  ');
    content.push({ text: dog.name || 'Dog', fontSize: 17, bold: true, color: C.brand, margin: [0, 0, 0, 4] });
    if (dogMeta) content.push({ text: dogMeta, fontSize: 11, color: C.gray, margin: [0, 0, 0, 20] });
  }

  // 3. Summary stats or empty state
  if (entries.length === 0) {
    content.push({ text: `No scans recorded in the last ${days} days.`, fontSize: 12, color: C.gray, alignment: 'center', margin: [0, 30, 0, 30] });
  } else {
    const avg  = Math.round(entries.reduce((s, e) => s + (e.score || 0), 0) / entries.length);
    const good = entries.filter(e => e.score >= 75).length;
    const warn = entries.filter(e => e.score >= 50 && e.score < 75).length;
    const urg  = entries.filter(e => e.score < 50).length;

    // Stats grid — same 2-col grid style
    content.push(sectionHeader('Summary'));
    const statRows = [
      ['Total Scans', String(entries.length), C.brand, 'Avg Score', String(avg), scoreColor(avg)],
      ['Healthy',     String(good),           C.green, 'Monitor',   String(warn), C.amber],
      ['Urgent',      String(urg),            C.red,   '',          '',           C.brand],
    ];
    const statGrid = statRows.map(([l1, v1, c1, l2, v2, c2]) => ([
      { stack: [{ text: l1.toUpperCase(), style: 'gridLabel' }, { text: v1, fontSize: 20, bold: true, color: c1 }], margin: [0, 0, 0, 10] },
      { stack: [{ text: l2.toUpperCase(), style: 'gridLabel' }, { text: v2, fontSize: 20, bold: true, color: c2 }], margin: [0, 0, 0, 10] }
    ]));
    content.push({ table: { widths: ['*', '*'], body: statGrid }, layout: 'noBorders', margin: [0, 0, 0, 20] });

    // 4. Score trend chart
    content.push(sectionHeader('Score Trend'));
    const chartEntries = [...entries].reverse().slice(-30);
    const totalW = 515;
    const barW   = Math.max(4, totalW / (chartEntries.length || 1) - 2);
    const chartH = 60;
    const bars   = chartEntries.map((e, i) => {
      const h = Math.max(3, ((e.score || 0) / 100) * chartH);
      return {
        type: 'rect',
        x: i * (totalW / (chartEntries.length || 1)),
        y: chartH - h,
        w: barW, h,
        color: scoreColor(e.score || 0)
      };
    });
    bars.push({ type: 'line', x1: 0, y1: chartH, x2: totalW, y2: chartH, lineWidth: 1, lineColor: C.border });
    content.push({ canvas: bars, margin: [0, 0, 0, 20] });

    // 5. Scan history list — same card style as VetRx
    content.push(sectionHeader('Scan History'));
    for (const e of entries) {
      const rk   = e.risk || 'w';
      const risk = RISK_MAP[rk] || RISK_MAP.w;
      const sc   = scoreColor(e.score ?? 0);
      const snippet = e.sum ? (e.sum.length > 120 ? e.sum.slice(0, 120) + '…' : e.sum) : '';
      const hasImg = !!(e.imgB64 && e.imgB64.length > 100);

      // Card header row: score pill + meta
      content.push({
        table: {
          widths: ['auto', '*'],
          body: [[
            {
              table: { widths: [40], body: [[{ text: String(e.score ?? 0), fontSize: 14, bold: true, color: C.white, alignment: 'center', margin: [0, 6, 0, 6] }]] },
              layout: { fillColor: sc, hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
            },
            {
              stack: [
                {
                  columns: [
                    { text: (e.stoolType || 'Unknown').slice(0, 50), fontSize: 12, bold: true, color: C.brand },
                    { text: risk.label, fontSize: 9, bold: true, color: risk.color, alignment: 'right', margin: [0, 2, 0, 0] }
                  ]
                },
                { text: `${fmtDate(e.date)}  ·  ${e.time || ''}  ·  Bristol ${e.bristolScore || '?'}/7`, fontSize: 10, color: C.gray, margin: [0, 3, 0, 0] },
                snippet ? { text: snippet, fontSize: 10, color: '#8B6B3D', italics: true, margin: [0, 3, 0, 0] } : null
              ].filter(Boolean),
              margin: [10, 4, 0, 4]
            }
          ]]
        },
        layout: {
          fillColor: C.white,
          hLineWidth: () => 1, vLineWidth: () => 0,
          hLineColor: () => C.border,
          paddingLeft: () => 0, paddingRight: () => 12, paddingTop: () => 0, paddingBottom: () => 0
        },
        margin: [0, 0, 0, hasImg ? 2 : 8],
        unbreakable: true
      });

      // Scan thumbnail — full width below the card header
      if (hasImg) {
        content.push({
          table: {
            widths: ['*'],
            body: [[{
              image: `data:image/jpeg;base64,${e.imgB64}`,
              fit: [515, 180],
              alignment: 'center',
              margin: [0, 6, 0, 6]
            }]]
          },
          layout: {
            fillColor: C.light,
            hLineWidth: () => 1, vLineWidth: () => 1,
            hLineColor: () => C.border, vLineColor: () => C.border,
            paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
          },
          margin: [0, 0, 0, 10],
          unbreakable: true
        });
      }
    }
  }

  const dogName = (dog?.name || 'Dog').replace(/\s+/g, '-');
  const filename = `PoopSense-Progress-${dogName}-${days}days.pdf`;

  pdfMake.createPdf(makeDocDef(content, (currentPage, pageCount) => ({
    margin: [40, 10, 40, 0],
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: C.brand, strokeOpacity: 0.12 }], margin: [0, 0, 0, 8] },
      {
        columns: [
          { text: 'PoopSense AI is an AI assistance tool. Not a substitute for veterinary diagnosis.', color: C.gray, fontSize: 7.5 },
          { text: `Page ${currentPage} of ${pageCount}  |  doglicious.in`, color: C.gray, fontSize: 7.5, alignment: 'right' }
        ]
      }
    ]
  }))).download(filename);
}
