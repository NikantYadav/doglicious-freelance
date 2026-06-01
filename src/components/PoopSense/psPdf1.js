// PoopSense AI — PDF generator using pdfmake (direct download, no print dialog)

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// ── Palette ───────────────────────────────────────────────────────────
const BRAND = '#3A2700';
const AMBER = '#C47808';
const GREEN = '#195C30';
const RED   = '#AD2218';
const GREY  = '#9C7D52';
const WHITE = '#FFFFFF';

const RISK_COLOR = { g: GREEN, w: AMBER, c: RED };
const RISK_LABEL = { g: 'Low Risk ✓', w: 'Monitor ⚠', c: 'Urgent ✕' };
const RISK_BG    = { g: '#E7F4EC', w: '#FFF6E8', c: '#FCECEA' };
const RISK_BORDER = { g: '#A8D5B5', w: '#F0C060', c: '#E8A8A8' };

// ── Helpers ───────────────────────────────────────────────────────────

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
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

/** Convert a base64 image string to a data URL for pdfmake */
function b64ToDataUrl(b64) {
  return `data:image/jpeg;base64,${b64}`;
}

/** Colored box with a label and body content (array of strings or a pdfmake stack) */
function coloredBox(title, itemsOrContent, bgColor, borderColor, titleColor, textColor) {
  let body;
  if (Array.isArray(itemsOrContent)) {
    body = {
      stack: itemsOrContent.map(item => ({
        text: `•  ${item}`,
        color: textColor,
        fontSize: 10,
        margin: [0, 3, 0, 0]
      }))
    };
  } else {
    body = itemsOrContent;
  }

  return {
    table: {
      widths: ['*'],
      body: [[
        {
          stack: [
            { text: title.toUpperCase(), color: titleColor, bold: true, fontSize: 8.5, margin: [0, 0, 0, 6] },
            body
          ]
        }
      ]]
    },
    layout: {
      fillColor: bgColor,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => borderColor, vLineColor: () => borderColor,
      paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 10, paddingBottom: () => 10
    },
    margin: [0, 0, 0, 10],
    unbreakable: true
  };
}

/** Score bar for score breakdown params */
function scoreBar(label, value, max, color) {
  const w = 400;
  const fillW = Math.max(4, w * (value / max));
  return {
    columns: [
      { text: label, fontSize: 9, color: BRAND, width: 80 },
      {
        stack: [{
          canvas: [
            { type: 'line', x1: 0, y1: 4, x2: w, y2: 4, lineWidth: 7, lineColor: '#EAE0D0', lineCap: 'round' },
            { type: 'line', x1: 0, y1: 4, x2: fillW, y2: 4, lineWidth: 7, lineColor: color, lineCap: 'round' }
          ]
        }],
        width: '*'
      },
      { text: `${value}/${max}`, fontSize: 8, color: GREY, width: 30, alignment: 'right', margin: [0, 1, 0, 0] }
    ],
    margin: [0, 0, 0, 6],
    unbreakable: true
  };
}

// ── Single Scan PDF ───────────────────────────────────────────────────

export async function downloadPoopSensePDF(entry, dog) {
  const rk = entry.risk || 'w';
  const riskColor  = RISK_COLOR[rk];
  const riskBg     = RISK_BG[rk];
  const riskBorder = RISK_BORDER[rk];

  const content = [];

  // 1. Header Banner
  content.push({
    margin: [-40, -40, -40, 16],
    table: {
      widths: ['*'],
      body: [[
        {
          fillColor: BRAND,
          border: [false, false, false, false],
          columns: [
            {
              stack: [
                { text: 'PoopSense AI', color: WHITE, fontSize: 18, bold: true },
                { text: 'by Doglicious.in  ·  AI Stool Health Analysis', color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: [0, 4, 0, 2] },
                { text: `${entry.date}  ·  ${entry.time}`, color: 'rgba(255,255,255,0.65)', fontSize: 10 }
              ],
              margin: [40, 24, 0, 20]
            },
            {
              text: `#${entry.id}`,
              color: 'rgba(255,255,255,0.55)',
              fontSize: 9,
              alignment: 'right',
              margin: [0, 28, 40, 20]
            }
          ]
        }
      ]]
    },
    layout: 'noBorders'
  });

  // 2. Dog Info
  if (dog) {
    content.push({
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: dog.name || '', fontSize: 13, bold: true, color: BRAND },
            { text: `${dog.breed || ''}  ·  ${dog.age || '?'}yr  ·  ${dog.wt || '?'}kg  ·  ${dog.diet || ''}`, fontSize: 10, color: GREY, margin: [0, 4, 0, 0] }
          ]
        }]]
      },
      layout: {
        fillColor: WHITE,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => 'rgba(58,39,0,0.1)', vLineColor: () => 'rgba(58,39,0,0.1)',
        paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 10, paddingBottom: () => 10
      },
      margin: [0, 0, 0, 12],
      unbreakable: true
    });
  }

  // 3. Score Band
  content.push({
    table: {
      widths: ['*'],
      body: [[{
        columns: [
          {
            // Score circle (simulated with a colored box)
            table: {
              widths: [52],
              body: [[{
                text: String(entry.score ?? 0),
                fontSize: 18, bold: true, color: WHITE,
                alignment: 'center',
                margin: [0, 8, 0, 8]
              }]]
            },
            layout: {
              fillColor: riskColor,
              hLineWidth: () => 0, vLineWidth: () => 0,
              paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
            },
            width: 52
          },
          {
            stack: [
              { text: RISK_LABEL[rk], fontSize: 14, bold: true, color: riskColor },
              { text: entry.stoolType || '', fontSize: 10, color: BRAND, margin: [0, 4, 0, 2] },
              { text: `Bristol Scale: Type ${entry.bristolScore || '?'}/7`, fontSize: 9, color: GREY }
            ],
            margin: [12, 8, 0, 8]
          }
        ]
      }]]
    },
    layout: {
      fillColor: riskBg,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => riskBorder, vLineColor: () => riskBorder,
      paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 4, paddingBottom: () => 4
    },
    margin: [0, 0, 0, 12],
    unbreakable: true
  });

  // 4. Characteristics Grid
  const cells = [
    { l: 'COLOUR',      v: entry.color       || 'N/A' },
    { l: 'CONSISTENCY', v: entry.consistency || 'N/A' },
    { l: 'BRISTOL',     v: `Type ${entry.bristolScore || '?'}/7` },
    { l: 'TYPE',        v: entry.stoolType   || 'N/A' },
  ];

  const gridRows = [];
  for (let i = 0; i < cells.length; i += 2) {
    gridRows.push([
      {
        stack: [
          { text: cells[i].l, fontSize: 8, color: GREY, margin: [0, 0, 0, 3] },
          { text: cells[i].v, fontSize: 10, bold: true, color: BRAND }
        ],
        margin: [8, 8, 8, 8]
      },
      {
        stack: [
          { text: cells[i + 1].l, fontSize: 8, color: GREY, margin: [0, 0, 0, 3] },
          { text: cells[i + 1].v, fontSize: 10, bold: true, color: BRAND }
        ],
        margin: [8, 8, 8, 8]
      }
    ]);
  }

  content.push({
    table: { widths: ['*', '*'], body: gridRows },
    layout: {
      fillColor: WHITE,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => 'rgba(58,39,0,0.08)', vLineColor: () => 'rgba(58,39,0,0.08)',
      paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
    },
    margin: [0, 0, 0, 12],
    unbreakable: true
  });

  // 5. Score Breakdown
  if (entry.params) {
    const params = [
      { k: 'color',       l: 'Colour',       max: 20 },
      { k: 'consistency', l: 'Consistency',  max: 25 },
      { k: 'shape',       l: 'Shape',        max: 15 },
      { k: 'contents',    l: 'Contents',     max: 20 },
      { k: 'riskPattern', l: 'Risk Pattern', max: 20 },
    ];

    content.push({
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: 'SCORE BREAKDOWN', fontSize: 8.5, bold: true, color: GREY, margin: [0, 0, 0, 8] },
            ...params.map(({ k, l, max }) => scoreBar(l, entry.params[k] ?? 0, max, riskColor))
          ]
        }]]
      },
      layout: {
        fillColor: WHITE,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => 'rgba(58,39,0,0.08)', vLineColor: () => 'rgba(58,39,0,0.08)',
        paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 10, paddingBottom: () => 6
      },
      margin: [0, 0, 0, 12],
      unbreakable: true
    });
  }

  // 6. Clinical Summary
  if (entry.sum) {
    content.push(coloredBox('CLINICAL SUMMARY', {
      text: entry.sum, color: '#5C3F18', fontSize: 10
    }, '#FFF6E8', `${AMBER}44`, BRAND, '#5C3F18'));
  }

  // 7. In Simple Terms
  if (entry.simpleEn) {
    content.push(coloredBox('IN SIMPLE TERMS', {
      text: entry.simpleEn, color: '#1A3550', fontSize: 10
    }, '#E8F4FD', 'rgba(52,152,219,0.3)', '#1A5276', '#1A3550'));
  }

  // 8. AI Action Plan (Recommendations)
  if (entry.recommendations?.length) {
    const recItems = entry.recommendations.map((rec, i) => ({
      columns: [
        { text: `${i + 1}.`, width: 16, fontSize: 9, bold: true, color: GREEN },
        { text: rec, width: '*', fontSize: 9, color: '#5C3F18' }
      ],
      margin: [0, 3, 0, 0],
      unbreakable: true
    }));

    content.push(coloredBox('AI ACTION PLAN', { stack: recItems }, '#EEF6F1', 'rgba(25,92,48,0.2)', GREEN, '#5C3F18'));
  }

  // 9. Possible Conditions
  if (entry.possibleConditions?.length) {
    content.push(coloredBox(
      'POSSIBLE CONDITIONS (NON-DIAGNOSTIC)',
      entry.possibleConditions,
      WHITE,
      'rgba(58,39,0,0.08)',
      GREY,
      BRAND
    ));
  }

  // 10. Scan Image
  if (entry.imgB64) {
    content.push({
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: 'SCAN PHOTO', fontSize: 8.5, bold: true, color: GREY, margin: [0, 0, 0, 8] },
            { image: b64ToDataUrl(entry.imgB64), fit: [495, 200], alignment: 'center' }
          ]
        }]]
      },
      layout: {
        fillColor: WHITE,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => 'rgba(58,39,0,0.08)', vLineColor: () => 'rgba(58,39,0,0.08)',
        paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 10, paddingBottom: () => 10
      },
      margin: [0, 0, 0, 12],
      unbreakable: true
    });
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 50],
    content,
    footer: (currentPage, pageCount) => ({
      margin: [40, 8, 40, 0],
      stack: [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: BRAND, strokeOpacity: 0.12 }], margin: [0, 0, 0, 6] },
        {
          columns: [
            { text: 'PoopSense AI by Doglicious.in  ·  AI analysis only — not a substitute for veterinary diagnosis', color: GREY, fontSize: 7.5 },
            { text: `Page ${currentPage} of ${pageCount}  |  Report ID: ${entry.id}`, color: GREY, fontSize: 7.5, alignment: 'right' }
          ]
        }
      ]
    }),
    defaultStyle: { font: 'Roboto' }
  };

  const dogName = (dog?.name || 'Dog').replace(/\s+/g, '-');
  const filename = `PoopSense_${dogName}_${entry.date}_${entry.id}.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
}

// ── Progress / History Report PDF ────────────────────────────────────

export async function downloadProgressPDF(history, dog, days) {
  const entries = filterByDays(history, days);
  const content = [];

  // 1. Header Banner
  const now = new Date();
  content.push({
    margin: [-40, -40, -40, 16],
    table: {
      widths: ['*'],
      body: [[
        {
          fillColor: BRAND,
          border: [false, false, false, false],
          columns: [
            {
              stack: [
                { text: 'PoopSense AI', color: WHITE, fontSize: 18, bold: true },
                { text: `${days}-Day Progress Report  ·  by Doglicious.in`, color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: [0, 4, 0, 2] },
                { text: `Generated: ${fmtDateShortLocal(now.toISOString().slice(0, 10))}`, color: 'rgba(255,255,255,0.55)', fontSize: 9 }
              ],
              margin: [40, 24, 0, 20]
            },
            {
              text: `${entries.length} scan${entries.length !== 1 ? 's' : ''}`,
              color: 'rgba(255,255,255,0.45)',
              fontSize: 9,
              alignment: 'right',
              margin: [0, 28, 40, 20]
            }
          ]
        }
      ]]
    },
    layout: 'noBorders'
  });

  // 2. Dog Info
  if (dog) {
    content.push({
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: dog.name || '', fontSize: 13, bold: true, color: BRAND },
            { text: `${dog.breed || ''}  ·  ${dog.age || '?'}yr  ·  ${dog.wt || '?'}kg`, fontSize: 10, color: GREY, margin: [0, 4, 0, 0] }
          ]
        }]]
      },
      layout: {
        fillColor: WHITE,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => 'rgba(58,39,0,0.1)', vLineColor: () => 'rgba(58,39,0,0.1)',
        paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 10, paddingBottom: () => 10
      },
      margin: [0, 0, 0, 12],
      unbreakable: true
    });
  }

  // 3. Summary Stats or Empty State
  if (entries.length === 0) {
    content.push({
      text: `No scans in the last ${days} days`,
      fontSize: 13, bold: true, color: GREY,
      alignment: 'center',
      margin: [0, 30, 0, 30]
    });
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

    content.push({
      table: {
        widths: statCells.map(() => '*'),
        body: [[
          ...statCells.map(({ label, value, color }) => ({
            stack: [
              { text: value, fontSize: 18, bold: true, color, alignment: 'center' },
              { text: label, fontSize: 8, color: GREY, alignment: 'center', margin: [0, 4, 0, 0] }
            ],
            margin: [0, 8, 0, 8]
          }))
        ]]
      },
      layout: {
        fillColor: WHITE,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => 'rgba(58,39,0,0.08)', vLineColor: () => 'rgba(58,39,0,0.08)',
        paddingLeft: () => 4, paddingRight: () => 4, paddingTop: () => 0, paddingBottom: () => 0
      },
      margin: [0, 0, 0, 12],
      unbreakable: true
    });

    // 4. Score Trend (bar chart via canvas lines)
    const chartEntries = [...entries].reverse().slice(-60);
    const totalW = 515;
    const barW = Math.max(3, totalW / chartEntries.length - 1);
    const chartH = 60;

    const bars = chartEntries.map((e, i) => {
      const h = Math.max(3, ((e.score || 0) / 100) * chartH);
      const x = i * (totalW / chartEntries.length);
      const color = e.risk === 'g' ? GREEN : e.risk === 'w' ? AMBER : RED;
      return { type: 'rect', x, y: chartH - h, w: barW, h, color, r: 1 };
    });

    content.push({
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: 'SCORE TREND', fontSize: 8.5, bold: true, color: GREY, margin: [0, 0, 0, 8] },
            { canvas: bars },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: totalW, y2: 0, lineWidth: 1, lineColor: 'rgba(58,39,0,0.12)' }], margin: [0, 2, 0, 0] }
          ]
        }]]
      },
      layout: {
        fillColor: WHITE,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => 'rgba(58,39,0,0.08)', vLineColor: () => 'rgba(58,39,0,0.08)',
        paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 10, paddingBottom: () => 10
      },
      margin: [0, 0, 0, 12],
      unbreakable: true
    });

    // 5. Scan History List
    content.push({ text: 'SCAN HISTORY', fontSize: 8.5, bold: true, color: GREY, margin: [0, 0, 0, 8] });

    for (const e of entries) {
      const rk = e.risk || 'w';
      const snippet = e.sum ? (e.sum.length > 100 ? e.sum.slice(0, 100) + '…' : e.sum) : '';

      content.push({
        table: {
          widths: [44, '*', 'auto'],
          body: [[
            {
              // Score circle
              table: { widths: [36], body: [[{ text: String(e.score ?? 0), fontSize: 11, bold: true, color: WHITE, alignment: 'center', margin: [0, 6, 0, 6] }]] },
              layout: { fillColor: RISK_COLOR[rk], hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
              margin: [0, 4, 0, 4]
            },
            {
              stack: [
                { text: (e.stoolType || 'Unknown').slice(0, 50), fontSize: 10, bold: true, color: BRAND },
                { text: `${fmtDateShortLocal(e.date)}  ·  ${e.time || ''}  ·  Bristol ${e.bristolScore || '?'}/7`, fontSize: 8.5, color: GREY, margin: [0, 3, 0, 0] },
                snippet ? { text: snippet, fontSize: 8, color: '#8B6B3D', margin: [0, 3, 0, 0] } : null
              ].filter(Boolean),
              margin: [8, 6, 0, 6]
            },
            {
              text: RISK_LABEL[rk],
              fontSize: 8, bold: true, color: RISK_COLOR[rk],
              alignment: 'right',
              margin: [0, 8, 0, 0]
            }
          ]]
        },
        layout: {
          fillColor: WHITE,
          hLineWidth: () => 1, vLineWidth: () => 0,
          hLineColor: () => 'rgba(58,39,0,0.07)',
          paddingLeft: () => 6, paddingRight: () => 6, paddingTop: () => 0, paddingBottom: () => 0
        },
        margin: [0, 0, 0, 5],
        unbreakable: true
      });
    }
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 50],
    content,
    footer: (currentPage, pageCount) => ({
      margin: [40, 8, 40, 0],
      stack: [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: BRAND, strokeOpacity: 0.12 }], margin: [0, 0, 0, 6] },
        {
          columns: [
            { text: 'PoopSense AI by Doglicious.in  ·  AI analysis only — not a substitute for veterinary diagnosis', color: GREY, fontSize: 7.5 },
            { text: `Page ${currentPage} of ${pageCount}`, color: GREY, fontSize: 7.5, alignment: 'right' }
          ]
        }
      ]
    }),
    defaultStyle: { font: 'Roboto' }
  };

  const dogName = (dog?.name || 'Dog').replace(/\s+/g, '-');
  const filename = `PoopSense_Progress_${dogName}_${days}days.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
}
