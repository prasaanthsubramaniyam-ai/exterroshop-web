/**
 * Client-side export utilities — XL (CSV/Excel), PDF (print), DOC (Word-compatible HTML).
 * No extra npm packages needed.
 */

// ── Download helper ────────────────────────────────────────────────────────────

function download(content: string | Blob, filename: string, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Excel / CSV ────────────────────────────────────────────────────────────────

/**
 * Export rows as a .xlsx-named CSV (Excel opens these natively).
 * Prepends UTF-8 BOM so Excel renders special characters correctly.
 */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const escape = (v: string | number | null | undefined) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const csv = "﻿" + [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");

  download(csv, `${filename}.xlsx`, "text/csv;charset=utf-8;");
}

// ── PDF ────────────────────────────────────────────────────────────────────────

/**
 * Open a clean print window containing the given HTML table, then trigger print.
 */
export function exportToPDF(title: string, tableHtml: string) {
  const win = window.open("", "_blank", "width=900,height=600");
  if (!win) { alert("Allow pop-ups to export PDF"); return; }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; color: #111; }
    h2 { font-size: 16px; margin-bottom: 4px; }
    p.sub { font-size: 10px; color: #666; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: middle; }
    th { background: #f4f4f4; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
    tr:nth-child(even) td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .PENDING    { background:#fef3c7; color:#92400e; }
    .APPROVED   { background:#d1fae5; color:#065f46; }
    .REJECTED   { background:#fee2e2; color:#991b1b; }
    .WAITLISTED { background:#ede9fe; color:#4c1d95; }
    .PARTICIPANT { background:#dbeafe; color:#1e40af; }
    .VOLUNTEER  { background:#ccfbf1; color:#065f46; }
    @media print {
      body { padding: 10px; }
    }
  </style>
</head>
<body>
  <h2>${title}</h2>
  <p class="sub">Exported on ${new Date().toLocaleString("en-IN")}</p>
  ${tableHtml}
  <script>
    window.addEventListener("load", function() {
      setTimeout(function() { window.print(); }, 300);
    });
  </script>
</body>
</html>`);
  win.document.close();
}

// ── DOC (Word-compatible HTML) ─────────────────────────────────────────────────

/**
 * Export as a .doc file (Word-compatible HTML blob).
 * Microsoft Word and LibreOffice can open this natively.
 */
export function exportToDoc(title: string, tableHtml: string) {
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
  <![endif]-->
  <style>
    body  { font-family: Arial, sans-serif; font-size: 11pt; color: #111; margin: 2cm; }
    h2    { font-size: 16pt; margin-bottom: 4pt; }
    p.sub { font-size: 9pt; color: #666; margin-bottom: 14pt; }
    table { width: 100%; border-collapse: collapse; }
    th, td{ border: 1px solid #ccc; padding: 5pt 8pt; vertical-align: middle; font-size: 10pt; }
    th    { background: #f4f4f4; font-weight: bold; }
    tr:nth-child(even) td { background: #fafafa; }
  </style>
</head>
<body>
  <h2>${title}</h2>
  <p class="sub">Exported on ${new Date().toLocaleString("en-IN")}</p>
  ${tableHtml}
</body>
</html>`;

  download(html, `${title.replace(/\s+/g, "_")}.doc`, "application/msword;charset=utf-8;");
}
