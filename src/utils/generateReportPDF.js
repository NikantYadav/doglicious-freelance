// src/utils/generateReportPDF.js
// Sends report data to the server, which renders HTML with Puppeteer
// and returns a properly paginated PDF (CSS break-inside: avoid handles page breaks).

const API = import.meta.env.VITE_API_URL ?? '';

export async function generateReportPDF(report, dogProfile, ownerName, scanDate) {
    const res = await fetch(`${API}/api/vetrx/report-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, dogProfile, ownerName, scanDate }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'PDF generation failed');
    }

    // Extract filename from Content-Disposition if present, otherwise build one
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match ? match[1] : `VetRx-${(dogProfile?.name || 'dog').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
