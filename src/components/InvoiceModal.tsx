import React, { useState, useEffect } from "react";
import { ProposalDocument, Invoice, CompanyProfile, InvoiceStatus } from "../types";
import { formatCurrency, generateInvoiceNumber } from "../utils/storage";
import {
  printCleanDocument,
  downloadDocumentFile,
  buildInvoiceHtml,
  generatePdfBlobFromHtml,
  downloadPdfBlob,
  shareDocumentWithPdf,
} from "../utils/pdfExport";
import {
  FileSpreadsheet,
  X,
  Check,
  Printer,
  Download,
  Share2,
  DollarSign,
  Percent,
  Calendar,
  CreditCard,
  Building2,
  Eye,
  Send,
  MessageCircle,
  Mail,
  Receipt,
  FileCheck,
  Loader2,
} from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProposalDocument | null;
  initialInvoice?: Invoice | null;
  existingInvoices: Invoice[];
  company: CompanyProfile;
  onSaveInvoice: (invoice: Invoice) => void;
  onOpenReceiptModal?: (invoice: Invoice) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  document,
  initialInvoice,
  existingInvoices,
  company,
  onSaveInvoice,
  onOpenReceiptModal,
  showToast,
}) => {
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<InvoiceStatus>("Draft");
  const [percentage, setPercentage] = useState<number>(50);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(company.defaultTaxRate || 10);
  const [discount, setDiscount] = useState<number>(0);
  const [milestoneTitle, setMilestoneTitle] = useState("50% Upfront Project Initiation Deposit");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(company.paymentTerms || "Payable within 14 calendar days.");
  const [bankDetails, setBankDetails] = useState(company.bankDetails || "");

  // Initialize or update fields when modal opens or document/initialInvoice changes
  useEffect(() => {
    if (!isOpen || !document) return;

    if (initialInvoice) {
      setInvoiceNumber(initialInvoice.invoiceNumber);
      setIssueDate(initialInvoice.issueDate);
      setDueDate(initialInvoice.dueDate);
      setStatus(initialInvoice.status);
      setPercentage(initialInvoice.percentage || 100);
      setSubtotal(initialInvoice.subtotal);
      setTaxRate(initialInvoice.taxRate);
      setDiscount(initialInvoice.discount || 0);
      setMilestoneTitle(initialInvoice.milestoneTitle || "");
      setNotes(initialInvoice.notes || "");
      setPaymentTerms(initialInvoice.paymentTerms || company.paymentTerms);
      setBankDetails(initialInvoice.bankDetails || company.bankDetails);
    } else {
      const newNumber = generateInvoiceNumber(existingInvoices);
      setInvoiceNumber(newNumber);
      setIssueDate(new Date().toISOString().split("T")[0]);
      setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setStatus("Draft");

      // Check if document has payment schedule milestones
      const firstSchedule = document.paymentSchedule?.[0];
      const defaultPct = firstSchedule?.percentage || 50;
      setPercentage(defaultPct);

      const calculatedSub = Math.round((document.subtotal * (defaultPct / 100)) * 100) / 100;
      setSubtotal(calculatedSub);
      setTaxRate(company.defaultTaxRate || 10);
      setDiscount(0);
      setMilestoneTitle(firstSchedule?.description || `${defaultPct}% Upfront Project Initiation Deposit`);
      setNotes(`Official invoice for proposal ${document.docNumber}: ${document.title}`);
      setPaymentTerms(company.paymentTerms);
      setBankDetails(company.bankDetails);
    }
    setActiveView("edit");
  }, [isOpen, document, initialInvoice]);

  if (!isOpen || !document) return null;

  // Percentage & Amount dynamic calculations
  const handlePercentageChange = (pct: number) => {
    const clampedPct = Math.max(0, Math.min(100, pct));
    setPercentage(clampedPct);
    const newSub = Math.round((document.subtotal * (clampedPct / 100)) * 100) / 100;
    setSubtotal(newSub);
  };

  const handleSubtotalChange = (amount: number) => {
    const positiveAmt = Math.max(0, amount);
    setSubtotal(positiveAmt);
    if (document.subtotal > 0) {
      const calculatedPct = Math.round((positiveAmt / document.subtotal) * 10000) / 100;
      setPercentage(calculatedPct);
    }
  };

  const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
  const grandTotal = Math.max(0, Math.round((subtotal + taxAmount - discount) * 100) / 100);

  const handleSave = () => {
    const savedInvoice: Invoice = {
      id: initialInvoice?.id || `inv_${Date.now()}`,
      invoiceNumber,
      proposalId: document.id,
      proposalDocNumber: document.docNumber,
      proposalTitle: document.title,
      clientId: document.clientId,
      clientName: document.clientName,
      clientCompany: document.clientCompany,
      clientEmail: document.clientEmail,
      clientAddress: document.clientAddress,
      clientTaxId: document.clientTaxId,
      issueDate,
      dueDate,
      status,
      percentage,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      amountPaid: status === "Paid" ? grandTotal : (initialInvoice?.amountPaid || 0),
      balanceDue: status === "Paid" ? 0 : grandTotal - (initialInvoice?.amountPaid || 0),
      milestoneTitle,
      notes,
      paymentTerms,
      bankDetails,
      lineItems: document.lineItems.map((li) => ({
        ...li,
        unitPrice: Math.round((li.unitPrice * (percentage / 100)) * 100) / 100,
      })),
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCompleted: document.isCompleted || document.status === "Completed",
    };

    onSaveInvoice(savedInvoice);
    showToast(
      initialInvoice ? "Invoice Updated" : "Invoice Created",
      `${savedInvoice.invoiceNumber} (${savedInvoice.percentage}% - ${formatCurrency(savedInvoice.grandTotal, company.currency)}) has been saved.`,
      "success"
    );
    onClose();
  };

  const [isExporting, setIsExporting] = useState(false);

  const getInvoiceHtmlContent = () => {
    return buildInvoiceHtml(
      {
        invoiceNumber,
        issueDate,
        dueDate,
        status,
        percentage,
        subtotal,
        taxRate,
        taxAmount,
        grandTotal,
        milestoneTitle,
        notes,
        paymentTerms,
        bankDetails,
      },
      document,
      company
    );
  };

  const handleWhatsAppSend = async () => {
    setIsExporting(true);
    const message = `Hello ${document.clientName},\n\nPlease find attached the official invoice *${invoiceNumber}* for *${document.title}* (${document.docNumber}).\n\n• *Invoice Amount*: ${formatCurrency(grandTotal, company.currency)} (${percentage}% milestone)\n• *Due Date*: ${dueDate}\n• *Payment Instructions*: ${bankDetails}\n\nKindly review and process at your earliest convenience.\n\nBest regards,\n*${company.name}*`;
    try {
      const html = getInvoiceHtmlContent();
      const filename = `Invoice_${invoiceNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Invoice ${invoiceNumber} - ${company.name}`,
        html
      );

      await shareDocumentWithPdf({
        channel: "whatsapp",
        pdfBlob: blob,
        filename,
        title: `Invoice ${invoiceNumber} - ${company.name}`,
        text: message,
      });

      showToast(
        "WhatsApp & PDF Dispatched",
        `Invoice ${invoiceNumber}.pdf downloaded. Attach it to your WhatsApp conversation!`,
        "success"
      );
    } catch (err) {
      console.warn("Invoice WhatsApp fallback:", err);
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      showToast("WhatsApp Opened", "Invoice details prepared for client chat.", "success");
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailSend = async () => {
    setIsExporting(true);
    const subject = `Invoice ${invoiceNumber} for ${document.title} - ${company.name}`;
    const body = `Dear ${document.clientName},\n\nPlease find attached the official invoice (${invoiceNumber}) for "${document.title}".\n\n• Invoice Number: ${invoiceNumber}\n• Milestone: ${milestoneTitle || `${percentage}% Milestone`}\n• Amount Due: ${formatCurrency(grandTotal, company.currency)}\n• Due Date: ${dueDate}\n\nPayment Details:\n${bankDetails}\n\nThank you for your business.\n\nBest regards,\n${company.name}`;
    try {
      const html = getInvoiceHtmlContent();
      const filename = `Invoice_${invoiceNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Invoice ${invoiceNumber} - ${company.name}`,
        html
      );

      await shareDocumentWithPdf({
        channel: "email",
        pdfBlob: blob,
        filename,
        title: subject,
        text: body,
        email: document.clientEmail,
      });

      showToast(
        "Email & PDF Prepared",
        `Invoice ${invoiceNumber}.pdf downloaded and email client opened ready to send!`,
        "success"
      );
    } catch (err) {
      console.warn("Invoice Email fallback:", err);
      const mailtoUrl = `mailto:${encodeURIComponent(document.clientEmail || "")}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, "_blank");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPDF = () => {
    const html = getInvoiceHtmlContent();
    printCleanDocument(`Invoice-${invoiceNumber}`, html);
    showToast("Print Ready", `Invoice ${invoiceNumber} opened in clean print window.`, "info");
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const html = getInvoiceHtmlContent();
      const filename = `Invoice_${invoiceNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Invoice ${invoiceNumber} - ${company.name}`,
        html
      );
      downloadPdfBlob(blob, filename);
      showToast("PDF Downloaded", `Invoice ${invoiceNumber}.pdf saved to your device.`, "success");
    } catch (err) {
      console.warn("PDF fallback to html file:", err);
      const html = getInvoiceHtmlContent();
      downloadDocumentFile(`Invoice-${invoiceNumber}`, `Invoice ${invoiceNumber} - ${company.name}`, html);
      showToast("File Downloaded", `Invoice ${invoiceNumber} downloaded to your computer.`, "success");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {initialInvoice ? "Edit & Customize Invoice" : "Generate Custom Invoice"}
                </h2>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-lg">
                  {invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Linked to {document.docNumber}: {document.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveView("edit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === "edit"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeView === "preview"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Invoice PDF</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {activeView === "edit" ? (
            <div className="space-y-6">
              {/* Proposal Reference Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Source Document Information
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {document.title}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Client: {document.clientName} ({document.clientCompany})
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Proposal Total Value
                  </span>
                  <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                    {formatCurrency(document.grandTotal, company.currency)}
                  </span>
                </div>
              </div>

              {/* Amount & Percentage Customizer */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Invoice Amount & Milestone Percentage
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Adjust percentage or custom amount directly
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Quick Presets:</span>
                  {[
                    { label: "25% Quarter", pct: 25 },
                    { label: "30% Advance", pct: 30 },
                    { label: "50% Deposit", pct: 50 },
                    { label: "70% Progress", pct: 70 },
                    { label: "100% Full Balance", pct: 100 },
                  ].map((preset) => (
                    <button
                      key={preset.pct}
                      type="button"
                      onClick={() => {
                        handlePercentageChange(preset.pct);
                        setMilestoneTitle(`${preset.pct}% ${preset.label.replace(`${preset.pct}% `, "")}`);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        Math.abs(percentage - preset.pct) < 0.1
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-600"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}

                  {document.paymentSchedule && document.paymentSchedule.length > 0 && (
                    <div className="w-full pt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        From Proposal Milestones:
                      </span>
                      {document.paymentSchedule.map((pm, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            handlePercentageChange(pm.percentage);
                            setMilestoneTitle(pm.description);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 cursor-pointer"
                        >
                          {pm.description} ({pm.percentage}%)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount & Percentage Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Milestone Percentage (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={percentage}
                        onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-black text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Invoice Subtotal ({company.currency})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={subtotal}
                        onChange={(e) => handleSubtotalChange(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-xs">
                        {company.currency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Milestone Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Milestone / Invoice Purpose Description
                  </label>
                  <input
                    type="text"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    placeholder="e.g. 50% Upfront Project Initiation Deposit"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Status & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 cursor-pointer"
                  >
                    <option value="Draft">Draft (Unsent)</option>
                    <option value="Sent">Sent to Client</option>
                    <option value="Paid">Paid in Full</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g. Net 14 Days"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Bank & Payment Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Wire / Payment Details
                </label>
                <textarea
                  rows={2}
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="Bank name, IBAN/Account #, Routing..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 resize-none font-mono"
                />
              </div>

              {/* Financial Calculation Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                    Summary Breakdown ({percentage}% Invoice)
                  </span>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <span>Subtotal: {formatCurrency(subtotal, company.currency)}</span>
                    <span>Tax ({taxRate}%): {formatCurrency(taxAmount, company.currency)}</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Invoice Grand Total
                  </span>
                  <span className="text-xl font-black text-white">
                    {formatCurrency(grandTotal, company.currency)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Branded Printable Invoice PDF View */
            <div className="p-5 sm:p-7 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-inner space-y-4 max-w-3xl mx-auto font-sans">
              {/* Header */}
              <div className="flex flex-col sm:flex-row print:flex-row items-start justify-between gap-3 border-b border-slate-200 pb-3.5">
                <div className="space-y-1 max-w-sm">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="max-h-11 max-w-[170px] object-contain mb-1" />
                  ) : (
                    <h1 className="text-xl font-black tracking-tight text-indigo-900">{company.name}</h1>
                  )}
                  <div className="text-[11px] text-slate-600 space-y-0.5 mt-0.5 font-medium leading-tight">
                    <p className="font-bold text-slate-900 text-xs">{company.name}</p>
                    <p>{company.address || ""}</p>
                    <p>Email: {company.email || ""} {company.phone ? `| Tel: ${company.phone}` : ""}</p>
                    {company.website && <p>Web: {company.website}</p>}
                    {company.taxId && <p className="font-mono text-slate-500 text-[10px]">Tax ID / VAT: {company.taxId}</p>}
                  </div>
                </div>
                <div className="w-full sm:w-auto print:w-auto text-left sm:text-right print:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider mb-1">
                    COMMERCIAL INVOICE
                  </span>
                  <h2 className="text-base font-mono font-bold text-slate-900 leading-tight">{invoiceNumber}</h2>
                  <div className="text-[11px] text-slate-600 space-y-0.5 mt-1.5">
                    <p><span className="font-bold text-slate-800">Issue Date:</span> {issueDate}</p>
                    <p><span className="font-bold text-slate-800">Due Date:</span> {dueDate}</p>
                    <p><span className="font-bold text-slate-800">Status:</span> <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 uppercase text-[10px]">{status}</span></p>
                  </div>
                </div>
              </div>

              {/* Bill To & Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-black text-slate-500 uppercase tracking-wider text-[9px] block mb-1">
                    BILLED TO (CLIENT)
                  </span>
                  <p className="font-black text-slate-900 text-sm">{document.clientName}</p>
                  {document.clientCompany && <p className="font-bold text-indigo-900 text-xs">{document.clientCompany}</p>}
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{document.clientAddress || ""}</p>
                  <p className="text-[11px] text-slate-600">{document.clientEmail || ""}</p>
                  {document.clientTaxId && <p className="text-[10px] text-slate-500 font-mono mt-0.5">Tax ID / VAT: {document.clientTaxId}</p>}
                </div>
                <div>
                  <span className="font-black text-slate-500 uppercase tracking-wider text-[9px] block mb-1">
                    PROPOSAL & PROJECT REFERENCE
                  </span>
                  <p className="font-black text-slate-900 text-sm leading-tight">{document.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Proposal Reference: <span className="font-mono font-bold text-slate-900">{document.docNumber}</span></p>
                  <p className="text-[11px] text-slate-600">Total Project Value: <span className="font-mono font-bold text-slate-900">{formatCurrency(document.grandTotal, company.currency)}</span></p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Official commercial billing corresponding to approved milestone schedule.</p>
                </div>
              </div>

              {/* Milestone Purpose Banner */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs">
                <span className="font-black text-indigo-950 block text-xs mb-0.5">Milestone: {milestoneTitle || `${percentage}% Payment Milestone`}</span>
                <span className="text-indigo-900 text-[11px] leading-normal">{notes || `Official commercial invoice for proposal ${document.docNumber}`}</span>
              </div>

              {/* Items Table Section */}
              <div className="space-y-2 pt-1">
                <div className="border-b border-slate-200 pb-1">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                    Commercial Milestone Line Items
                  </h3>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Item & Scope Description</th>
                        <th className="py-2 px-2.5 text-center">Milestone Share</th>
                        <th className="py-2 px-3 text-right">Amount ({company.currency || "$"})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-white">
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          <span className="font-bold text-slate-900 block text-xs">{document.title}</span>
                          <span className="text-slate-600 text-[11px] mt-0.5 block">{milestoneTitle || "Contract Milestone Billing"}</span>
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-bold text-indigo-700 text-xs">{percentage}%</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                          {formatCurrency(subtotal, company.currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-1">
                <div className="w-full sm:w-72 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-xs">
                  <div className="flex justify-between items-center text-slate-600 text-[11px]">
                    <span className="font-medium">Milestone Subtotal:</span>
                    <span className="font-mono font-semibold">{formatCurrency(subtotal, company.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 text-[11px]">
                    <span className="font-medium">Tax / VAT ({taxRate}%):</span>
                    <span className="font-mono font-semibold">+{formatCurrency(taxAmount, company.currency)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between items-center font-black text-xs text-slate-900">
                    <span>Invoice Grand Total:</span>
                    <span className="font-mono text-sm text-indigo-700">{formatCurrency(grandTotal, company.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Bank & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-3 mt-1 text-xs text-slate-600">
                <div>
                  <div className="border-b border-slate-200 pb-1 mb-1.5">
                    <span className="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
                      Terms of Payment
                    </span>
                  </div>
                  <p className="leading-normal whitespace-pre-wrap text-slate-700 text-[11px]">{paymentTerms || company.paymentTerms || "Net 14 days"}</p>
                </div>
                <div>
                  <div className="border-b border-slate-200 pb-1 mb-1.5">
                    <span className="font-black text-slate-900 block uppercase tracking-wider text-[10px]">
                      Wire / Bank Transfer Details
                    </span>
                  </div>
                  <p className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                    {bankDetails || company.bankDetails || "Bank transfer details available upon request."}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-3 mt-1 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-6 text-xs text-slate-500">
                <div>
                  <div className="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1 font-serif italic text-slate-800 text-xs">
                    {document.providerSignatureUrl || company.signatureImageUrl ? (
                      <img
                        src={document.providerSignatureUrl || company.signatureImageUrl}
                        alt="Signature"
                        className="max-h-8 max-w-[140px] object-contain"
                      />
                    ) : (
                      document.providerSignatoryName || company.signatoryName || `${company.name} Authorized Signatory`
                    )}
                  </div>
                  <p className="font-bold text-slate-800 text-[11px]">{document.providerSignatoryTitle || company.signatoryTitle || "Authorized Financial Representative"}</p>
                  <p className="text-slate-500 text-[10px]">{document.providerSignatorySubtitle || company.signatorySubtitle || company.name}</p>
                </div>
                <div>
                  <div className="w-full border-b border-slate-300 mb-1.5 min-h-8 flex items-end pb-1 font-serif italic text-slate-800 text-xs">
                    {document.clientName}
                  </div>
                  <p className="font-bold text-slate-800 text-[11px]">Client Acceptance & Billing Contact</p>
                  <p className="text-slate-500 text-[10px]">{document.clientCompany || document.clientName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppSend}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              title="Send invoice via WhatsApp with PDF attachment"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
              <span>WhatsApp + PDF</span>
            </button>

            <button
              type="button"
              onClick={handleEmailSend}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              title="Send invoice via Email with PDF attachment"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email + PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              title="Directly download formatted PDF invoice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              title="Open print preview window"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Layout</span>
            </button>

            {onOpenReceiptModal && (
              <button
                type="button"
                onClick={() => {
                  const tempInvoice: Invoice = {
                    id: initialInvoice?.id || `inv_${Date.now()}`,
                    invoiceNumber,
                    proposalId: document.id,
                    proposalDocNumber: document.docNumber,
                    proposalTitle: document.title,
                    clientId: document.clientId,
                    clientName: document.clientName,
                    clientCompany: document.clientCompany,
                    clientEmail: document.clientEmail,
                    clientAddress: document.clientAddress,
                    issueDate,
                    dueDate,
                    status,
                    percentage,
                    subtotal,
                    taxRate,
                    taxAmount,
                    discount,
                    grandTotal,
                    amountPaid: status === "Paid" ? grandTotal : (initialInvoice?.amountPaid || 0),
                    balanceDue: status === "Paid" ? 0 : grandTotal - (initialInvoice?.amountPaid || 0),
                    milestoneTitle,
                    createdAt: initialInvoice?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  onOpenReceiptModal(tempInvoice);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Issue Payment Receipt</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
