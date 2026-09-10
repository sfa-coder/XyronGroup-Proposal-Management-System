import React, { useState } from "react";
import { ProposalDocument } from "../types";
import { formatCurrency } from "../utils/storage";
import {
  downloadDocumentFile,
  generatePdfBlobFromElement,
  generatePdfBlobFromHtml,
  buildProposalHtml,
  downloadPdfBlob,
  shareDocumentWithPdf,
} from "../utils/pdfExport";
import {
  X,
  Printer,
  Download,
  Share2,
  Mail,
  MessageSquare,
  Copy,
  Building2,
  CheckCircle,
  CreditCard,
  Layers,
  Calendar,
  FileCheck,
  ShieldCheck,
  PenTool,
  Lock,
  Loader2,
} from "lucide-react";

interface PDFPreviewModalProps {
  document: ProposalDocument | null;
  onClose: () => void;
  onOpenESignature?: (doc: ProposalDocument) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  document: doc,
  onClose,
  onOpenESignature,
  showToast,
}) => {
  if (!doc) return null;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const company = doc.companySnapshot;
  const currency = company?.currency || "$";

  const getPdfBlob = async (): Promise<Blob | null> => {
    try {
      const el = document.getElementById("printable-pdf-document");
      if (el) {
        const blob = await generatePdfBlobFromElement(el, `${doc.docNumber}.pdf`);
        if (blob) return blob;
      }
      // Direct builder fallback
      const html = buildProposalHtml(doc, company);
      return await generatePdfBlobFromHtml(`Proposal ${doc.docNumber} - ${company?.name || "Proposal"}`, html);
    } catch (e) {
      console.warn("Element PDF generation fallback to HTML builder:", e);
      const html = buildProposalHtml(doc, company);
      return await generatePdfBlobFromHtml(`Proposal ${doc.docNumber} - ${company?.name || "Proposal"}`, html);
    }
  };

  const handlePrint = () => {
    const el = document.getElementById("printable-pdf-document");
    if (!el) {
      window.print();
      return;
    }

    // Open clean, unblocked popup window for guaranteed high-quality printing
    const printWin = window.open("", "_blank", "width=850,height=1000,scrollbars=yes");
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.docNumber} - ${doc.title}</title>
            <meta charset="utf-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: A4 portrait;
                margin: 0mm; /* Suppress default browser header (date, title) and footer (URL, about:blank) */
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
                  padding: 8mm 10mm 8mm 10mm !important;
                  max-width: 100% !important;
                  margin: 0 auto !important;
                  box-sizing: border-box !important;
                }
                .avoid-break {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
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
                padding: 1rem;
                color: #0f172a;
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
            </style>
          </head>
          <body>
            <div class="no-print" style="max-width: 840px; margin: 0 auto 14px auto; display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 10px 16px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
              <span style="font-size: 12px; font-weight: bold; color: #475569;">Proposal & Quotation (${doc.docNumber})</span>
              <button onclick="window.print()" style="background:#4F46E5; color:white; font-weight:bold; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; font-size:12px; box-shadow: 0 4px 6px -1px rgba(79,70,229,0.2);">
                🖨️ Print / Save as PDF
              </button>
            </div>
            <div class="doc-wrapper">
              ${el.innerHTML}
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
      showToast("Print / PDF Ready", "Opened print window. Select 'Save as PDF' or select your printer.", "success");
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast("Generating PDF...", "Building high-resolution PDF document...", "info");
      const blob = await getPdfBlob();
      if (blob) {
        downloadPdfBlob(blob, `${doc.docNumber}-${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
        showToast("PDF Downloaded", `${doc.docNumber}.pdf saved to your device.`, "success");
      }
    } catch (err: any) {
      console.error("PDF generation error:", err);
      showToast("PDF Error", "Failed to generate PDF. Falling back to HTML download.", "warning");
      const el = document.getElementById("printable-pdf-document");
      if (el) {
        downloadDocumentFile(`${doc.docNumber}-${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}`, `${doc.docNumber} - ${doc.title}`, el.innerHTML);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast("Preparing WhatsApp...", "Generating attached PDF document...", "info");
      const blob = await getPdfBlob();
      if (!blob) return;

      const messageText = `Hello ${doc.clientName},\n\nPlease find attached the official *${doc.title}* Proposal & Quotation (${doc.docNumber}) from *${company.name}*.\n\n• *Document #*: ${doc.docNumber}\n• *Total Investment*: ${formatCurrency(doc.grandTotal, currency)}\n• *Valid Until*: ${doc.expiryDate}\n\nKindly review the attached PDF document. Let us know if you have any questions!`;

      await shareDocumentWithPdf({
        pdfBlob: blob,
        filename: `${doc.docNumber}-${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        title: `Proposal ${doc.docNumber} - ${doc.title}`,
        text: messageText,
        channel: "whatsapp",
        phone: doc.clientAddress || "",
        showToast,
      });
    } catch (err: any) {
      console.error("WhatsApp share error:", err);
      showToast("Error", "Could not prepare WhatsApp message with PDF.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareEmail = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast("Preparing Email...", "Generating attached PDF document...", "info");
      const blob = await getPdfBlob();
      if (!blob) return;

      const subject = `Business Proposal & Quotation: ${doc.title} (${doc.docNumber})`;
      const body = `Dear ${doc.clientName},\n\nPlease find attached the official Business Proposal & Quotation (${doc.docNumber}) for ${doc.title}.\n\nTotal Investment: ${formatCurrency(doc.grandTotal, currency)}\nValidity Date: ${doc.expiryDate}\n\nProject Overview:\n${doc.overview}\n\nBest regards,\n${company.name}\n${company.phone ? `Tel: ${company.phone}` : ""}`;

      await shareDocumentWithPdf({
        pdfBlob: blob,
        filename: `${doc.docNumber}-${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        title: `Proposal ${doc.docNumber} - ${doc.title}`,
        text: body,
        channel: "email",
        email: doc.clientEmail,
        subject,
        showToast,
      });
    } catch (err: any) {
      console.error("Email share error:", err);
      showToast("Error", "Could not prepare email with PDF.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareNative = async () => {
    try {
      setIsGeneratingPdf(true);
      const blob = await getPdfBlob();
      if (!blob) return;

      await shareDocumentWithPdf({
        pdfBlob: blob,
        filename: `${doc.docNumber}-${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        title: `Proposal ${doc.docNumber} - ${doc.title}`,
        text: `Proposal ${doc.docNumber} (${doc.title}) - ${formatCurrency(doc.grandTotal, currency)} from ${company.name}`,
        channel: "native",
        showToast,
      });
    } catch (err: any) {
      console.error("Share error:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopySummary = () => {
    const summary = `BUSINESS PROPOSAL & QUOTATION\nReference: ${doc.docNumber}\nTitle: ${doc.title}\nClient: ${doc.clientName} (${doc.clientCompany || "Client"})\nTotal Investment: ${formatCurrency(doc.grandTotal, currency)}\nIssue Date: ${doc.issueDate}\nExpiry Date: ${doc.expiryDate}`;
    navigator.clipboard.writeText(summary);
    showToast("Copied to Clipboard", "Document summary copied successfully.", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 px-4 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm tracking-wide font-mono">{doc.docNumber}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
              Proposal + Quotation Preview
            </span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              {doc.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {onOpenESignature && (
              <button
                onClick={() => onOpenESignature(doc)}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer min-h-[36px]"
                title="Open digital e-signature pad to legally sign this document"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{doc.acceptanceDetails?.accepted ? "Re-Sign" : "Sign & Authorize"}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-[#4F46E5] hover:bg-indigo-600 text-white transition-all shadow-md cursor-pointer min-h-[36px]"
              title="Open print preview to print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-700/90 hover:bg-emerald-600 text-white transition-all cursor-pointer disabled:opacity-60 shadow-xs min-h-[36px]"
              title="Send proposal via WhatsApp with PDF attached"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShareEmail}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-60 min-h-[36px]"
              title="Send proposal via Email with PDF attached"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            <button
              onClick={handleShareNative}
              disabled={isGeneratingPdf}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Share Document with Attachment"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopySummary}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Copy Summary Text"
            >
              <Copy className="w-4 h-4" />
            </button>

            <div className="h-5 w-[1px] bg-slate-800 mx-0.5" />

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          className="p-5 sm:p-7 md:p-8 overflow-y-auto space-y-4 bg-white text-slate-800 font-sans print:p-4 print:overflow-visible"
          id="printable-pdf-document"
        >
          {/* Document Header Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-3.5">
            <div className="space-y-1 max-w-sm">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="max-h-11 max-w-[170px] object-contain mb-1"
                />
              ) : (
                <div className="flex items-center gap-2 text-indigo-900">
                  <Building2 className="w-6 h-6 text-[#4F46E5]" />
                  <div>
                    <span className="font-black text-lg tracking-tight text-slate-900 block leading-tight">
                      {company?.name || "XyronGroup"}
                    </span>
                    {company?.tagline && (
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        {company.tagline}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="text-[11px] text-slate-600 leading-tight font-medium pt-0.5 space-y-0.5">
                <p className="font-bold text-slate-900 text-xs">{company?.name}</p>
                <p>{company?.address}</p>
                <p>Email: {company?.email} {company?.phone ? `| Tel: ${company.phone}` : ""}</p>
                {company?.website && <p>Web: {company.website}</p>}
                {company?.taxId && <p className="text-slate-500 font-mono text-[10px]">Tax ID / VAT: {company.taxId}</p>}
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider mb-1">
                PROJECT PROPOSAL & QUOTATION
              </span>
              <h2 className="text-base font-mono font-bold text-slate-900 leading-tight">{doc.docNumber}</h2>
              <div className="text-[11px] text-slate-600 space-y-0.5 mt-1.5">
                <p><span className="font-bold text-slate-800">Issue Date:</span> {doc.issueDate}</p>
                <p><span className="font-bold text-slate-800">Valid Until:</span> {doc.expiryDate}</p>
                <p>
                  <span className="font-bold text-slate-800">Status:</span>{" "}
                  <span className="font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase text-[10px]">{doc.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Client Recipient & Project Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                PREPARED FOR (CLIENT)
              </span>
              <h3 className="font-black text-sm text-slate-900">{doc.clientName}</h3>
              {doc.clientCompany && <p className="text-xs font-bold text-indigo-900">{doc.clientCompany}</p>}
              {doc.clientAddress && (
                <div className="text-[11px] text-slate-600 mt-0.5 leading-snug whitespace-pre-line">
                  {doc.clientAddress}
                </div>
              )}
              {doc.clientEmail && <p className="text-[11px] text-slate-600">{doc.clientEmail}</p>}
              {doc.clientTaxId && <p className="text-[10px] text-slate-500 font-mono mt-0.5">Tax ID / VAT: {doc.clientTaxId}</p>}
            </div>

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                PROJECT TITLE & OBJECTIVE
              </span>
              <h3 className="font-black text-sm text-slate-900 leading-tight">{doc.title}</h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Proposal Reference: <span className="font-mono font-bold text-slate-900">{doc.docNumber}</span></p>
              <p className="text-[11px] text-slate-600">Total Project Value: <span className="font-mono font-bold text-slate-900">{formatCurrency(doc.grandTotal, currency)}</span></p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                Unified specification, deliverables roadmap, commercial quotation, and acceptance terms.
              </p>
            </div>
          </div>

          {/* 1. Executive Summary & Context */}
          {doc.overview && (
            <div className="space-y-1.5 avoid-break pt-1">
              <div className="border-b border-slate-200 pb-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                  1. Executive Summary & Context
                </h4>
              </div>
              <div className="text-xs text-slate-700 leading-normal space-y-1.5">
                {doc.overview.split("\n\n").map((para, idx) => (
                  <p key={idx} className="leading-normal">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Requirements & Proposed Solution */}
          {(doc.requirements || doc.proposedSolution) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 avoid-break pt-1">
              {doc.requirements && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-200">
                    Key Client Requirements
                  </h5>
                  <div className="text-xs text-slate-700 leading-snug space-y-1">
                    {doc.requirements.split("\n").filter(Boolean).map((req, idx) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{req.replace(/^•\s*/, "")}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {doc.proposedSolution && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-200">
                    Proposed Solution Strategy
                  </h5>
                  <p className="text-xs text-slate-700 leading-normal whitespace-pre-wrap">
                    {doc.proposedSolution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. Scope of Work */}
          {doc.scopeOfWork && (
            <div className="space-y-1.5 avoid-break pt-1">
              <div className="border-b border-slate-200 pb-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                  2. Scope of Work
                </h4>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-normal space-y-1 shadow-xs">
                {doc.scopeOfWork.split("\n").filter(Boolean).map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span className="leading-snug">{line.replace(/^•\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Tangible Deliverables */}
          {doc.deliverables && doc.deliverables.length > 0 && (
            <div className="space-y-1.5 avoid-break pt-1">
              <div className="border-b border-slate-200 pb-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                  3. Tangible Project Deliverables
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {doc.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Roles & Responsibilities */}
          {doc.responsibilities && (doc.responsibilities.provider || doc.responsibilities.client) && (
            <div className="space-y-1.5 avoid-break pt-1">
              <div className="border-b border-slate-200 pb-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                  4. Roles & Responsibilities
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doc.responsibilities.provider && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-black text-slate-900 block pb-1 border-b border-slate-200 text-[10px] uppercase tracking-wider">
                      Provider ({company?.name || "XyronGroup"})
                    </span>
                    <div className="text-slate-700 leading-snug space-y-1">
                      {doc.responsibilities.provider.split("\n").filter(Boolean).map((line, idx) => (
                        <p key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{line.replace(/^•\s*/, "")}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {doc.responsibilities.client && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-black text-slate-900 block pb-1 border-b border-slate-200 text-[10px] uppercase tracking-wider">
                      Client ({doc.clientName})
                    </span>
                    <div className="text-slate-700 leading-snug space-y-1">
                      {doc.responsibilities.client.split("\n").filter(Boolean).map((line, idx) => (
                        <p key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{line.replace(/^•\s*/, "")}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Milestones Schedule */}
          {doc.milestones && doc.milestones.length > 0 && (
            <div className="space-y-1.5 avoid-break pt-1">
              <div className="border-b border-slate-200 pb-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                  5. Project Implementation Roadmap
                </h4>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {doc.milestones.map((m) => (
                  <div key={m.id} className="p-2.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{m.description}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700 shrink-0 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 self-start sm:self-center">
                      {m.timeline}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Itemized Line Items Table & Financial Calculations */}
          <div className="space-y-2 avoid-break pt-1" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="border-b border-slate-200 pb-1">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                6. Financial Investment & Commercial Quotation
              </h4>
            </div>

            {/* If Retainer Model: Render Retainer Structure Header & Scope */}
            {(doc.pricingModel === "setup-and-retainer" || doc.pricingModel === "monthly-retainer") && (
              <div className="space-y-2.5">
                {/* Highlights Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-900/60 uppercase block">Pricing Structure</span>
                    <span className="font-extrabold text-indigo-950 text-xs">
                      {doc.pricingModel === "setup-and-retainer" ? "Setup + Monthly Retainer" : "Monthly Retainer"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-indigo-900/60 uppercase block">Min. Engagement</span>
                    <span className="font-extrabold text-indigo-950 text-xs">
                      {doc.engagementMonths || 6} Months Commitment
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-indigo-900/60 uppercase block">Month 1 Investment</span>
                    <span className="font-extrabold font-mono text-indigo-950 text-xs">
                      {formatCurrency(doc.firstMonthTotal || doc.setupFee || doc.monthlyRetainerFee || 0, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-indigo-900/60 uppercase block">Recurring Retainer</span>
                    <span className="font-extrabold font-mono text-indigo-950 text-xs">
                      {formatCurrency(doc.recurringMonthlyAmount || doc.monthlyRetainerFee || 0, currency)} / mo
                    </span>
                  </div>
                </div>

                {/* Retainer Core Services Matrix */}
                {doc.retainerServices && doc.retainerServices.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider">
                          <th className="py-2 px-3 text-left w-5/12">Core Recurring Service</th>
                          <th className="py-2 px-2.5 text-center w-24">Initial Setup</th>
                          <th className="py-2 px-2.5 text-center w-28">Monthly Retainer</th>
                          <th className="py-2 px-3 text-left">Scope & Key Activities</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                        {doc.retainerServices.map((srv) => (
                          <tr key={srv.id} className="hover:bg-slate-50 bg-white" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                            <td className="py-2 px-3 font-bold text-slate-900 align-top">{srv.serviceName}</td>
                            <td className="py-2 px-2.5 text-center align-top">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                {srv.initialSetup}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-center align-top">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[10px]">
                                {srv.monthlyRetainer}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 text-[11px] align-top leading-snug">{srv.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Standard Line Items Table (For One-Time / Custom or if line items exist and not retainer) */}
            {(doc.pricingModel === "one-time" || doc.pricingModel === "custom" || (!doc.retainerServices && doc.lineItems?.length > 0)) && (
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider">
                      <th className="py-2 px-3 text-left w-5/12">Item & Scope Description</th>
                      <th className="py-2 px-2 text-center w-10">Qty</th>
                      <th className="py-2 px-2.5 text-right">Unit Price</th>
                      <th className="py-2 px-2 text-right">Disc %</th>
                      <th className="py-2 px-2 text-right">Tax %</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                    {doc.lineItems.map((item) => {
                      const lineSub = item.quantity * item.unitPrice;
                      const discVal = lineSub * ((item.discount || 0) / 100);
                      const afterDisc = lineSub - discVal;
                      const taxVal = afterDisc * ((item.taxRate || 0) / 100);
                      const lineTotal = afterDisc + taxVal;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 bg-white" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                          <td className="py-2 px-3 font-medium text-slate-900 align-top leading-snug">{item.description}</td>
                          <td className="py-2 px-2 text-center font-mono align-top">{item.quantity}</td>
                          <td className="py-2 px-2.5 text-right font-mono align-top whitespace-nowrap">{formatCurrency(item.unitPrice, currency)}</td>
                          <td className="py-2 px-2 text-right font-mono align-top whitespace-nowrap">{item.discount > 0 ? `${item.discount}%` : "-"}</td>
                          <td className="py-2 px-2 text-right font-mono align-top whitespace-nowrap">{item.taxRate > 0 ? `${item.taxRate}%` : "-"}</td>
                          <td className="py-2 px-3 text-right font-bold font-mono align-top whitespace-nowrap text-slate-900">{formatCurrency(lineTotal, currency)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Calculations Breakdown Box */}
            <div className="flex justify-end pt-1 avoid-break" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
              <div className="w-full sm:w-80 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-xs">
                {doc.pricingModel === "setup-and-retainer" ? (
                  <>
                    <div className="flex justify-between items-center text-slate-700 text-[11px]">
                      <span>Month 1 / Setup Investment:</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(doc.setupFee || 0, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 text-[11px]">
                      <span>Months 2–{doc.engagementMonths || 6} ({Math.max(0, (doc.engagementMonths || 6) - 1)} × {formatCurrency(doc.monthlyRetainerFee || 0, currency)}):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency((doc.monthlyRetainerFee || 0) * Math.max(0, (doc.engagementMonths || 6) - 1), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-[10px] pt-0.5 border-t border-slate-200">
                      <span>Gross Contract Subtotal:</span>
                      <span className="font-mono font-semibold">{formatCurrency(doc.subtotal, currency)}</span>
                    </div>
                  </>
                ) : doc.pricingModel === "monthly-retainer" ? (
                  <>
                    <div className="flex justify-between items-center text-slate-700 text-[11px]">
                      <span>Monthly Retainer:</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(doc.monthlyRetainerFee || 0, currency)}/mo</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 text-[11px]">
                      <span>Contract Period:</span>
                      <span className="font-semibold text-slate-900">{doc.engagementMonths || 6} Months</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-[10px] pt-0.5 border-t border-slate-200">
                      <span>Total Retainer Subtotal:</span>
                      <span className="font-mono font-semibold">{formatCurrency(doc.subtotal, currency)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-slate-600 text-[11px]">
                    <span className="font-medium">Commercial Subtotal:</span>
                    <span className="font-mono font-semibold">{formatCurrency(doc.subtotal, currency)}</span>
                  </div>
                )}

                {doc.discountTotal > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 text-[11px]">
                    <span className="font-medium">Discount Savings:</span>
                    <span className="font-mono font-semibold">-{formatCurrency(doc.discountTotal, currency)}</span>
                  </div>
                )}
                {doc.taxTotal > 0 && (
                  <div className="flex justify-between items-center text-slate-600 text-[11px]">
                    <span className="font-medium">Estimated Tax ({doc.taxRate || 0}%):</span>
                    <span className="font-mono font-semibold">+{formatCurrency(doc.taxTotal, currency)}</span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-2 flex justify-between items-center font-black text-xs text-slate-900">
                  <span>Month 01 Investment:</span>
                  <span className="font-mono text-sm text-emerald-700">{formatCurrency(doc.grandTotal, currency)}</span>
                </div>
                {doc.paymentFrequency && (
                  <p className="text-[10px] text-slate-500 italic text-right pt-0.5">
                    Payment Frequency: {doc.paymentFrequency}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 7. Payment Schedule */}
          {doc.paymentSchedule && doc.paymentSchedule.length > 0 && (
            <div className="space-y-1.5 avoid-break pt-1" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
              <div className="border-b border-slate-200 pb-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                  7. Milestone-Based Payment Schedule
                </h4>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
                      <th className="py-2 px-3">Milestone Stage</th>
                      <th className="py-2 px-2.5 text-center">Share</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3">Condition / Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {doc.paymentSchedule.map((pm) => (
                      <tr key={pm.id} className="bg-white">
                        <td className="py-2 px-3 font-semibold text-slate-800 text-xs">{pm.description}</td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-xs">{pm.percentage}%</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                          {formatCurrency(pm.amount, currency)}
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">{pm.dueCondition || "On delivery"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Terms & Bank Details Footer */}
          <div className="border-t border-slate-200 pt-3 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 avoid-break" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div>
              <div className="border-b border-slate-200 pb-1 mb-1.5">
                <span className="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
                  Terms & Conditions
                </span>
              </div>
              <p className="leading-normal whitespace-pre-wrap text-slate-700 text-[11px]">{doc.termsAndConditions || company?.paymentTerms}</p>
            </div>

            <div>
              <div className="border-b border-slate-200 pb-1 mb-1.5">
                <span className="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
                  Payment Instructions / Bank Details
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                {company?.bankDetails || "Bank transfer details available upon request."}
              </p>
            </div>
          </div>

          {/* 8. Acceptance & Authorization Block */}
          <div className="pt-3.5 mt-1 border-t border-slate-200 space-y-2.5 avoid-break" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                8. Commercial Authorization & Acceptance
              </h4>
              {doc.acceptanceDetails?.verificationHash && (
                <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Audit Hash: {doc.acceptanceDetails.verificationHash}
                </span>
              )}
            </div>

            {doc.acceptanceDetails?.accepted ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-start justify-between gap-3 text-xs text-emerald-950">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 space-y-0.5">
                    <p className="font-bold text-xs text-emerald-900">
                      Digitally Signed & Authorized by {doc.acceptanceDetails.authorizedName || doc.clientName}
                    </p>
                    <p className="text-emerald-800 text-[11px]">
                      {doc.acceptanceDetails.authorizedCompany ? `${doc.acceptanceDetails.authorizedCompany} • ` : ""}
                      Date: {doc.acceptanceDetails.authorizedDate || doc.issueDate}
                      {doc.acceptanceDetails.signerEmail ? ` • Email: ${doc.acceptanceDetails.signerEmail}` : ""}
                    </p>
                    {doc.acceptanceDetails.notes && (
                      <p className="text-emerald-700 italic text-[11px]">Notes: "{doc.acceptanceDetails.notes}"</p>
                    )}
                  </div>
                </div>

                {doc.acceptanceDetails.signatureDataUrl && (
                  <div className="bg-white p-1.5 rounded-lg border border-emerald-200 shadow-xs shrink-0 self-end sm:self-auto text-center">
                    <img
                      src={doc.acceptanceDetails.signatureDataUrl}
                      alt="Digital Signature"
                      className="max-h-9 max-w-[140px] object-contain mx-auto"
                    />
                    <span className="text-[8px] text-slate-400 font-mono block mt-0.5">Verified E-Signature</span>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-6 text-xs text-slate-500">
              <div>
                <div className="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1 font-serif italic text-slate-800 text-xs">
                  {doc.providerSignatureUrl || company?.signatureImageUrl ? (
                    <img
                      src={doc.providerSignatureUrl || company?.signatureImageUrl}
                      alt="Provider Signature"
                      className="max-h-8 max-w-[140px] object-contain"
                    />
                  ) : (
                    <span>
                      {doc.providerSignatoryName || company?.signatoryName || `${company?.name || "XyronGroup"} Authorized Signatory`}
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-800 text-[11px]">
                  {doc.providerSignatoryTitle || company?.signatoryTitle || "Service Provider Representative"}
                </p>
                <p className="text-slate-500 text-[10px]">
                  {doc.providerSignatorySubtitle || company?.signatorySubtitle || doc.preparedBy || company?.name || "XyronGroup"}
                </p>
              </div>
              <div>
                <div className="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1">
                  {doc.acceptanceDetails?.signatureDataUrl ? (
                    <img
                      src={doc.acceptanceDetails.signatureDataUrl}
                      alt="Client Signature"
                      className="max-h-8 max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-slate-800 text-xs">
                      {doc.acceptanceDetails?.authorizedName || doc.clientName}
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-800 text-[11px]">Client Authorization & Acceptance</p>
                <p className="text-slate-500 text-[10px]">{doc.acceptanceDetails?.authorizedCompany || doc.clientCompany || doc.clientName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
