// src/utils/generateReportPDF.js
// Generates the VetRx Scan report entirely client-side using pdfmake.
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfmake fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

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

// ── Helper Components ─────────────────────────────────────────────────

function sectionHeader(title) {
  return {
    stack: [
      { text: title.toUpperCase(), style: 'sectionTitle' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: C.gold, strokeOpacity: 0.55 }], margin: [0, 4, 0, 10] }
    ],
    unbreakable: true
  };
}

function progressBar(label, value, color) {
  const w = 515;
  const fillW = Math.max(4, w * Math.min(value, 100) / 100);
  return {
    stack: [
      {
        columns: [
          { text: label, fontSize: 12, color: C.brand },
          { text: `${value}/100`, fontSize: 12, color: color, bold: true, alignment: 'right' }
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

function coloredBox(title, itemsOrText, bgColor, borderColor, titleColor, textColor) {
  let bodyContent;
  
  if (Array.isArray(itemsOrText)) {
    bodyContent = {
      stack: itemsOrText.map(item => ({
        text: `•  ${item}`,
        color: textColor,
        fontSize: 12,
        margin: [0, 4, 0, 0],
        unbreakable: true
      }))
    };
  } else {
    bodyContent = itemsOrText;
  }

  return {
    table: {
      widths: ['*'],
      body: [
        [
          {
            stack: [
              { text: title.toUpperCase(), color: titleColor, bold: true, fontSize: 8.5 },
              bodyContent
            ]
          }
        ]
      ]
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

// ── Main PDF Generation API ───────────────────────────────────────────

export async function generateReportPDF(report, dogProfile, ownerName, scanDate) {
  const r   = report || {};
  const dog = dogProfile || {};

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

  const content = [];

  // 1. Header Banner (Explicit margins applied to inner content to respect 40pt document walls)
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
                { text: 'VetRx Scan', color: C.light, fontSize: 20, bold: true },
                { text: 'AI Dog Health Diagnosis Report', color: C.gold, fontSize: 10, margin: [0, 4, 0, 2] },
                { text: dateStr, color: C.gold, fontSize: 10 }
              ],
              margin: [40, 30, 0, 20] // [Left, Top, Right, Bottom]
            },
            {
              stack: [
                {
                  text: [
                    { text: String(r.healthScore ?? '--'), fontSize: 38, color: sc, bold: true },
                    { text: '/100', fontSize: 10, color: C.gold }
                  ]
                }
              ],
              alignment: 'right',
              margin: [0, 34, 40, 20] // [Left, Top, Right, Bottom]
            }
          ]
        }
      ]]
    },
    layout: 'noBorders'
  });

  // 2. Dog Meta
  content.push({
    columns: [
      { text: dog.name || 'Dog', fontSize: 17, bold: true, color: C.brand },
      ownerName ? { text: `Owner: ${ownerName}`, fontSize: 11, color: C.gray, alignment: 'right', margin: [0, 4, 0, 0] } : null
    ].filter(Boolean),
    margin: [0, 0, 0, 4]
  });

  if (dogMeta) {
    content.push({ text: dogMeta, fontSize: 11, color: C.gray, margin: [0, 0, 0, 20] });
  }

  // 3. Diagnosis Card
  if (r.diagnosis) {
    const pillColumns = [];
    
    if (r.severity) {
      let sevText = r.severity.split(/[-:(]/)[0].trim().toUpperCase();
      if (sevText.length > 25) sevText = sevText.substring(0, 22) + '...';
      pillColumns.push({
        width: 'auto',
        table: { widths: ['auto'], body: [[{ text: sevText, color: C.white, bold: true, fontSize: 9 }]] },
        layout: { fillColor: sevFill, defaultBorder: false, paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4 },
        margin: [0, 0, 8, 0]
      });
    }

    if (r.urgency) {
      let urgText = r.urgency.split(/[-:(]/)[0].trim().toUpperCase();
      if (urgText.length > 25) urgText = urgText.substring(0, 22) + '...';
      pillColumns.push({
        width: 'auto',
        table: { widths: ['auto'], body: [[{ text: urgText, color: C.white, bold: true, fontSize: 9 }]] },
        layout: { fillColor: urgFill, defaultBorder: false, paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4 },
        margin: [0, 0, 8, 0]
      });
    }

    if (r.confidence != null) {
      pillColumns.push({
        width: '*',
        text: `${r.confidence}% ${r.confidenceLabel || ''} Confidence`,
        color: C.gray, fontSize: 10, alignment: 'right', margin: [0, 4, 0, 0]
      });
    }

    content.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: String(r.diagnosis), fontSize: 14, bold: true, color: C.brand, margin: [0, 0, 0, 10] },
                pillColumns.length ? { columns: pillColumns } : null
              ].filter(Boolean)
            }
          ]
        ]
      },
      layout: {
        fillColor: C.bgLight,
        hLineWidth: () => 1, vLineWidth: () => 1,
        hLineColor: () => C.borderLight, vLineColor: () => C.borderLight,
        paddingLeft: () => 14, paddingRight: () => 14, paddingTop: () => 14, paddingBottom: () => 14
      },
      margin: [0, 0, 0, 20],
      unbreakable: true
    });
  }

  // 4. Health Score
  content.push(sectionHeader('Health Score'));
  content.push(progressBar('Current Health', r.healthScore ?? 0, sc));
  content.push({ ...progressBar(`After ${r.daysToImprove || 10}-day treatment`, r.healthTarget ?? 85, C.green), margin: [0, 0, 0, 20] });

  // 5. AI Findings
  if (r.imageFindings || r.summary) {
    content.push(sectionHeader('AI Findings'));
    if (r.imageFindings) {
      content.push({ text: r.imageFindings, italics: true, color: C.gray, fontSize: 12, margin: [0, 0, 0, 6], unbreakable: true });
    }
    if (r.summary) {
      content.push({ text: r.summary, color: C.brand, fontSize: 12, margin: [0, 0, 0, 14], unbreakable: true });
    }
  }

  // 6. Treatment Steps
  if (steps.length) {
    content.push(sectionHeader('Treatment Steps'));
    
    const stepsStack = steps.map((stepText, idx) => ({
      columns: [
        { text: `${idx + 1}.`, width: 18, fontSize: 12, color: C.brand, bold: true },
        { text: stepText, width: '*', fontSize: 12, color: '#2A1E00' }
      ],
      margin: [0, 0, 0, 8],
      unbreakable: true
    }));

    content.push({
      stack: stepsStack,
      margin: [0, 0, 0, 20]
    });
  }

  // 7. Natural Remedies
  if (natural.length) {
    content.push(coloredBox('NATURAL REMEDIES', natural, C.bgGreen, C.borderGreen, C.green, '#1A4A1A'));
  }

  // 8. Diet Recommendation
  if (dietText) {
    const dietStack = [ { text: dietText, color: '#5C3800', fontSize: 12, margin: [0, 4, 0, 0] } ];
    if (r.currentDietAssessment) {
      dietStack.push({ text: `Current: ${r.currentDietAssessment}`, italics: true, color: C.gray, fontSize: 11, margin: [0, 6, 0, 0] });
    }
    content.push(coloredBox('DIET RECOMMENDATION', { stack: dietStack, unbreakable: true }, C.bgAmber, C.borderAmber, '#7A4A00', '#5C3800'));
  }

  // 9. Red Flags
  if (redFlags.length) {
    const redFlagElements = redFlags.map(f => ({ text: `[!]  ${f}`, margin: [0, 4, 0, 0], color: '#7A1A1A', fontSize: 12, unbreakable: true }));
    content.push(coloredBox('SEE VET IF YOU NOTICE', { stack: redFlagElements }, C.bgRed, C.borderRed, C.red, '#7A1A1A'));
  }

  // 10. Dog Profile Grid
  if (profileRows.length) {
    content.push({ text: '', margin: [0, 10, 0, 0] }); // spacer
    content.push(sectionHeader('Dog Profile'));

    const gridBody = [];
    for (let i = 0; i < profileRows.length; i += 2) {
      const col1 = profileRows[i];
      const col2 = profileRows[i + 1] || ['', ''];
      
      gridBody.push([
        { stack: [ { text: col1[0].toUpperCase(), style: 'gridLabel' }, { text: col1[1], style: 'gridValue' } ], margin: [0, 0, 0, 10] },
        { stack: [ { text: col2[0] ? col2[0].toUpperCase() : '', style: 'gridLabel' }, { text: col2[1] || '', style: 'gridValue' } ], margin: [0, 0, 0, 10] }
      ]);
    }

    content.push({
      table: { widths: ['*', '*'], body: gridBody },
      layout: 'noBorders',
      unbreakable: true
    });
  }

  // ── Document Definition ─────────────────────────────────────────────
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60], // Left, Top, Right, Bottom
    content: content,
    footer: function(currentPage, pageCount) {
      return {
        margin: [40, 10, 40, 0],
        stack: [
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: C.brand, strokeOpacity: 0.12 }], margin: [0, 0, 0, 8] },
          {
            columns: [
              { text: 'VetRx Scan is an AI assistance tool. Consult a licensed veterinarian for medical decisions.', color: C.gray, fontSize: 7.5 },
              { text: `Page ${currentPage} of ${pageCount}  |  doglicious.in`, color: C.gray, fontSize: 7.5, alignment: 'right' }
            ]
          }
        ]
      };
    },
    styles: {
      sectionTitle: {
        fontSize: 8.5,
        bold: true,
        color: C.gray
      },
      gridLabel: {
        fontSize: 8,
        bold: true,
        color: C.gray,
        margin: [0, 0, 0, 2]
      },
      gridValue: {
        fontSize: 12,
        color: C.brand
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  const dogName  = (dog.name || 'dog').replace(/\s+/g, '-');
  const dateSlug = new Date().toISOString().slice(0, 10);
  const filename = `VetRx-${dogName}-${dateSlug}.pdf`;

  pdfMake.createPdf(docDefinition).download(filename);
}