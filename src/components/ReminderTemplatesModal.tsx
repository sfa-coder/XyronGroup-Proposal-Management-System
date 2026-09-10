import React, { useState } from "react";
import { ReminderTemplate, ProposalDocument, Invoice, CompanyProfile } from "../types";
import { formatCurrency } from "../utils/storage";
import {
  buildProposalHtml,
  buildInvoiceHtml,
  generatePdfBlobFromHtml,
  shareDocumentWithPdf,
} from "../utils/pdfExport";
import {
  Bell,
  Clock,
  Send,
  MessageSquare,
  Mail,
  Copy,
  Plus,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  X,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Smartphone,
  Check,
  Loader2,
  Paperclip,
} from "lucide-react";

export const DEFAULT_REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "rem-1",
    name: "Proposal Expiry Warning (3 Days Left)",
    category: "proposal_expiry",
    daysOffset: -3,
    subject: "Reminder: Proposal {{docNumber}} validity expiring soon",
    whatsappMessage: `Hello {{clientName}},

This is a gentle reminder that your proposal ({{docNumber}}) for "{{docTitle}}" from {{companyName}} is scheduled to expire in 3 days on {{expiryDate}}.

Total Investment: {{grandTotal}}

Please let us know if you would like to proceed or need any adjustments to the scope.

Best regards,
{{companyName}}`,
    emailMessage: `Dear {{clientName}},

We wanted to send a quick reminder regarding proposal {{docNumber}} ("{{docTitle}}") issued by {{companyName}}.

The terms and exclusive pricing stipulated in this document are valid until {{expiryDate}}. 

• Proposal Reference: {{docNumber}}
• Total Investment: {{grandTotal}}
• Expiry Date: {{expiryDate}}

If you would like to move forward, you can sign and authorize the proposal directly online, or let us know if you require any clarifications.

Warm regards,
{{companyName}}
{{companyPhone}}`,
  },
  {
    id: "rem-2",
    name: "Milestone Invoice Due Today",
    category: "invoice_due",
    daysOffset: 0,
    subject: "Invoice {{invoiceNumber}} Due Today - {{companyName}}",
    whatsappMessage: `Hello {{clientName}},

Friendly reminder that Invoice {{invoiceNumber}} (Amount: {{invoiceAmount}}) for milestone "{{milestoneTitle}}" is due today.

Bank Transfer Details:
{{bankDetails}}

Kindly share the transfer receipt once processed. Thank you!

{{companyName}}`,
    emailMessage: `Dear {{clientName}},

This is a reminder that Invoice {{invoiceNumber}} for "{{docTitle}}" is due for settlement today ({{dueDate}}).

Invoice Details:
• Invoice Number: {{invoiceNumber}}
• Milestone: {{milestoneTitle}}
• Amount Due: {{invoiceAmount}}
• Due Date: {{dueDate}}

Please arrange transfer as per our payment terms:
{{bankDetails}}

Thank you for your business.

Best regards,
{{companyName}} Finance Office`,
  },
  {
    id: "rem-3",
    name: "Overdue Invoice Notice (7 Days Overdue)",
    category: "invoice_overdue",
    daysOffset: 7,
    subject: "Urgent: Overdue Payment for Invoice {{invoiceNumber}}",
    whatsappMessage: `Hello {{clientName}},

We noticed that Invoice {{invoiceNumber}} ({{invoiceAmount}}) is now 7 days past due date ({{dueDate}}). 

Could you please check the payment status with your accounts department? 

Bank Details:
{{bankDetails}}

Thank you,
{{companyName}} Accounts`,
    emailMessage: `Dear {{clientName}},

We are writing regarding Invoice {{invoiceNumber}} in the amount of {{invoiceAmount}}, which was due on {{dueDate}} and currently remains outstanding.

• Proposal Reference: {{docNumber}}
• Invoice Number: {{invoiceNumber}}
• Overdue Amount: {{invoiceAmount}}

Please process the pending remittance at your earliest convenience to avoid any disruption to project deliverables:
{{bankDetails}}

If this payment has already been initiated, kindly provide the transaction confirmation so we can update your balance.

Sincerely,
Accounts Department
{{companyName}}`,
  },
  {
    id: "rem-4",
    name: "Proposal Friendly Follow-Up",
    category: "proposal_followup",
    daysOffset: 2,
    subject: "Following up on Proposal {{docNumber}} - {{docTitle}}",
    whatsappMessage: `Hi {{clientName}},

Hope you are having a productive week! Following up to check if you had a chance to review proposal {{docNumber}} for "{{docTitle}}".

Happy to hop on a brief call if you have any questions or would like to fine-tune the deliverables.

Best regards,
{{companyName}}`,
    emailMessage: `Hi {{clientName}},

I hope you are having a wonderful week.

I am following up on the proposal we sent over for {{docTitle}} (Ref: {{docNumber}}). Have you had a chance to review the proposed scope and milestone breakdown?

We are eager to assist you with this initiative and can readily tailor any specific components to match your exact timeline.

Would you be open to a quick 10-minute touchpoint this week?

Warm regards,
{{companyName}}
{{companyEmail}}`,
  },
];

interface ReminderTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  documents: ProposalDocument[];
  invoices: Invoice[];
  targetDoc?: ProposalDocument | null;
  targetInvoice?: Invoice | null;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const ReminderTemplatesModal: React.FC<ReminderTemplatesModalProps> = ({
  isOpen,
  onClose,
  company,
  documents,
  invoices,
  targetDoc: initialDoc,
  targetInvoice: initialInvoice,
  showToast,
}) => {
  if (!isOpen) return null;

  const [templates, setTemplates] = useState<ReminderTemplate[]>(DEFAULT_REMINDER_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_REMINDER_TEMPLATES[0].id);
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDoc?.id || (documents.length > 0 ? documents[0].id : "")
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    initialInvoice?.id || ""
  );
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [copied, setCopied] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const activeDoc = documents.find((d) => d.id === selectedDocId) || initialDoc || documents[0];
  const activeInvoice = invoices.find((i) => i.id === selectedInvoiceId) || (activeDoc ? invoices.find((i) => i.proposalId === activeDoc.id) : null);

  // Variable interpolator
  const interpolate = (text: string): string => {
    if (!text) return "";
    let res = text;
    const docNum = activeDoc?.docNumber || "PROP-2026-001";
    const docTitle = activeDoc?.title || "Digital Transformation Project";
    const clientName = activeDoc?.clientName || "Valued Client";
    const expiryDate = activeDoc?.expiryDate || "Within 14 Days";
    const grandTotal = activeDoc ? formatCurrency(activeDoc.grandTotal, company.currency) : "$10,000";
    const compName = company.name || "PropelQuote Enterprise";
    const compPhone = company.phone || "";
    const compEmail = company.email || "";
    const invNum = activeInvoice?.invoiceNumber || `INV-${docNum.replace(/[^0-9]/g, "")}-01`;
    const invAmt = activeInvoice ? formatCurrency(activeInvoice.grandTotal, company.currency) : formatCurrency((activeDoc?.grandTotal || 10000) * 0.5, company.currency);
    const dueDate = activeInvoice?.dueDate || "Net 14 Days";
    const milestoneTitle = activeInvoice?.milestoneTitle || "Initial Deposit Milestone";
    const bankDetails = activeInvoice?.bankDetails || company.bankDetails || "Bank transfer details on commercial invoice.";

    res = res.replace(/{{docNumber}}/g, docNum);
    res = res.replace(/{{docTitle}}/g, docTitle);
    res = res.replace(/{{clientName}}/g, clientName);
    res = res.replace(/{{expiryDate}}/g, expiryDate);
    res = res.replace(/{{grandTotal}}/g, grandTotal);
    res = res.replace(/{{companyName}}/g, compName);
    res = res.replace(/{{companyPhone}}/g, compPhone);
    res = res.replace(/{{companyEmail}}/g, compEmail);
    res = res.replace(/{{invoiceNumber}}/g, invNum);
    res = res.replace(/{{invoiceAmount}}/g, invAmt);
    res = res.replace(/{{dueDate}}/g, dueDate);
    res = res.replace(/{{milestoneTitle}}/g, milestoneTitle);
    res = res.replace(/{{bankDetails}}/g, bankDetails);

    return res;
  };

  const [isExporting, setIsExporting] = useState(false);
  const [attachPdf, setAttachPdf] = useState(true);

  const previewSubject = interpolate(selectedTemplate.subject);
  const previewWhatsApp = interpolate(selectedTemplate.whatsappMessage);
  const previewEmail = interpolate(selectedTemplate.emailMessage);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast("Template Copied", "Automated reminder message copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getTargetPdfBlobAndFilename = async () => {
    if (!activeDoc) return null;
    if (selectedTemplate.category.startsWith("invoice") && activeInvoice) {
      const html = buildInvoiceHtml(activeInvoice, activeDoc, company);
      const filename = `Invoice_${activeInvoice.invoiceNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(`Invoice ${activeInvoice.invoiceNumber} - ${company.name}`, html);
      return { blob, filename, title: `Invoice ${activeInvoice.invoiceNumber}` };
    } else {
      const html = buildProposalHtml(activeDoc, company);
      const filename = `Proposal_${activeDoc.docNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(`Proposal ${activeDoc.docNumber} - ${company.name}`, html);
      return { blob, filename, title: `Proposal ${activeDoc.docNumber} - ${activeDoc.title}` };
    }
  };

  const handleSendWhatsApp = async () => {
    setIsExporting(true);
    try {
      const phone = activeDoc?.clientEmail?.includes("@") ? "" : activeDoc?.clientEmail || "";
      const cleanPhone = phone.replace(/[^0-9]/g, "");

      if (attachPdf) {
        const result = await getTargetPdfBlobAndFilename();
        if (result) {
          await shareDocumentWithPdf({
            channel: "whatsapp",
            pdfBlob: result.blob,
            filename: result.filename,
            title: result.title,
            text: previewWhatsApp,
            phone: cleanPhone,
          });
          showToast("WhatsApp & PDF Dispatched", `Downloaded ${result.filename} and opened WhatsApp ready to send!`, "success");
          return;
        }
      }

      const text = encodeURIComponent(previewWhatsApp);
      const url = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`
        : `https://api.whatsapp.com/send?text=${text}`;
      window.open(url, "_blank");
      showToast("WhatsApp Opened", "Reminder template prepared for client chat.", "success");
    } catch (err) {
      console.warn("WhatsApp reminder error:", err);
      const text = encodeURIComponent(previewWhatsApp);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    setIsExporting(true);
    const to = activeDoc?.clientEmail || "";
    try {
      if (attachPdf) {
        const result = await getTargetPdfBlobAndFilename();
        if (result) {
          await shareDocumentWithPdf({
            channel: "email",
            pdfBlob: result.blob,
            filename: result.filename,
            title: previewSubject,
            text: previewEmail,
            email: to,
          });
          showToast("Email & PDF Prepared", `Downloaded ${result.filename} and opened mail draft.`, "success");
          return;
        }
      }

      const subject = encodeURIComponent(previewSubject);
      const body = encodeURIComponent(previewEmail);
      window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
      showToast("Email Client Opened", "Reminder email draft created.", "success");
    } catch (err) {
      console.warn("Email reminder error:", err);
      window.open(`mailto:${to}?subject=${encodeURIComponent(previewSubject)}&body=${encodeURIComponent(previewEmail)}`, "_blank");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 sm:px-7 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Automated Reminder & Follow-Up Generator</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                  1-Click Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated multi-channel reminder templates for expiring proposals, due invoices & overdue balances
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left sidebar (templates list), Right side (customization & live preview) */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto text-slate-900 dark:text-slate-100">
          {/* Left Column: Template Selection */}
          <div className="md:col-span-4 p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Choose Reminder Scenario
            </span>

            <div className="space-y-2">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 border-indigo-500/60 shadow-md shadow-indigo-500/5 ring-2 ring-indigo-500/20"
                        : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {tpl.name}
                      </span>
                      {tpl.category === "invoice_overdue" ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                          Urgent
                        </span>
                      ) : tpl.category === "invoice_due" ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
                          Due Date
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shrink-0">
                          Proposal
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tpl.subject}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Target Document & Milestone Selector */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Proposal / Client
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.docNumber} - {d.clientName} ({formatCurrency(d.grandTotal, company.currency)})
                    </option>
                  ))}
                </select>
              </div>

              {invoices.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Milestone Invoice
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="">Auto-Detect from Proposal</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {formatCurrency(inv.grandTotal, company.currency)} ({inv.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Message Preview & 1-Click Dispatch */}
          <div className="md:col-span-8 p-5 sm:p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Channel Selector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedTemplate.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Formatted for {activeDoc?.clientName || "Client"} • Auto-filled variables
                  </span>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setChannel("whatsapp")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      channel === "whatsapp"
                        ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("email")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      channel === "email"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Draft</span>
                  </button>
                </div>
              </div>

              {/* Message Preview Container */}
              {channel === "whatsapp" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold">WhatsApp Direct Message:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(previewWhatsApp)}
                      className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy WhatsApp Text"}</span>
                    </button>
                  </div>
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                    {previewWhatsApp}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Email Subject Line:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={previewSubject}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold">Email Message Body:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(previewEmail)}
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy Email Body"}</span>
                      </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[240px] overflow-y-auto font-sans">
                      {previewEmail}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={attachPdf}
                    onChange={(e) => setAttachPdf(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                    Attach PDF Document
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm cursor-pointer transition-all disabled:opacity-60"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  <span>{attachPdf ? "WhatsApp + PDF" : "Open in WhatsApp"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm cursor-pointer transition-all disabled:opacity-60"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{attachPdf ? "Send Email + PDF" : "Send via Email"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
