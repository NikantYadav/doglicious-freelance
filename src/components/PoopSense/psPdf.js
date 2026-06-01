// src/utils/generatePoopSenseReport.js
// Generates single reports and progress history reports entirely client-side using pdfMake.
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// ── Palette Configuration ─────────────────────────────────────────────
const C = {
  brand:        '#3A2700',
  amber:        '#C47808',
  green:        '#195C30',
  red:          '#AD2218',
  light:        '#F9F5EF', // Background tint for document
  white:        '#FFFFFF',
  grey:         '#9C7D52',
  border:       '#3a27001a',
  borderLight:  '#3a270012',
  
  // Risk Config Maps
  bgG:          '#E7F4EC',
  bgW:          '#FFF6E8',
  bgC:          '#FCECEA',
  
  // Specific Callouts
  bgSimple:     '#E8F4FD',
  borderSimple: '#3498db4d',
  textSimpleT:  '#1A5276',
  textSimpleB:  '#1A3550',
};

const RISK_MAP = {
  g: { color: C.green, label: 'Low Risk ✓', bg: C.bgG },
  w: { color: C.amber, label: 'Monitor ⚠', bg: C.bgW },
  c: { color: C.red,   label: 'Urgent ✕',  bg: C.bgC }
};

// ── Shared Layout Helpers ─────────────────────────────────────────────

function sectionHeader(title) {
  return {
    stack: [
      { text: title.toUpperCase(), style: 'sectionTitle' },
      { 
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: C.brand, strokeOpacity: 0.15 }], 
        margin: [0, 4, 0, 10] 
      }
    ],
    unbreakable: true
  };
}

function coloredBox(title, contentBlock, bgColor, borderColor, titleColor) {
  return {
    table: {
      widths: ['*'],
      body: [[
        {
          stack: [
            { text: title.toUpperCase(), color: titleColor, bold: true, fontSize: 8.5, margin: [0, 0, 0, 6] },
            contentBlock
          ]
        }
      ]]
    },
    layout: {
      fillColor: bgColor,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => borderColor, vLineColor: () => borderColor,
      paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 12, paddingBottom: () => 12
    },
    margin: [0, 0, 0, 12],
    unbreakable: true
  };
}

function dogInfoCard(dog) {
  if (!dog) return null;
  return {
    table: {
      widths: ['*'],
      body: [[
        {
          stack: [
            { text: dog.name, fontSize: 13, bold: true, color: C.brand },
            { text: `${dog.breed || 'Unknown Breed'}  ·  ${dog.age || '?'}yr  ·  ${dog.wt || '?'}kg  ·  ${dog.diet || 'N/A'}`, fontSize: 10, color: C.grey, margin: [0, 2, 0, 0] }
          ]
        }
      ]]
    },
    layout: {
      fillColor: C.white,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => C.border, vLineColor: () => C.border,
      paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 10, paddingBottom: () => 10
    },
    margin: [0, 0, 0, 16]
  };
}

function fmtDateShortLocal(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

// ── Report Type 1: Single Stool Analysis Report ───────────────────────

export async function downloadPoopSensePDF(entry, dog) {
  const rk = entry.risk || 'w';
  const risk = RISK_MAP[rk] || RISK_MAP.w;
  const content = [];

  // 1. Full-bleed Header Banner (Fixed Edge Clearance)
  content.push({
    margin: [-40, -40, -40, 20],
    table: {
      widths: ['*'],
      body: [[
        {
          fillColor: C.brand,
          border: [false, false, false, false],
          columns: [
            {
              stack: [
                { text: 'PoopSense AI', color: C.white, fontSize: 18, bold: true },
                { text: 'by Doglicious.in  ·  AI Stool Health Analysis', color: '#D9D9D9', fontSize: 10, margin: [0, 4, 0, 2] },
                { text: `${entry.date || ''}  ·  ${entry.time || ''}`, color: '#D9D9D9', fontSize: 10 }
              ],
              margin: [40, 25, 0, 20] 
            },
            {
              text: `#${entry.id || '0000'}`,
              color: '#ffffff73',
              font: 'Roboto',
              fontSize: 9.5,
              alignment: 'right',
              margin: [0, 28, 40, 0]
            }
          ]
        }
      ]]
    },
    layout: 'noBorders'
  });

  // 2. Dog Information Card
  if (dog) content.push(dogInfoCard(dog));

  // 3. Score Summary Band Card
  // 3. Score Summary Band Card
  content.push({
    table: {
      widths: ['auto', '*'],
      body: [[
        {
          table: {
            widths: [48],
            body: [[{
              text: String(entry.score ?? 0),
              color: risk.color, bold: true, fontSize: 16,
              alignment: 'center', margin: [0, 10, 0, 10]
            }]]
          },
          layout: {
            fillColor: risk.color,
            hLineWidth: () => 0, vLineWidth: () => 0,
            paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
          }
        },
        {
          stack: [
            { text: risk.label, color: risk.color, bold: true, fontSize: 14 },
            { text: entry.stoolType || 'Stool Analysis', fontSize: 10, color: C.brand, margin: [0, 2, 0, 2] },
            { text: `Bristol Scale: Type ${entry.bristolScore || '?'}/7`, fontSize: 9, color: C.grey }
          ],
          margin: [12, 2, 0, 0]
        }
      ]]
    },
    layout: {
      fillColor: risk.bg,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => `${risk.color}33`, vLineColor: () => `${risk.color}33`,
      paddingLeft: () => 16, paddingRight: () => 16, paddingTop: () => 12, paddingBottom: () => 12
    },
    margin: [0, 0, 0, 16],
    unbreakable: true
  });

  // 4. Characteristics Grid Layout
  const cellData = [
    { label: 'COLOUR', val: entry.color || 'N/A' },
    { label: 'CONSISTENCY', val: entry.consistency || 'N/A' },
    { label: 'BRISTOL', val: `Type ${entry.bristolScore || '?'}/7` },
    { label: 'TYPE', val: entry.stoolType || 'N/A' }
  ];

  const gridBody = [
    [
      { stack: [{ text: cellData[0].label, style: 'gridLabel' }, { text: cellData[0].val, style: 'gridValue' }], style: 'gridCell' },
      { stack: [{ text: cellData[1].label, style: 'gridLabel' }, { text: cellData[1].val, style: 'gridValue' }], style: 'gridCell' }
    ],
    [
      { stack: [{ text: cellData[2].label, style: 'gridLabel' }, { text: cellData[2].val, style: 'gridValue' }], style: 'gridCell' },
      { stack: [{ text: cellData[3].label, style: 'gridLabel' }, { text: cellData[3].val, style: 'gridValue' }], style: 'gridCell' }
    ]
  ];

  content.push({
    table: {
      widths: ['*', '*'],
      body: gridBody
    },
    layout: {
      fillColor: () => C.white,
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => C.borderLight, vLineColor: () => C.borderLight,
      paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 10, paddingBottom: () => 10
    },
    margin: [0, 0, 0, 16],
    unbreakable: true
  });

  // 5. Score Parameters Breakdown Section
  if (entry.params) {
    const paramsConfig = [
      { key: 'color', label: 'Colour', max: 20 },
      { key: 'consistency', label: 'Consistency', max: 25 },
      { key: 'shape', label: 'Shape', max: 15 },
      { key: 'contents', label: 'Contents', max: 20 },
      { key: 'riskPattern', label: 'Risk Pattern', max: 20 }
    ];

    const targetWidth = 360; 
    const breakdownStack = [{ text: 'SCORE BREAKDOWN', style: 'gridLabel', margin: [0, 0, 0, 12] }];

    paramsConfig.forEach(p => {
      const value = entry.params[p.key] ?? 0;
      const progressRatio = Math.min(1, value / p.max);
      breakdownStack.push({
        margin: [0, 0, 0, 8],
        columns: [
          { text: p.label, fontSize: 9.5, color: C.brand, width: 85 },
          {
            width: targetWidth,
            canvas: [
              { type: 'rect', x: 0, y: 2, w: targetWidth, h: 7, r: 3.5, color: '#EAE0D0' },
              { type: 'rect', x: 0, y: 2, w: Math.max(5, targetWidth * progressRatio), h: 7, r: 3.5, color: risk.color }
            ]
          },
          { text: `${value}/${p.max}`, fontSize: 9, color: C.grey, alignment: 'right', width: '*' }
        ]
      });
    });

    content.push({
      table: { widths: ['*'], body: [[{ stack: breakdownStack }]] },
      layout: {
        fillColor: C.white,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => C.borderLight, vLineColor: () => C.borderLight,
        paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 12, paddingBottom: () => 10
      },
      margin: [0, 0, 0, 16],
      unbreakable: true
    });
  }

  // 6. Clinical Summary Box
  if (entry.sum) {
    content.push(coloredBox('CLINICAL SUMMARY', { text: entry.sum, fontSize: 10, color: '#5C3F18', lineHeight: 1.35 }, C.bgW, C.amber + '44', C.brand));
  }

  // 7. Simple Terms Callout Box
  if (entry.simpleEn) {
    content.push(coloredBox('IN SIMPLE TERMS', { text: entry.simpleEn, fontSize: 10, color: C.textSimpleB, lineHeight: 1.35 }, C.bgSimple, C.borderSimple, C.textSimpleT));
  }

  // 8. Action Plan Steps Block
  if (entry.recommendations?.length) {
    const stepsStack = entry.recommendations.map((rec, i) => ({
      columns: [
        {
          width: 18,
          table: {
            widths: [14],
            body: [[{ text: String(i + 1), color: C.white, fontSize: 7.5, bold: true, alignment: 'center', margin: [0, 2, 0, 2] }]]
          },
          layout: {
            fillColor: C.green,
            hLineWidth: () => 0, vLineWidth: () => 0,
            paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
          }
        },
        { text: rec, width: '*', fontSize: 9.5, color: '#5C3F18', lineHeight: 1.3, margin: [4, 0, 0, 0] }
      ],
      margin: [0, 0, 0, 6],
      unbreakable: true
    }));

    content.push(coloredBox('AI ACTION PLAN', { stack: stepsStack, margin: [0, 4, 0, 0] }, '#EEF6F1', '#195c3033', C.green));
  }

  // 9. Possible Conditions Block
  if (entry.possibleConditions?.length) {
    const conditionsStack = entry.possibleConditions.map(cond => ({
      columns: [
        { text: '•', width: 10, color: C.amber, bold: true, fontSize: 12 },
        { text: cond, width: '*', fontSize: 9.5, color: C.brand }
      ],
      margin: [0, 0, 0, 5],
      unbreakable: true
    }));
    content.push(coloredBox('POSSIBLE CONDITIONS (NON-DIAGNOSTIC)', { stack: conditionsStack, margin: [0, 4, 0, 0] }, C.white, C.borderLight, C.grey));
  }

  // 10. Scan Image Render
  if (entry.imgB64) {
    content.push(sectionHeader('Scan Photo'));
    content.push({
      image: `data:image/jpeg;base64,${entry.imgB64}`,
      width: 220,
      alignment: 'center',
      margin: [0, 4, 0, 16],
      unbreakable: true
    });
  }

  const dogName = (dog?.name || 'Dog').replace(/\s+/g, '-');
  const filename = `PoopSense-${dogName}-${entry.id || 'report'}.pdf`;
  
  await generateAndDownload(content, filename, entry.id);
}


// ── Report Type 2: Multi-Day Progress/History Report ─────────────────

export async function downloadProgressPDF(history, dog, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutStr = cutoff.toISOString().slice(0, 10);
  
  const entries = [...history]
    .filter(e => e.date >= cutStr)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const content = [];

  // 1. Full-bleed Progress Header Banner
  content.push({
    margin: [-40, -40, -40, 20],
    table: {
      widths: ['*'],
      body: [[
        {
          fillColor: C.brand,
          border: [false, false, false, false],
          columns: [
            {
              stack: [
                { text: 'PoopSense AI', color: C.white, fontSize: 18, bold: true },
                { text: `${days}-Day Progress Report  ·  by Doglicious.in`, color: '#ffffffa6', fontSize: 10, margin: [0, 4, 0, 2] },
                { text: `Generated: ${fmtDateShortLocal(new Date().toISOString().slice(0,10))}`, color: '#ffffff8c', fontSize: 9 }
              ],
              margin: [40, 25, 0, 20] 
            },
            {
              text: `${entries.length} scan${entries.length !== 1 ? 's' : ''}`,
              color: '#ffffff73',
              font: 'Roboto',
              fontSize: 10,
              alignment: 'right',
              margin: [0, 28, 40, 0]
            }
          ]
        }
      ]]
    },
    layout: 'noBorders'
  });

  // 2. Dog Info
  if (dog) content.push(dogInfoCard(dog));

  // 3. Conditional Content: Empty State vs Aggregated Analytics Statistics
  if (entries.length === 0) {
    content.push({
      table: {
        widths: ['*'],
        body: [[{ text: `No scans recorded in the last ${days} days.`, fontSize: 12, alignment: 'center', color: C.grey, margin: [0, 20, 0, 20] }]]
      },
      layout: { fillColor: C.white, hLineColor: () => C.borderLight, vLineColor: () => C.borderLight },
      margin: [0, 0, 0, 16]
    });
  } else {
    const avgScore = Math.round(entries.reduce((sum, e) => sum + (e.score || 0), 0) / entries.length);
    const healthyCount = entries.filter(e => e.score >= 75).length;
    const monitorCount = entries.filter(e => e.score >= 50 && e.score < 75).length;
    const urgentCount = entries.filter(e => e.score < 50).length;

    const statsGrid = [
      { label: 'Total Scans', val: entries.length, col: C.brand },
      { label: 'Avg Score', val: avgScore, col: avgScore >= 75 ? C.green : avgScore >= 50 ? C.amber : C.red },
      { label: 'Healthy', val: healthyCount, col: C.green },
      { label: 'Monitor', val: monitorCount, col: C.amber },
      { label: 'Urgent', val: urgentCount, col: C.red }
    ];

    content.push({
      columns: statsGrid.map(s => ({
        width: '*',
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: String(s.val), fontSize: 16, bold: true, color: s.col, alignment: 'center' },
                { text: s.label, fontSize: 7.5, color: C.grey, alignment: 'center', margin: [0, 2, 0, 0] }
              ]
            }
          ]]
        },
        layout: {
          fillColor: C.white,
          hLineWidth: () => 1, vLineWidth: () => 1,
          hLineColor: () => C.borderLight, vLineColor: () => C.borderLight,
          paddingTop: () => 8, paddingBottom: () => 8
        },
        margin: [0, 0, 4, 0]
      })),
      margin: [0, 0, -4, 16]
    });

    // 4. Native Vector-Based Score Trend Chart
    const chartEntries = [...entries].reverse().slice(-25); // Cap to last 25 items horizontally
    const chartCanvasWidth = 490;
    const chartCanvasHeight = 60;
    const itemSpacing = chartCanvasWidth / (chartEntries.length || 1);
    const barWidth = Math.max(5, itemSpacing - 4);

    const vectorChartElements = chartEntries.map((e, index) => {
      const score = e.score || 0;
      const barHeight = Math.max(4, (score / 100) * chartCanvasHeight);
      const startX = 5 + (index * itemSpacing);
      const startY = chartCanvasHeight - barHeight;
      
      const rKey = e.risk || 'w';
      const rColor = RISK_MAP[rKey]?.color || C.amber;

      return {
        type: 'rect',
        x: startX,
        y: startY,
        w: barWidth,
        h: barHeight,
        color: rColor
      };
    });

    // Add baseline bar to chart canvas
    vectorChartElements.push({ type: 'line', x1: 0, y1: chartCanvasHeight, x2: chartCanvasWidth, y2: chartCanvasHeight, lineWidth: 1, lineColor: '#EDE8DC' });

    content.push({
      table: {
        widths: ['*'],
        body: [[
          {
            stack: [
              { text: 'SCORE TREND', style: 'gridLabel', margin: [0, 0, 0, 10] },
              { canvas: vectorChartElements, margin: [0, 4, 0, 4] }
            ]
          }
        ]]
      },
      layout: {
        fillColor: C.white,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => C.borderLight, vLineColor: () => C.borderLight,
        paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 10, paddingBottom: () => 10
      },
      margin: [0, 0, 0, 20],
      unbreakable: true
    });
  }

  // 5. Historical Analysis Timeline Rows
  if (entries.length > 0) {
    content.push(sectionHeader('Scan History'));

    entries.forEach(entry => {
      const rk = entry.risk || 'w';
      const risk = RISK_MAP[rk] || RISK_MAP.w;
      const snippetText = entry.sum && entry.sum.length > 90 ? `${entry.sum.slice(0, 90)}...` : entry.sum || '';

      content.push({
        table: {
          widths: ['auto', '*', 'auto'],
          body: [[
          // Score cell
            {
              table: {
                widths: [30],
                body: [[{ text: String(entry.score ?? 0), color: C.white, bold: true, fontSize: 10, alignment: 'center', margin: [0, 5, 0, 5] }]]
              },
              layout: {
                fillColor: risk.color,
                hLineWidth: () => 0, vLineWidth: () => 0,
                paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0
              },
              width: 30,
              margin: [0, 2, 0, 0]
            },
            // Content Block Descriptor
            {
              stack: [
                { text: (entry.stoolType || 'Unknown Status').toUpperCase(), fontSize: 10, bold: true, color: C.brand },
                { text: `${fmtDateShortLocal(entry.date)}  ·  ${entry.time || ''}  ·  Bristol ${entry.bristolScore || '?'}/7`, fontSize: 8.5, color: C.grey, margin: [0, 2, 0, 3] },
                snippetText ? { text: snippetText, fontSize: 8.5, color: '#8B6B3D', italic: true } : null
              ].filter(Boolean),
              margin: [12, 0, 0, 0]
            },
            // Urgency/Severity Text
            {
              text: risk.label,
              fontSize: 8.5,
              bold: true,
              color: risk.color,
              alignment: 'right',
              margin: [0, 2, 0, 0]
            }
          ]]
        },
        layout: {
          fillColor: C.white,
          hLineWidth: () => 1, vLineWidth: () => 1,
          hLineColor: () => C.borderLight, vLineColor: () => C.borderLight,
          paddingLeft: () => 12, paddingRight: () => 12, paddingTop: () => 10, paddingBottom: () => 10
        },
        margin: [0, 0, 0, 8],
        unbreakable: true
      });
    });
  }

  const dogName = (dog?.name || 'Dog').replace(/\s+/g, '-');
  const filename = `PoopSense-Progress-${dogName}-${days}days.pdf`;

  await generateAndDownload(content, filename, null);
}

// ── Shared Orchestration Compiles Engine ──────────────────────────────

// ── Shared Orchestration Compiles Engine ──────────────────────────────

async function generateAndDownload(content, filename, reportId) {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    // FIXED: Properly draw a canvas rectangle to fill the background
    background: function(currentPage, pageSize) {
      return {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: pageSize.width,
            h: pageSize.height,
            color: C.light
          }
        ]
      };
    },
    content: content,
    footer: function(currentPage, pageCount) {
      return {
        margin: [40, 10, 40, 0],
        stack: [
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: C.brand, strokeOpacity: 0.1 }], margin: [0, 0, 0, 8] },
          {
            columns: [
              { text: 'PoopSense AI by Doglicious.in  ·  AI analysis only — not a substitute for veterinary diagnosis.', color: C.grey, fontSize: 7.5 },
              { 
                text: reportId ? `Report ID: ${reportId}  |  Page ${currentPage} of ${pageCount}` : `Page ${currentPage} of ${pageCount}`, 
                color: C.grey, 
                fontSize: 7.5, 
                alignment: 'right' 
              }
            ]
          }
        ]
      };
    },
    styles: {
      sectionTitle: {
        fontSize: 8.5,
        bold: true,
        color: C.grey,
        letterSpacing: 0.5
      },
      gridLabel: {
        fontSize: 8,
        bold: true,
        color: C.grey,
        margin: [0, 0, 0, 2]
      },
      gridValue: {
        fontSize: 10.5,
        bold: true,
        color: C.brand
      },
      gridCell: {
        margin: [2, 2, 2, 2]
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  pdfMake.createPdf(docDefinition).download(filename);
}