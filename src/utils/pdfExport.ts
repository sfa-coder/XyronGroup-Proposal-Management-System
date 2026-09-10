import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { Invoice, PaymentReceipt, CompanyProfile, ProposalDocument } from "../types";
import { formatCurrency } from "./storage";
import { sanitizeFilename, escapeHtml } from "./sanitize";

/**
 * Generates an isolated, printable window styled with Tailwind CSS for guaranteed clean printing / "Save as PDF".
 * Removes browser default headers/footers (@page margin: 0) and includes page count on bottom right.
 */
export const printCleanDocument = (title: string, contentHtml: string) => {
  const safeTitle = escapeHtml(title || "Document");
  const printWin = window.open("", "_blank", "width=900,height=1050,scrollbars=yes");
  if (printWin) {
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeTitle}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm; /* Professional compact print margins */
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #0f172a !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              .doc-wrapper {
                padding: 0 !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
                box-shadow: none !important;
                border-radius: 0 !important;
              }
              .avoid-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              h1, h2, h3, h4, h5, h6, .section-header {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #f8fafc;
              padding: 1.5rem;
              color: #1e293b;
            }
            .doc-wrapper {
              max-width: 840px;
              margin: 0 auto;
              background: #ffffff;
              padding: 1.75rem 2rem;
              border-radius: 0.75rem;
              box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
              box-sizing: border-box;
            }
            .avoid-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            h1, h2, h3, h4, h5, h6, .section-header {
              page-break-after: avoid;
              break-after: avoid;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="max-width: 840px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 12px 18px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <span style="font-size: 13px; font-weight: bold; color: #475569;">Document Print / PDF Export</span>
            <button onclick="window.print()" style="background:#4F46E5; color:white; font-weight:bold; padding:8px 20px; border-radius:8px; border:none; cursor:pointer; font-size:13px; box-shadow: 0 4px 6px -1px rgba(79,70,229,0.2);">
              🖨️ Print / Save as PDF
            </button>
          </div>
          <div class="doc-wrapper">
            ${contentHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
    return true;
  } else {
    window.print();
    return false;
  }
};

/**
 * Converts a DOM element into a true A4 PDF Blob using html2canvas and jsPDF.
 */
export const generatePdfBlobFromElement = async (
  element: HTMLElement,
  _filename?: string
): Promise<Blob> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: 840,
    ignoreElements: (el) =>
      el.classList?.contains("no-print") ||
      el.classList?.contains("print:hidden") ||
      el.getAttribute("data-html2canvas-ignore") === "true",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = 210;
  const pdfPageHeight = 297;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
  heightLeft -= pdfPageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfPageHeight;
  }

  return pdf.output("blob");
};

/**
 * Generates a true PDF Blob from raw HTML content.
 */
export const generatePdfBlobFromHtml = async (
  contentHtml: string,
  _filename?: string
): Promise<Blob> => {
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "0";
  tempContainer.style.width = "820px";
  tempContainer.style.background = "#ffffff";
  tempContainer.style.padding = "24px";
  tempContainer.style.boxSizing = "border-box";
  tempContainer.className = "text-slate-900";
  tempContainer.innerHTML = `
    <div style="font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #1e293b;">
      ${contentHtml}
    </div>
  `;

  document.body.appendChild(tempContainer);
  // Allow layout and images to settle
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const blob = await generatePdfBlobFromElement(tempContainer);
    return blob;
  } finally {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
};

/**
 * Triggers direct download of a PDF Blob to the user's filesystem.
 */
export const downloadPdfBlob = (blob: Blob, filename: string) => {
  const baseName = filename.endsWith(".pdf") ? filename.slice(0, -4) : filename;
  const safeBase = sanitizeFilename(baseName, "document");
  const cleanName = `${safeBase}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/**
 * Shares or sends a document with its attached PDF file:
 * 1. Checks for native Web Share API with file attachment (supported on mobile & modern browsers for WhatsApp, Mail, Telegram).
 * 2. Automatically downloads the PDF file so the user has the physical attachment ready.
 * 3. Opens the requested channel (WhatsApp / Email / Webmail) with the formatted text.
 */
export const shareDocumentWithPdf = async (options: {
  pdfBlob: Blob;
  filename: string;
  title: string;
  text: string;
  channel: "whatsapp" | "email" | "native" | "download_only";
  phone?: string;
  email?: string;
  subject?: string;
  showToast?: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}): Promise<{ sharedViaNative: boolean; downloaded: boolean }> => {
  const {
    pdfBlob,
    filename,
    title,
    text,
    channel,
    phone,
    email,
    subject,
    showToast,
  } = options;

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  const pdfFile = new File([pdfBlob], cleanFilename, { type: "application/pdf" });

  // 1. Try Native Web Share API with File if supported and requested or mobile
  const canShareFile =
    typeof navigator !== "undefined" &&
    !!navigator.canShare &&
    navigator.canShare({ files: [pdfFile] });

  if (channel === "native" || (canShareFile && channel === "whatsapp" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))) {
    try {
      await navigator.share({
        title,
        text,
        files: [pdfFile],
      });
      showToast?.(
        "Shared with Attached PDF",
        `Sent ${cleanFilename} and message via your chosen app.`,
        "success"
      );
      return { sharedViaNative: true, downloaded: false };
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Native share failed, falling back to download & channel open:", err);
      }
    }
  }

  // 2. Fallback / Standard Channel: Always download PDF to device
  downloadPdfBlob(pdfBlob, cleanFilename);

  if (channel === "whatsapp") {
    const cleanedPhone = (phone || "").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(text);
    const url = cleanedPhone
      ? `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank");

    showToast?.(
      "WhatsApp Opened & PDF Downloaded",
      `1. Document "${cleanFilename}" is downloaded to your files.\n2. In WhatsApp, click (+) > Document to send it with your message!`,
      "success"
    );
  } else if (channel === "email") {
    const to = email || "";
    const mailSubject = encodeURIComponent(subject || title);
    const mailBody = encodeURIComponent(
      `${text}\n\n[Attached: ${cleanFilename}]`
    );
    window.open(`mailto:${to}?subject=${mailSubject}&body=${mailBody}`, "_blank");

    showToast?.(
      "Email Draft Opened & PDF Downloaded",
      `"${cleanFilename}" has been saved to your downloads. Attach it in your email draft.`,
      "success"
    );
  } else if (channel === "download_only") {
    showToast?.(
      "PDF Document Downloaded",
      `"${cleanFilename}" saved successfully to your device.`,
      "success"
    );
  }

  return { sharedViaNative: false, downloaded: true };
};

/**
 * Directly downloads the styled HTML/PDF printable file to the user's computer.
 */
export const downloadDocumentFile = (filename: string, title: string, contentHtml: string) => {
  const fullHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page {
        size: A4 portrait;
        margin: 0mm; /* Suppress browser headers and footers */
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        .doc-wrapper {
          padding: 12mm 14mm 12mm 14mm !important;
          max-width: 100% !important;
          margin: 0 auto !important;
        }
        .avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #ffffff;
        padding: 2.5rem;
        color: #1e293b;
        max-width: 860px;
        margin: 0 auto;
      }
      .avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    </style>
  </head>
  <body>
    <div class="no-print" style="margin-bottom: 24px; text-align: right; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
      <button onclick="window.print()" style="background:#4F46E5; color:white; font-weight:bold; padding:8px 20px; border-radius:8px; border:none; cursor:pointer; font-size:13px;">
        🖨️ Print / Save to PDF
      </button>
    </div>
    <div class="doc-wrapper">
      ${contentHtml}
    </div>
  </body>
</html>`;

  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper to clean unwanted markdown hashtags (###, ##) and [SERVICE] brackets from PDF and print rendering
 */
export const sanitizePdfText = (text?: string): string => {
  if (!text) return "";
  return text
    .replace(/\[service\s*\d*\]/gi, "Website sitemap")
    .replace(/\[service\]/gi, "Website sitemap")
    .replace(/^#+\s*/gm, "")
    .replace(/SERVICE \d+\s*—\s*/gi, "")
    .replace(/\(SERVICE \d+\)/gi, "")
    .replace(/\[\s*SERVICE.*?\]/gi, "Website sitemap");
};

/**
 * Builds HTML for Invoice Document
 */
export const buildInvoiceHtml = (
  invoice: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: string;
    percentage: number;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    grandTotal: number;
    milestoneTitle?: string;
    notes?: string;
    paymentTerms?: string;
    bankDetails?: string;
  },
  doc: ProposalDocument,
  company: CompanyProfile
): string => {
  const currency = company.currency || "$";

  return `
    <div class="bg-white text-slate-900 space-y-4 font-sans text-xs">
      <!-- Header Letterhead -->
      <div class="flex justify-between items-start border-b border-slate-200 pb-3.5">
        <div class="space-y-1.5 max-w-sm">
          ${
            company.logoUrl
              ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 44px; max-width: 160px; object-fit: contain; margin-bottom: 4px;" />`
              : `<h1 class="text-xl font-black tracking-tight text-indigo-900">${company.name}</h1>`
          }
          <div class="text-[11px] text-slate-600 space-y-0.5 font-medium leading-normal">
            <p class="font-bold text-slate-900 text-xs">${company.name}</p>
            <p>${company.address || ""}</p>
            <p>Email: ${company.email || ""} ${company.phone ? `| Tel: ${company.phone}` : ""}</p>
            ${company.website ? `<p>Web: ${company.website}</p>` : ""}
            ${company.taxId ? `<p class="font-mono text-slate-500">Tax ID / VAT: ${company.taxId}</p>` : ""}
          </div>
        </div>
        <div class="text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span class="inline-block px-2.5 py-0.5 rounded bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider mb-1.5">
            COMMERCIAL INVOICE
          </span>
          <h2 class="text-base font-mono font-bold text-slate-900">${invoice.invoiceNumber}</h2>
          <div class="text-[11px] text-slate-600 space-y-1 mt-1.5">
            <p><span class="font-bold text-slate-800">Issue Date:</span> ${invoice.issueDate}</p>
            <p><span class="font-bold text-slate-800">Due Date:</span> ${invoice.dueDate}</p>
            <p><span class="font-bold text-slate-800">Status:</span> <span class="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase text-[10px]">${invoice.status}</span></p>
          </div>
        </div>
      </div>

      <!-- Bill To & Project Info -->
      <div class="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span class="font-black text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
            BILLED TO (CLIENT)
          </span>
          <p class="font-black text-slate-900 text-sm">${doc.clientName}</p>
          ${doc.clientCompany ? `<p class="font-bold text-indigo-900 text-xs">${doc.clientCompany}</p>` : ""}
          <p class="text-slate-600 mt-0.5 leading-normal text-[11px] whitespace-pre-line">${doc.clientAddress ? doc.clientAddress.split("\n").map((l) => sanitizePdfText(l)).join("<br/>") : ""}</p>
          <p class="text-slate-600 text-[11px]">${doc.clientEmail || ""}</p>
          ${doc.clientTaxId ? `<p class="text-slate-500 font-mono text-[11px]">Tax ID / VAT: ${doc.clientTaxId}</p>` : ""}
        </div>
        <div>
          <span class="font-black text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
            PROPOSAL & PROJECT REFERENCE
          </span>
          <p class="font-black text-slate-900 text-sm leading-snug">${sanitizePdfText(doc.title)}</p>
          <p class="text-slate-600 text-[11px] mt-1">Proposal Reference: <span class="font-mono font-bold text-slate-900">${doc.docNumber}</span></p>
          <p class="text-slate-600 text-[11px]">Total Project Value: <span class="font-mono font-bold text-slate-900">${formatCurrency(doc.grandTotal, currency)}</span></p>
          <p class="text-[10px] text-slate-500 mt-0.5">Commercial billing corresponding to approved milestone schedule.</p>
        </div>
      </div>

      <!-- Milestone Purpose Banner -->
      <div class="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs">
        <span class="font-black text-indigo-950 block text-xs mb-0.5">Milestone: ${sanitizePdfText(invoice.milestoneTitle) || `${invoice.percentage}% Payment Milestone`}</span>
        <span class="text-indigo-900 text-[11px] leading-normal">${sanitizePdfText(invoice.notes) || `Official commercial invoice for proposal ${doc.docNumber}`}</span>
      </div>

      <!-- Itemized Table Section -->
      <div class="space-y-2 pt-1">
        <div class="border-b border-slate-200 pb-1.5 section-header">
          <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
            Commercial Milestone Line Items
          </h3>
        </div>
        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
              <tr>
                <th class="py-2 px-3">Item & Scope Description</th>
                <th class="py-2 px-2.5 text-center">Milestone Share</th>
                <th class="py-2 px-3 text-right">Amount (${currency})</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr class="bg-white">
                <td class="py-2.5 px-3 font-medium text-slate-900">
                  <span class="font-bold text-slate-900 block text-xs">${sanitizePdfText(doc.title)}</span>
                  <span class="text-slate-600 text-[11px] block">${sanitizePdfText(invoice.milestoneTitle) || "Contract Milestone Billing"}</span>
                </td>
                <td class="py-2.5 px-2.5 text-center font-mono font-bold text-indigo-700 text-xs">${invoice.percentage}%</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                  ${formatCurrency(invoice.subtotal, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Calculations Breakdown Box -->
      <div class="flex justify-end pt-1 avoid-break">
        <div class="w-full sm:w-72 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-xs">
          <div class="flex justify-between items-center text-slate-600 text-[11px]">
            <span class="font-medium">Milestone Subtotal:</span>
            <span class="font-mono font-semibold">${formatCurrency(invoice.subtotal, currency)}</span>
          </div>
          <div class="flex justify-between items-center text-slate-600 text-[11px]">
            <span class="font-medium">Tax / VAT (${invoice.taxRate}%):</span>
            <span class="font-mono font-semibold">+${formatCurrency(invoice.taxAmount, currency)}</span>
          </div>
          <div class="border-t border-slate-300 pt-2 flex justify-between items-center font-black text-xs text-slate-900">
            <span>Invoice Grand Total:</span>
            <span class="font-mono text-sm text-indigo-700">${formatCurrency(invoice.grandTotal, currency)}</span>
          </div>
        </div>
      </div>

      <!-- Bank Instructions & Payment Terms -->
      <div class="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 mt-1 text-xs text-slate-600">
        <div class="avoid-break">
          <div class="border-b border-slate-200 pb-1 mb-1.5 section-header">
            <span class="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
              Terms of Payment
            </span>
          </div>
          <p class="leading-normal whitespace-pre-wrap text-slate-700 text-[11px]">${invoice.paymentTerms || company.paymentTerms || "Net 14 days"}</p>
        </div>
        <div class="avoid-break">
          <div class="border-b border-slate-200 pb-1 mb-1.5 section-header">
            <span class="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
              Wire / Bank Transfer Details
            </span>
          </div>
          <p class="font-mono text-[10px] leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
            ${invoice.bankDetails || company.bankDetails || "Bank transfer details available upon request."}
          </p>
        </div>
      </div>

      <!-- Authorization Signatures -->
      <div class="pt-3 mt-1 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-500 avoid-break">
        <div>
          <div class="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1 font-serif italic text-slate-800 text-xs">
            ${
              doc.providerSignatureUrl || company.signatureImageUrl
                ? `<img src="${doc.providerSignatureUrl || company.signatureImageUrl}" alt="Signature" class="max-h-8 max-w-[140px] object-contain" />`
                : sanitizePdfText(doc.providerSignatoryName || company.signatoryName || `${company.name || "XyronGroup"} Authorized Signatory`)
            }
          </div>
          <p class="font-bold text-slate-800 text-[11px]">${sanitizePdfText(doc.providerSignatoryTitle || company.signatoryTitle || "Service Provider Representative")}</p>
          <p class="text-slate-500 text-[10px]">${sanitizePdfText(doc.providerSignatorySubtitle || company.signatorySubtitle || company.name || "XyronGroup")}</p>
        </div>
        <div>
          <div class="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1 font-serif italic text-slate-800 text-xs">
            ${sanitizePdfText(doc.clientName)}
          </div>
          <p class="font-bold text-slate-800 text-[11px]">Client Acceptance & Billing Contact</p>
          <p class="text-slate-500 text-[10px]">${sanitizePdfText(doc.clientCompany || doc.clientName)}</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Builds HTML for Payment Receipt Document
 */
export const buildReceiptHtml = (
  receipt: {
    receiptNumber: string;
    paymentDate: string;
    paymentMethod: string;
    transactionReference: string;
    amountPaid: number;
    receivedBy?: string;
    notes?: string;
    status: string;
  },
  doc: ProposalDocument,
  company: CompanyProfile,
  invoice?: Invoice | null,
  priorTotalPaid: number = 0
): string => {
  const currency = company.currency || "$";
  const totalPaidWithThis = priorTotalPaid + receipt.amountPaid;
  const remainingBalance = Math.max(0, doc.grandTotal - totalPaidWithThis);

  return `
    <div class="bg-white text-slate-900 space-y-4 font-sans text-xs">
      <!-- Header Letterhead -->
      <div class="flex justify-between items-start border-b border-slate-200 pb-3.5">
        <div class="space-y-1.5 max-w-sm">
          ${
            company.logoUrl
              ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 44px; max-width: 160px; object-fit: contain; margin-bottom: 4px;" />`
              : `<h1 class="text-xl font-black tracking-tight text-slate-900">${company.name}</h1>`
          }
          <div class="text-[11px] text-slate-600 space-y-0.5 font-medium leading-normal">
            <p class="font-bold text-slate-900 text-xs">${company.name}</p>
            <p>${company.address || ""}</p>
            <p>Email: ${company.email || ""} ${company.phone ? `| Tel: ${company.phone}` : ""}</p>
            ${company.taxId ? `<p class="font-mono text-slate-500">Tax ID / VAT: ${company.taxId}</p>` : ""}
          </div>
        </div>
        <div class="text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span class="inline-block px-2.5 py-0.5 rounded bg-amber-600 text-white font-black text-[9px] uppercase tracking-wider mb-1.5">
            OFFICIAL PAYMENT RECEIPT
          </span>
          <h2 class="text-base font-mono font-bold text-slate-900">${receipt.receiptNumber}</h2>
          <div class="text-[11px] text-slate-600 space-y-1 mt-1.5">
            <p><span class="font-bold text-slate-800">Date Paid:</span> ${receipt.paymentDate}</p>
            <p><span class="font-bold text-slate-800">Payment Status:</span> <span class="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase text-[10px]">SETTLED & VERIFIED</span></p>
          </div>
        </div>
      </div>

      <!-- Received From & Payment Method -->
      <div class="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span class="font-black text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
            PAYMENT RECEIVED FROM:
          </span>
          <p class="font-black text-slate-900 text-sm">${doc.clientName}</p>
          ${doc.clientCompany ? `<p class="font-bold text-indigo-900 text-xs">${doc.clientCompany}</p>` : ""}
          <p class="text-slate-600 text-[11px] mt-0.5 leading-normal whitespace-pre-line">${doc.clientAddress ? doc.clientAddress.split("\n").map((l) => sanitizePdfText(l)).join("<br/>") : ""}</p>
          <p class="text-slate-600 text-[11px]">${doc.clientEmail || ""}</p>
        </div>
        <div class="space-y-1.5">
          <div>
            <span class="font-black text-slate-400 uppercase tracking-wider text-[9px] block mb-1">
              PAYMENT METHOD & TRANSACTION ID
            </span>
            <p class="font-black text-slate-900 text-sm">${receipt.paymentMethod}</p>
            <p class="font-mono text-slate-700 text-[11px] mt-0.5">Ref / TXN ID: <span class="font-bold text-slate-900">${receipt.transactionReference || "N/A"}</span></p>
            ${invoice ? `<p class="text-indigo-700 font-bold text-[11px] mt-0.5">Settles Invoice: ${invoice.invoiceNumber} (${invoice.milestoneTitle || "Milestone"})</p>` : ""}
          </div>
        </div>
      </div>

      <!-- Itemized Acknowledgment Table -->
      <div class="space-y-2 pt-1">
        <div class="border-b border-slate-200 pb-1.5 section-header">
          <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
            Payment Settlement Scope
          </h3>
        </div>
        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
              <tr>
                <th class="py-2 px-3">Payment Acknowledgment Purpose</th>
                <th class="py-2 px-3 text-right">Amount Received (${currency})</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr class="bg-white">
                <td class="py-2.5 px-3 font-medium text-slate-900">
                  <span class="font-bold text-slate-900 block text-xs">${sanitizePdfText(doc.title)} (${doc.docNumber})</span>
                  <span class="text-slate-600 text-[11px] block">${sanitizePdfText(receipt.notes) || "Official payment acknowledgment receipt."}</span>
                </td>
                <td class="py-2.5 px-3 text-right font-mono font-black text-emerald-600 text-sm">
                  ${formatCurrency(receipt.amountPaid, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Financial Balance Status Card -->
      <div class="p-3.5 rounded-xl bg-slate-900 text-white flex justify-between items-center text-xs border border-slate-800 shadow-xs avoid-break">
        <div>
          <span class="text-[9px] text-slate-400 uppercase tracking-wider block">Contract Balance Status</span>
          <span class="font-bold text-slate-200 text-xs">
            ${remainingBalance === 0 ? "Account Fully Settled (0.00)" : `Remaining Balance: ${formatCurrency(remainingBalance, currency)}`}
          </span>
          <p class="text-slate-400 text-[10px] mt-0.5">Total Project Value: ${formatCurrency(doc.grandTotal, currency)}</p>
        </div>
        <div class="text-right">
          <span class="text-[9px] text-amber-400 uppercase tracking-wider block">Total Amount Received</span>
          <span class="text-base font-black text-amber-400">
            ${formatCurrency(receipt.amountPaid, currency)}
          </span>
        </div>
      </div>

      <!-- Official Verification Seal & Signatures -->
      <div class="flex items-end justify-between pt-3 mt-1 border-t border-slate-200 text-xs text-slate-500 avoid-break">
        <div>
          <div class="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center text-center p-1.5 bg-emerald-50/70 shadow-xs rotate-[-6deg] select-none">
            <span class="text-[8px] font-extrabold uppercase tracking-widest text-emerald-800 leading-none">OFFICIAL</span>
            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-950 leading-tight my-0.5">PAYMENT</span>
            <span class="text-[7px] font-extrabold uppercase tracking-wider text-emerald-700 leading-none">VERIFIED</span>
          </div>
          <p class="text-[10px] text-slate-600 mt-1.5 font-medium">Received By: ${receipt.receivedBy || `${company.name} Accounts`}</p>
        </div>
        <div class="text-right">
          <div class="w-48 border-b border-slate-300 pb-1 text-slate-800 font-serif italic text-xs min-h-8 flex items-end justify-end">
            ${
              company.signatureImageUrl
                ? `<img src="${company.signatureImageUrl}" alt="Signature" class="max-h-8 max-w-[140px] object-contain" />`
                : sanitizePdfText(company.signatoryName || `${company.name} Authorized Signatory`)
            }
          </div>
          <span class="text-[9px] text-slate-700 font-bold uppercase tracking-wider block mt-1">
            ${sanitizePdfText(company.signatoryTitle || "Authorized Cashier / Finance Officer")}
          </span>
          <span class="text-[9px] text-slate-500 block">
            ${sanitizePdfText(company.signatorySubtitle || company.name)}
          </span>
        </div>
      </div>
    </div>
  `;
};

/**
 * Builds HTML for Proposal & Quotation Document
 */
export const buildProposalHtml = (
  doc: ProposalDocument,
  company: CompanyProfile
): string => {
  const currency = company.currency || "$";

  return `
    <div class="bg-white text-slate-900 space-y-3.5 font-sans text-xs">
      <!-- Header Letterhead -->
      <div class="flex justify-between items-start border-b border-slate-200 pb-3">
        <div class="space-y-1 max-w-sm">
          ${
            company.logoUrl
              ? `<img src="${company.logoUrl}" alt="${company.name}" style="max-height: 44px; max-width: 160px; object-fit: contain; margin-bottom: 2px;" />`
              : `<h1 class="text-xl font-black tracking-tight text-slate-900">${company.name || "XyronGroup"}</h1>`
          }
          <div class="text-[11px] text-slate-600 space-y-0.5 font-medium leading-normal">
            <p class="font-bold text-slate-900 text-xs">${company.name || "XyronGroup"}</p>
            <p>${company.address || ""}</p>
            <p>Email: ${company.email || ""} ${company.phone ? `| Tel: ${company.phone}` : ""}</p>
            ${company.website ? `<p>Web: ${company.website}</p>` : ""}
            ${company.taxId ? `<p class="font-mono text-slate-500">Tax ID / VAT: ${company.taxId}</p>` : ""}
          </div>
        </div>
        <div class="text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span class="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider mb-1">
            PROJECT PROPOSAL & QUOTATION
          </span>
          <h2 class="text-base font-mono font-bold text-slate-900">${doc.docNumber}</h2>
          <div class="text-[11px] text-slate-600 space-y-0.5 mt-1">
            <p><span class="font-bold text-slate-800">Issue Date:</span> ${doc.issueDate}</p>
            <p><span class="font-bold text-slate-800">Valid Until:</span> ${doc.expiryDate}</p>
            <p><span class="font-bold text-slate-800">Status:</span> <span class="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase text-[10px]">${doc.status}</span></p>
          </div>
        </div>
      </div>

      <!-- Prepared For (Client) & Project Reference -->
      <div class="grid grid-cols-2 gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div>
          <span class="font-black text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">
            PREPARED FOR (CLIENT)
          </span>
          <p class="font-black text-slate-900 text-sm">${doc.clientName}</p>
          ${doc.clientCompany ? `<p class="font-bold text-indigo-900 text-xs">${doc.clientCompany}</p>` : ""}
          <p class="text-slate-600 text-[11px] mt-0.5 leading-normal whitespace-pre-line">${doc.clientAddress ? doc.clientAddress.split("\n").map((l) => sanitizePdfText(l)).join("<br/>") : ""}</p>
          <p class="text-slate-600 text-[11px]">${doc.clientEmail || ""}</p>
          ${doc.clientTaxId ? `<p class="text-slate-500 font-mono text-[11px]">Tax ID / VAT: ${doc.clientTaxId}</p>` : ""}
        </div>
        <div>
          <span class="font-black text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">
            PROJECT TITLE & OBJECTIVE
          </span>
          <p class="font-black text-slate-900 text-sm leading-snug">${sanitizePdfText(doc.title)}</p>
          <p class="text-slate-600 text-[11px] mt-0.5">Proposal Reference: <span class="font-mono font-bold text-slate-900">${doc.docNumber}</span></p>
          <p class="text-slate-600 text-[11px]">Total Project Value: <span class="font-mono font-bold text-slate-900">${formatCurrency(doc.grandTotal, currency)}</span></p>
          <p class="text-slate-500 text-[10px] mt-0.5 leading-normal">Unified specification, deliverables roadmap, commercial quotation, and acceptance terms.</p>
        </div>
      </div>

      <!-- 1. Executive Summary & Context -->
      ${
        doc.overview
          ? `
        <div class="space-y-1.5 pt-0.5">
          <div class="border-b border-slate-200 pb-1 section-header">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
              1. Executive Summary & Context
            </h3>
          </div>
          <div class="text-xs text-slate-700 leading-relaxed space-y-1">
            ${doc.overview
              .split("\n\n")
              .map((para) => `<p class="leading-relaxed">${sanitizePdfText(para)}</p>`)
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- Requirements & Proposed Solution Highlights -->
      ${
        doc.requirements || doc.proposedSolution
          ? `
        <div class="grid grid-cols-2 gap-3 pt-0.5">
          ${
            doc.requirements
              ? `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <h5 class="font-black text-slate-900 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200 section-header">
                Key Client Requirements
              </h5>
              <div class="text-xs text-slate-700 leading-normal space-y-1">
                ${doc.requirements
                  .split("\n")
                  .filter(Boolean)
                  .map(
                    (req) => `
                  <p class="flex items-start gap-1.5">
                    <span class="text-indigo-600 font-bold">•</span>
                    <span>${sanitizePdfText(req.replace(/^•\s*/, ""))}</span>
                  </p>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          ${
            doc.proposedSolution
              ? `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <h5 class="font-black text-slate-900 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200 section-header">
                Proposed Solution Strategy
              </h5>
              <p class="text-xs text-slate-700 leading-normal whitespace-pre-wrap">${sanitizePdfText(doc.proposedSolution)}</p>
            </div>
          `
              : ""
          }
        </div>
      `
          : ""
      }

      <!-- 2. Scope of Work -->
      ${
        doc.scopeOfWork
          ? `
        <div class="space-y-1.5 pt-0.5">
          <div class="border-b border-slate-200 pb-1 section-header">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
              2. Scope of Work
            </h3>
          </div>
          <div class="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-normal space-y-1 shadow-xs">
            ${doc.scopeOfWork
              .split("\n")
              .filter(Boolean)
              .map(
                (line) => `
              <div class="flex items-start gap-2">
                <span class="text-indigo-600 font-bold mt-0.5">•</span>
                <span class="leading-normal">${sanitizePdfText(line.replace(/^•\s*/, ""))}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- 3. Tangible Deliverables -->
      ${
        doc.deliverables && doc.deliverables.length > 0
          ? `
        <div class="space-y-1.5 pt-0.5">
          <div class="border-b border-slate-200 pb-1 section-header">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
              3. Tangible Project Deliverables
            </h3>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-0.5">
            ${doc.deliverables
              .map(
                (d) => `
              <div class="p-2 px-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start gap-2 text-slate-800">
                <span class="text-emerald-600 font-bold text-xs shrink-0">✓</span>
                <span class="font-medium">${sanitizePdfText(d)}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- 4. Roles & Responsibilities -->
      ${
        doc.responsibilities && (doc.responsibilities.provider || doc.responsibilities.client)
          ? `
        <div class="space-y-1.5 pt-0.5">
          <div class="border-b border-slate-200 pb-1 section-header">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
              4. Roles & Responsibilities
            </h3>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            ${
              doc.responsibilities.provider
                ? `
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <span class="font-black text-slate-900 block pb-1 border-b border-slate-200 text-[10px] uppercase tracking-wider section-header">Provider (${company.name || "XyronGroup"})</span>
                <div class="text-slate-700 leading-normal space-y-1">
                  ${doc.responsibilities.provider
                    .split("\n")
                    .filter(Boolean)
                    .map(
                      (line) => `
                    <p class="flex items-start gap-1.5">
                      <span class="text-emerald-600 font-bold">•</span>
                      <span>${sanitizePdfText(line.replace(/^•\s*/, ""))}</span>
                    </p>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
            ${
              doc.responsibilities.client
                ? `
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <span class="font-black text-slate-900 block pb-1 border-b border-slate-200 text-[10px] uppercase tracking-wider section-header">Client (${doc.clientName})</span>
                <div class="text-slate-700 leading-normal space-y-1">
                  ${doc.responsibilities.client
                    .split("\n")
                    .filter(Boolean)
                    .map(
                      (line) => `
                    <p class="flex items-start gap-1.5">
                      <span class="text-indigo-600 font-bold">•</span>
                      <span>${sanitizePdfText(line.replace(/^•\s*/, ""))}</span>
                    </p>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `
          : ""
      }

      <!-- 5. Implementation Roadmap -->
      ${
        doc.milestones && doc.milestones.length > 0
          ? `
        <div class="space-y-1.5 pt-0.5">
          <div class="border-b border-slate-200 pb-1 section-header">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
              5. Project Implementation Roadmap
            </h3>
          </div>
          <div class="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
            ${doc.milestones
              .map(
                (m) => `
              <div class="p-2 px-3 bg-white flex items-center justify-between gap-2.5">
                <div>
                  <span class="font-bold text-slate-900 text-xs">${sanitizePdfText(m.name)}</span>
                  <p class="text-slate-600 text-[11px] leading-normal">${sanitizePdfText(m.description)}</p>
                </div>
                <span class="font-mono text-[11px] font-bold text-indigo-700 shrink-0 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                  ${sanitizePdfText(m.timeline)}
                </span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- 6. Commercial Quotation & Financial Investment -->
      <div class="space-y-1.5 pt-0.5">
        <div class="border-b border-slate-200 pb-1 section-header">
          <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
            6. Financial Investment & Commercial Quotation
          </h3>
        </div>

        ${
          doc.pricingModel === "setup-and-retainer" || doc.pricingModel === "monthly-retainer"
            ? `
          <!-- Retainer Model Highlights -->
          <div class="grid grid-cols-4 gap-2 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-xs">
            <div>
              <span class="text-[8px] font-bold text-indigo-900/70 uppercase block">Model</span>
              <span class="font-bold text-indigo-950 text-xs">${doc.pricingModel === "setup-and-retainer" ? "Setup + Retainer" : "Monthly Retainer"}</span>
            </div>
            <div>
              <span class="text-[8px] font-bold text-indigo-900/70 uppercase block">Engagement</span>
              <span class="font-bold text-indigo-950 text-xs">${doc.engagementMonths || 6} Months</span>
            </div>
            <div>
              <span class="text-[8px] font-bold text-indigo-900/70 uppercase block">Month 1 / Setup</span>
              <span class="font-mono font-bold text-indigo-950 text-xs">${formatCurrency(doc.firstMonthTotal || doc.setupFee || doc.monthlyRetainerFee || 0, currency)}</span>
            </div>
            <div>
              <span class="text-[8px] font-bold text-indigo-900/70 uppercase block">Monthly Retainer</span>
              <span class="font-mono font-bold text-indigo-950 text-xs">${formatCurrency(doc.recurringMonthlyAmount || doc.monthlyRetainerFee || 0, currency)}/mo</span>
            </div>
          </div>

          <!-- Retainer Core Services Matrix -->
          ${
            doc.retainerServices && doc.retainerServices.length > 0
              ? `
            <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs mt-1.5">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                  <tr>
                    <th class="py-2 px-3 w-5/12">Core Recurring Service</th>
                    <th class="py-2 px-2 text-center w-24">Setup</th>
                    <th class="py-2 px-2 text-center w-28">Monthly Retainer</th>
                    <th class="py-2 px-3">Scope Description</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  ${doc.retainerServices
                    .map(
                      (srv) => `
                    <tr class="bg-white">
                      <td class="py-1.5 px-3 font-bold text-slate-900 text-xs">${sanitizePdfText(srv.serviceName)}</td>
                      <td class="py-1.5 px-2 text-center">
                        <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[9px]">${srv.initialSetup}</span>
                      </td>
                      <td class="py-1.5 px-2 text-center">
                        <span class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100 font-bold text-[9px]">${srv.monthlyRetainer}</span>
                      </td>
                      <td class="py-1.5 px-3 text-slate-600 text-[11px] leading-snug">${sanitizePdfText(srv.notes)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }
        `
            : `
          <!-- Standard Line Items Table -->
          <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                <tr>
                  <th class="py-2 px-3">Item & Scope Description</th>
                  <th class="py-2 px-2.5 text-center">Qty</th>
                  <th class="py-2 px-2.5 text-right">Unit Price</th>
                  <th class="py-2 px-2.5 text-right">Disc %</th>
                  <th class="py-2 px-2.5 text-right">Tax %</th>
                  <th class="py-2 px-3 text-right">Total (${currency})</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${doc.lineItems
                  .map((item) => {
                    const lineSub = item.quantity * item.unitPrice;
                    const discVal = lineSub * ((item.discount || 0) / 100);
                    const afterDisc = lineSub - discVal;
                    const taxVal = afterDisc * ((item.taxRate || 0) / 100);
                    const lineTotal = afterDisc + taxVal;

                    return `
                  <tr class="bg-white">
                    <td class="py-1.5 px-3 font-medium text-slate-900 leading-normal text-xs">${sanitizePdfText(item.description)}</td>
                    <td class="py-1.5 px-2.5 text-center font-mono text-xs">${item.quantity}</td>
                    <td class="py-1.5 px-2.5 text-right font-mono text-xs">${formatCurrency(item.unitPrice, currency)}</td>
                    <td class="py-1.5 px-2.5 text-right font-mono text-xs">${item.discount > 0 ? `${item.discount}%` : "-"}</td>
                    <td class="py-1.5 px-2.5 text-right font-mono text-xs">${item.taxRate > 0 ? `${item.taxRate}%` : "-"}</td>
                    <td class="py-1.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                      ${formatCurrency(lineTotal, currency)}
                    </td>
                  </tr>
                `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        }

        <!-- Calculations Breakdown Box -->
        <div class="flex justify-end pt-0.5 avoid-break">
          <div class="w-full sm:w-80 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs shadow-xs">
            ${
              doc.pricingModel === "setup-and-retainer"
                ? `
              <div class="flex justify-between items-center text-slate-700 text-[11px]">
                <span>Month 1 / Setup Fee:</span>
                <span class="font-mono font-bold text-slate-900">${formatCurrency(doc.setupFee || 0, currency)}</span>
              </div>
              <div class="flex justify-between items-center text-slate-700 text-[11px]">
                <span>Months 2–${doc.engagementMonths || 6} (${Math.max(0, (doc.engagementMonths || 6) - 1)} × ${formatCurrency(doc.monthlyRetainerFee || 0, currency)}):</span>
                <span class="font-mono font-bold text-slate-900">${formatCurrency((doc.monthlyRetainerFee || 0) * Math.max(0, (doc.engagementMonths || 6) - 1), currency)}</span>
              </div>
              <div class="flex justify-between items-center text-slate-500 text-[10px] pt-0.5 border-t border-slate-200">
                <span>Gross Contract Subtotal:</span>
                <span class="font-mono font-semibold">${formatCurrency(doc.subtotal, currency)}</span>
              </div>
            `
                : doc.pricingModel === "monthly-retainer"
                ? `
              <div class="flex justify-between items-center text-slate-700 text-[11px]">
                <span>Monthly Retainer:</span>
                <span class="font-mono font-bold text-slate-900">${formatCurrency(doc.monthlyRetainerFee || 0, currency)}/mo</span>
              </div>
              <div class="flex justify-between items-center text-slate-700 text-[11px]">
                <span>Engagement Term:</span>
                <span class="font-semibold text-slate-900">${doc.engagementMonths || 6} Months</span>
              </div>
              <div class="flex justify-between items-center text-slate-500 text-[10px] pt-0.5 border-t border-slate-200">
                <span>Retainer Subtotal:</span>
                <span class="font-mono font-semibold">${formatCurrency(doc.subtotal, currency)}</span>
              </div>
            `
                : `
              <div class="flex justify-between items-center text-slate-600 text-[11px]">
                <span class="font-medium">Commercial Subtotal:</span>
                <span class="font-mono font-semibold">${formatCurrency(doc.subtotal, currency)}</span>
              </div>
            `
            }
            ${
              doc.discountTotal && doc.discountTotal > 0
                ? `
              <div class="flex justify-between items-center text-emerald-700 text-[11px]">
                <span class="font-medium">Discount Savings:</span>
                <span class="font-mono font-semibold">-${formatCurrency(doc.discountTotal, currency)}</span>
              </div>
            `
                : ""
            }
            ${
              doc.taxTotal && doc.taxTotal > 0
                ? `
              <div class="flex justify-between items-center text-slate-600 text-[11px]">
                <span class="font-medium">Estimated Tax (${doc.taxRate || 0}%):</span>
                <span class="font-mono font-semibold">+${formatCurrency(doc.taxTotal, currency)}</span>
              </div>
            `
                : ""
            }
            <div class="border-t border-slate-300 pt-1.5 flex justify-between items-center font-black text-xs text-slate-900">
              <span>Month 01 Investment:</span>
              <span class="font-mono text-sm text-emerald-700">${formatCurrency(doc.grandTotal, currency)}</span>
            </div>
            ${
              doc.paymentFrequency
                ? `<p class="text-[9px] text-slate-500 italic text-right pt-0.5">Payment Frequency: ${doc.paymentFrequency}</p>`
                : ""
            }
          </div>
        </div>
      </div>

      <!-- 7. Milestone Payment Schedule -->
      ${
        doc.paymentSchedule && doc.paymentSchedule.length > 0
          ? `
        <div class="space-y-1.5 pt-0.5">
          <div class="border-b border-slate-200 pb-1 section-header">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
              7. Milestone-Based Payment Schedule
            </h3>
          </div>
          <div class="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
                  <th class="py-1.5 px-3">Milestone Stage</th>
                  <th class="py-1.5 px-2.5 text-center">Share</th>
                  <th class="py-1.5 px-3 text-right">Amount</th>
                  <th class="py-1.5 px-3">Condition / Due</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${doc.paymentSchedule
                  .map(
                    (pm) => `
                  <tr class="bg-white">
                    <td class="py-1.5 px-3 font-semibold text-slate-800 text-xs">${sanitizePdfText(pm.description)}</td>
                    <td class="py-1.5 px-2.5 text-center font-mono font-bold text-xs">${pm.percentage}%</td>
                    <td class="py-1.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                      ${formatCurrency(pm.amount, currency)}
                    </td>
                    <td class="py-1.5 px-3 text-slate-600 text-[11px]">${sanitizePdfText(pm.dueCondition || "Upon milestone completion")}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `
          : ""
      }

      <!-- Terms & Conditions and Bank Details -->
      <div class="grid grid-cols-2 gap-3.5 border-t border-slate-200 pt-3 mt-0.5 text-xs text-slate-600">
        <div class="avoid-break">
          <div class="border-b border-slate-200 pb-1 mb-1 section-header">
            <span class="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
              Terms & Conditions
            </span>
          </div>
          <p class="leading-normal whitespace-pre-wrap text-slate-700 text-[11px]">${sanitizePdfText(doc.termsAndConditions || company?.paymentTerms || "Standard commercial agreement terms apply.")}</p>
        </div>
        <div class="avoid-break">
          <div class="border-b border-slate-200 pb-1 mb-1 section-header">
            <span class="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
              Payment Instructions / Bank Details
            </span>
          </div>
          <p class="font-mono text-[10px] leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
            ${sanitizePdfText(company?.bankDetails || "Bank transfer details available upon request.")}
          </p>
        </div>
      </div>

      <!-- 8. Commercial Authorization & Acceptance -->
      <div class="pt-3 mt-0.5 border-t border-slate-200 space-y-2 avoid-break">
        <div class="border-b border-slate-200 pb-1 section-header">
          <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-900">
            8. Commercial Authorization & Acceptance
          </h3>
        </div>

        ${
          doc.acceptanceDetails?.accepted
            ? `
          <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950">
            <div>
              <p class="font-bold text-xs text-emerald-900">
                Digitally Signed & Authorized by ${doc.acceptanceDetails.authorizedName || doc.clientName}
              </p>
              <p class="text-emerald-800 text-[11px] mt-0.5">Date: ${doc.acceptanceDetails.authorizedDate || doc.issueDate} ${doc.acceptanceDetails.signerEmail ? `• ${doc.acceptanceDetails.signerEmail}` : ""}</p>
            </div>
            ${
              doc.acceptanceDetails.signatureDataUrl
                ? `<img src="${doc.acceptanceDetails.signatureDataUrl}" alt="Signature" class="max-h-9 object-contain" />`
                : ""
            }
          </div>
        `
            : ""
        }

        <div class="grid grid-cols-2 gap-6 text-xs text-slate-500 pt-0.5">
          <div>
            <div class="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1 font-serif italic text-slate-800 text-xs">
              ${
                doc.providerSignatureUrl || company.signatureImageUrl
                  ? `<img src="${doc.providerSignatureUrl || company.signatureImageUrl}" alt="Signature" class="max-h-8 max-w-[140px] object-contain" />`
                  : sanitizePdfText(doc.providerSignatoryName || company.signatoryName || `${company.name || "XyronGroup"} Authorized Signatory`)
              }
            </div>
            <p class="font-bold text-slate-800 text-[11px]">${sanitizePdfText(doc.providerSignatoryTitle || company.signatoryTitle || "Service Provider Representative")}</p>
            <p class="text-slate-500 text-[10px]">${sanitizePdfText(doc.providerSignatorySubtitle || company.signatorySubtitle || doc.preparedBy || company.name || "XyronGroup")}</p>
          </div>
          <div>
            <div class="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1">
              ${
                doc.acceptanceDetails?.signatureDataUrl
                  ? `<img src="${doc.acceptanceDetails.signatureDataUrl}" alt="Signature" class="max-h-8 max-w-[140px] object-contain" />`
                  : `<span class="font-serif italic text-slate-800 text-xs">${sanitizePdfText(doc.acceptanceDetails?.authorizedName || doc.clientName)}</span>`
              }
            </div>
            <p class="font-bold text-slate-800 text-[11px]">Client Authorization & Acceptance</p>
            <p class="text-slate-500 text-[10px]">${sanitizePdfText(doc.acceptanceDetails?.authorizedCompany || doc.clientCompany || doc.clientName)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

