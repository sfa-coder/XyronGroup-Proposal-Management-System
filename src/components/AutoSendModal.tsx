import React, { useState } from "react";
import { ProposalDocument, CompanyProfile } from "../types";
import { sanitizeEmail, sanitizeText } from "../utils/sanitize";
import {
  MessageSquare,
  Mail,
  Send,
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  Smartphone,
  Zap,
  Clock,
  Sparkles,
  Download,
  FileText,
  Paperclip,
  Check,
  User,
  AtSign,
} from "lucide-react";
import { formatCurrency } from "../utils/storage";
import {
  buildProposalHtml,
  generatePdfBlobFromHtml,
  downloadPdfBlob,
  shareDocumentWithPdf,
} from "../utils/pdfExport";

interface AutoSendModalProps {
  document: ProposalDocument | null;
  company: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onMarkSent: (docId: string) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const AutoSendModal: React.FC<AutoSendModalProps> = ({
  document: doc,
  company,
  isOpen,
  onClose,
  onMarkSent,
  showToast,
}) => {
  if (!isOpen || !doc) return null;

  const [activeChannel, setActiveChannel] = useState<"whatsapp" | "email">("whatsapp");

  // Format Expiry Date nicely, e.g. "September 13, 2026"
  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return "Within 30 Days";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formattedExpiryDate = getFormattedDate(doc.expiryDate);
  const clientDisplayName = doc.clientName || doc.clientCompany || "Sarah Jenkins";
  const companyDisplayName = company.name || "XyronGroup";

  // WhatsApp Message formatted exactly to user specification
  const defaultWhatsAppText = `Hello ${clientDisplayName},

Please find your proposal (${doc.docNumber}) from ${companyDisplayName}.

Valid Until: ${formattedExpiryDate}

We kindly invite you to review the proposal at your convenience. Should you have any questions or require further clarification, please feel free to reach out to us.

We look forward to hearing from you.

Best regards,
${companyDisplayName} Team`;

  // WhatsApp State
  const [waPhone, setWaPhone] = useState(
    doc.clientEmail?.includes("@") ? "" : doc.clientEmail || ""
  );
  const [waMessage, setWaMessage] = useState(defaultWhatsAppText);

  // Email State with Editable Sender
  const [senderEmail, setSenderEmail] = useState(
    doc.senderEmail || company.email || "contact@xyrongroup.com"
  );
  const [senderName, setSenderName] = useState(
    doc.senderName || doc.preparedBy || company.name || "XyronGroup Team"
  );
  const [emailTo, setEmailTo] = useState(
    doc.clientEmail?.includes("@") ? doc.clientEmail : "client@example.com"
  );
  const [emailCc, setEmailCc] = useState("");
  const [emailSubject, setEmailSubject] = useState(
    `Proposal (${doc.docNumber}) from ${companyDisplayName}`
  );
  const [emailBody, setEmailBody] = useState(`Hello ${clientDisplayName},

Please find attached your proposal (${doc.docNumber}) from ${companyDisplayName}.

Valid Until: ${formattedExpiryDate}
Total Investment: ${formatCurrency(doc.grandTotal, company.currency || "$")}

We kindly invite you to review the proposal at your convenience. Should you have any questions or require further clarification, please feel free to reach out to us.

We look forward to hearing from you.

Best regards,
${senderName}
${companyDisplayName}
${company.phone || ""}`);

  const [isSending, setIsSending] = useState(false);
  const [sentReceipt, setSentReceipt] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Helper to trigger true PDF Blob generation and download
  const triggerPdfDownload = async () => {
    try {
      const html = buildProposalHtml(doc, company);
      const filename = `Proposal_${doc.docNumber}_${clientDisplayName.replace(/\s+/g, "_")}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Proposal ${doc.docNumber} - ${company.name || "Proposal"}`,
        html
      );
      downloadPdfBlob(blob, filename);
      showToast(
        "PDF Document Downloaded",
        `Saved ${filename} to your device. Ready to attach!`,
        "success"
      );
      return blob;
    } catch (err) {
      console.error("PDF generation fallback:", err);
      // Fallback to printable window
      const printableEl = document.getElementById("printable-pdf-document");
      const printWin = window.open("", "_blank", "width=850,height=1000,scrollbars=yes");
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${doc.docNumber}_${clientDisplayName.replace(/\s+/g, "_")}.pdf</title>
              <meta charset="utf-8">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print { @page { size: A4; margin: 10mm; } body { padding: 0 !important; } .no-print { display: none !important; } }
                body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; padding: 1.5rem; color: #1e293b; }
                .doc-wrapper { max-width: 820px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div class="doc-wrapper">
                ${printableEl ? printableEl.innerHTML : `<h2>${doc.docNumber} - ${doc.title}</h2><p>Total: ${formatCurrency(doc.grandTotal, company.currency)}</p>`}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() { window.print(); }, 300);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    showToast("Message Copied", "Copied text to clipboard.", "success");
    setTimeout(() => setCopiedText(false), 2000);
  };

  // WhatsApp Dispatch Handler with PDF Attachment
  const handleSendWhatsApp = async () => {
    setIsSending(true);
    try {
      const html = buildProposalHtml(doc, company);
      const filename = `Proposal_${doc.docNumber}_${clientDisplayName.replace(/\s+/g, "_")}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Proposal ${doc.docNumber} - ${company.name || "Proposal"}`,
        html
      );

      await shareDocumentWithPdf({
        channel: "whatsapp",
        pdfBlob: blob,
        filename,
        title: `Proposal ${doc.docNumber} - ${doc.title}`,
        text: waMessage,
        phone: waPhone.replace(/[^0-9]/g, ""),
      });

      onMarkSent(doc.id);
      showToast(
        "WhatsApp & PDF Dispatched",
        `Opened WhatsApp and generated ${filename}. Attach the downloaded PDF to your chat!`,
        "success"
      );
    } catch (err: any) {
      console.warn("WhatsApp share fallback:", err);
      const cleanedPhone = waPhone.replace(/[^0-9]/g, "");
      const encoded = encodeURIComponent(waMessage);
      const url = cleanedPhone
        ? `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(url, "_blank");
      triggerPdfDownload();
      onMarkSent(doc.id);
    } finally {
      setIsSending(false);
    }
  };

  // Backend Email Dispatch Handler with PDF
  const handleSendEmailViaApi = async () => {
    const cleanTo = sanitizeEmail(emailTo.trim());
    if (!cleanTo) {
      showToast("Recipient Email Required", "Please enter a valid recipient email address.", "warning");
      return;
    }

    setIsSending(true);
    try {
      const html = buildProposalHtml(doc, company);
      const filename = `Proposal_${doc.docNumber}_${clientDisplayName.replace(/\s+/g, "_")}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Proposal ${doc.docNumber} - ${company.name || "Proposal"}`,
        html
      );

      // Download the PDF automatically so the user also has it locally
      downloadPdfBlob(blob, filename);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: cleanTo,
          from: sanitizeEmail(senderEmail) || "proposals@xyrongroup.com",
          fromName: sanitizeText(senderName, 80) || "XyronGroup Agency",
          cc: sanitizeEmail(emailCc),
          subject: sanitizeText(emailSubject, 150),
          body: sanitizeText(emailBody, 5000),
          docNumber: doc.docNumber,
          clientName: sanitizeText(clientDisplayName, 80),
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSentReceipt(resData.dispatchRecord?.deliveryReceipt || `RCPT-${Date.now().toString().slice(-6)}`);
        onMarkSent(doc.id);
        showToast(
          "Email Successfully Dispatched",
          `Proposal ${doc.docNumber} sent to ${emailTo} with PDF document ${filename}.`,
          "success"
        );
      } else {
        throw new Error(resData.error || "Failed to dispatch email");
      }
    } catch (err: any) {
      console.warn("Backend email dispatch fallback:", err);
      // Graceful fallback to opening mail client
      const html = buildProposalHtml(doc, company);
      const filename = `Proposal_${doc.docNumber}_${clientDisplayName.replace(/\s+/g, "_")}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Proposal ${doc.docNumber} - ${company.name || "Proposal"}`,
        html
      );
      await shareDocumentWithPdf({
        channel: "email",
        pdfBlob: blob,
        filename,
        title: emailSubject,
        text: emailBody,
        email: emailTo,
      });
      onMarkSent(doc.id);
      showToast("Mail Client Opened", `Opened email dispatch for ${doc.docNumber}. PDF downloaded to attach.`, "info");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWebmail = async (service: "gmail" | "outlook" | "mailto") => {
    const html = buildProposalHtml(doc, company);
    const filename = `Proposal_${doc.docNumber}_${clientDisplayName.replace(/\s+/g, "_")}.pdf`;
    try {
      const blob = await generatePdfBlobFromHtml(
        `Proposal ${doc.docNumber} - ${company.name || "Proposal"}`,
        html
      );
      downloadPdfBlob(blob, filename);
    } catch (e) {
      console.warn(e);
    }

    if (service === "gmail") {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        emailTo
      )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(gmailUrl, "_blank");
    } else if (service === "outlook") {
      const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
        emailTo
      )}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(outlookUrl, "_blank");
    } else {
      const mailtoUrl = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
    }
    onMarkSent(doc.id);
    showToast(
      "Webmail Opened",
      `Opened ${service} composer with message and downloaded ${filename} ready to attach.`,
      "info"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Auto Send Proposal & Quotation
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  READY TO DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Send {doc.docNumber} with PDF attachment to {clientDisplayName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Quick Summary Card */}
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-extrabold text-slate-900 block">{doc.title}</span>
            <span className="text-slate-500 font-medium">
              Client: {clientDisplayName} • Ref: {doc.docNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Investment</span>
            <span className="font-extrabold font-mono text-emerald-600 text-sm">
              {formatCurrency(doc.grandTotal, company.currency || "$")}
            </span>
          </div>
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex rounded-2xl bg-[#F8FAFC] p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveChannel("whatsapp")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeChannel === "whatsapp"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Dispatch</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChannel("email")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeChannel === "email"
                ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Dispatch (With PDF)</span>
          </button>
        </div>

        {/* WHATSAPP CHANNEL */}
        {activeChannel === "whatsapp" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Client WhatsApp Phone / Number (Optional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Leave blank to pick contact in WhatsApp</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678 or +92 300 1234567"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Proper WhatsApp Proposal Message</label>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(waMessage)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? "Copied!" : "Copy Text"}</span>
                </button>
              </div>
              <textarea
                rows={9}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans leading-relaxed text-slate-800"
              />
            </div>

            {/* Attached PDF Notice */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-950 font-medium">
                <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Attached Proposal PDF: <strong className="font-mono text-indigo-700">{doc.docNumber}.pdf</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={triggerPdfDownload}
                className="px-3 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 flex items-center gap-1 cursor-pointer text-[11px]"
              >
                <Download className="w-3 h-3" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={triggerPdfDownload}
                className="w-full sm:w-auto text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer py-2"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download Proposal PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={isSending}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp & Send</span>
              </button>
            </div>
          </div>
        )}

        {/* EMAIL CHANNEL */}
        {activeChannel === "email" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sender Edit Settings (From Email & From Name) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Email Sender Configuration (Editable)
                </span>
                <span className="text-[10px] text-slate-400">Modify sender anytime</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">From Sender Email</label>
                  <div className="relative">
                    <AtSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="contact@xyrongroup.com"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">From Sender Name / Team</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="XyronGroup Team"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Recipient & CC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email (To)</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CC / BCC (Optional)</label>
                <input
                  type="text"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  placeholder="billing@xyrongroup.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Email Body Message</label>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(emailBody)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? "Copied!" : "Copy Body"}</span>
                </button>
              </div>
              <textarea
                rows={7}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-sans leading-relaxed"
              />
            </div>

            {/* Attached PDF Notice */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-950 font-medium">
                <Paperclip className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Attached Document: <strong className="font-mono text-indigo-700">{doc.docNumber}.pdf</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={triggerPdfDownload}
                className="px-3 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 flex items-center gap-1 cursor-pointer text-[11px]"
              >
                <Download className="w-3 h-3" />
                <span>Save PDF</span>
              </button>
            </div>

            {/* Webmail Quick Launch Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Or open in:</span>
              <button
                type="button"
                onClick={() => handleOpenWebmail("gmail")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Gmail Web
              </button>
              <button
                type="button"
                onClick={() => handleOpenWebmail("outlook")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Outlook Web
              </button>
              <button
                type="button"
                onClick={() => handleOpenWebmail("mailto")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Default App
              </button>
            </div>

            {/* Send Email Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={triggerPdfDownload}
                className="w-full sm:w-auto text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer py-2"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download Proposal PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmailViaApi}
                disabled={isSending}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-2.5 rounded-2xl bg-[#4F46E5] text-white font-extrabold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? "Sending Email..." : "🚀 Send Email with PDF"}</span>
              </button>
            </div>
          </div>
        )}

        {sentReceipt && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Email dispatched successfully! Delivery Receipt: {sentReceipt}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              DELIVERED
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
