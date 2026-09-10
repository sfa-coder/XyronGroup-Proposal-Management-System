import React, { useState, useEffect } from "react";
import { ProposalDocument, Invoice, PaymentReceipt, CompanyProfile, PaymentMethod, PaymentReceiptStatus } from "../types";
import { formatCurrency, generateReceiptNumber } from "../utils/storage";
import {
  printCleanDocument,
  downloadDocumentFile,
  buildReceiptHtml,
  generatePdfBlobFromHtml,
  downloadPdfBlob,
  shareDocumentWithPdf,
} from "../utils/pdfExport";
import {
  Receipt,
  X,
  Check,
  Printer,
  Download,
  Calendar,
  CreditCard,
  Building2,
  Eye,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProposalDocument | null;
  invoice?: Invoice | null;
  initialReceipt?: PaymentReceipt | null;
  existingReceipts: PaymentReceipt[];
  existingInvoices: Invoice[];
  company: CompanyProfile;
  onSaveReceipt: (receipt: PaymentReceipt) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  document,
  invoice,
  initialReceipt,
  existingReceipts,
  existingInvoices,
  company,
  onSaveReceipt,
  showToast,
}) => {
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");

  // Form State
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [transactionReference, setTransactionReference] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [receivedBy, setReceivedBy] = useState(`${company.name} Accounts Dept`);
  const [notes, setNotes] = useState("Payment received with thanks. Official payment acknowledgment receipt.");
  const [status, setStatus] = useState<PaymentReceiptStatus>("Settled");

  // Calculate prior payments and balances
  const docReceipts = document ? existingReceipts.filter((r) => r.proposalId === document.id && (!initialReceipt || r.id !== initialReceipt.id)) : [];
  const priorTotalPaid = docReceipts.reduce((acc, r) => acc + (r.status === "Settled" ? r.amountPaid : 0), 0);

  useEffect(() => {
    if (!isOpen || !document) return;

    if (initialReceipt) {
      setReceiptNumber(initialReceipt.receiptNumber);
      setPaymentDate(initialReceipt.paymentDate);
      setPaymentMethod(initialReceipt.paymentMethod);
      setTransactionReference(initialReceipt.transactionReference);
      setAmountPaid(initialReceipt.amountPaid);
      setReceivedBy(initialReceipt.receivedBy || `${company.name} Accounts Dept`);
      setNotes(initialReceipt.notes || "Payment received with thanks.");
      setStatus(initialReceipt.status);
    } else {
      const newNumber = generateReceiptNumber(existingReceipts);
      setReceiptNumber(newNumber);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("Bank Transfer");
      setTransactionReference(`TXN-${Date.now().toString().slice(-6)}`);
      setStatus("Settled");
      setReceivedBy(`${company.name} Accounts Dept`);

      // Default amount based on linked invoice or proposal remainder
      if (invoice) {
        setAmountPaid(invoice.grandTotal);
        setNotes(`Payment received in full for Invoice ${invoice.invoiceNumber} (${invoice.milestoneTitle || "Milestone"}).`);
      } else {
        const remaining = Math.max(0, document.grandTotal - priorTotalPaid);
        setAmountPaid(remaining > 0 ? remaining : document.grandTotal);
        setNotes(`Official receipt for project ${document.docNumber} - ${document.title}.`);
      }
    }
    setActiveView("edit");
  }, [isOpen, document, invoice, initialReceipt]);

  if (!isOpen || !document) return null;

  const totalPaidWithThis = priorTotalPaid + amountPaid;
  const remainingBalance = Math.max(0, document.grandTotal - totalPaidWithThis);

  const handleSave = () => {
    if (amountPaid <= 0) {
      showToast("Invalid Amount", "Payment amount must be greater than zero.", "warning");
      return;
    }

    const savedReceipt: PaymentReceipt = {
      id: initialReceipt?.id || `rec_${Date.now()}`,
      receiptNumber,
      invoiceId: invoice?.id,
      invoiceNumber: invoice?.invoiceNumber,
      proposalId: document.id,
      proposalDocNumber: document.docNumber,
      proposalTitle: document.title,
      clientId: document.clientId,
      clientName: document.clientName,
      clientCompany: document.clientCompany,
      clientEmail: document.clientEmail,
      clientAddress: document.clientAddress,
      paymentDate,
      paymentMethod,
      transactionReference,
      amountPaid,
      currency: company.currency,
      notes,
      receivedBy,
      status,
      createdAt: initialReceipt?.createdAt || new Date().toISOString(),
      isCompleted: document.isCompleted || document.status === "Completed",
    };

    onSaveReceipt(savedReceipt);
    showToast(
      initialReceipt ? "Receipt Updated" : "Payment Receipt Issued",
      `${savedReceipt.receiptNumber} (${formatCurrency(savedReceipt.amountPaid, company.currency)}) recorded.`,
      "success"
    );
    onClose();
  };

  const [isExporting, setIsExporting] = useState(false);

  const getReceiptHtmlContent = () => {
    return buildReceiptHtml(
      {
        receiptNumber,
        paymentDate,
        paymentMethod,
        transactionReference,
        amountPaid,
        receivedBy,
        notes,
        status,
      },
      document,
      company,
      invoice,
      priorTotalPaid
    );
  };

  const handleWhatsAppSend = async () => {
    setIsExporting(true);
    const message = `Dear ${document.clientName},\n\nWe have successfully received your payment of *${formatCurrency(amountPaid, company.currency)}* via *${paymentMethod}* (Ref: ${transactionReference}).\n\n• *Receipt #*: ${receiptNumber}\n• *Project*: ${document.title} (${document.docNumber})\n• *Payment Date*: ${paymentDate}\n• *Remaining Balance*: ${formatCurrency(remainingBalance, company.currency)}\n\nThank you for choosing *${company.name}*!\n\nReceipt Acknowledgment Seal: VERIFIED-SETTLED`;
    try {
      const html = getReceiptHtmlContent();
      const filename = `Receipt_${receiptNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Receipt ${receiptNumber} - ${company.name}`,
        html
      );

      await shareDocumentWithPdf({
        channel: "whatsapp",
        pdfBlob: blob,
        filename,
        title: `Payment Receipt ${receiptNumber} - ${company.name}`,
        text: message,
      });

      showToast(
        "WhatsApp & PDF Dispatched",
        `Receipt ${receiptNumber}.pdf downloaded. Attach it to your WhatsApp conversation!`,
        "success"
      );
    } catch (err) {
      console.warn("Receipt WhatsApp fallback:", err);
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      showToast("WhatsApp Opened", "Receipt acknowledgment prepared for client chat.", "success");
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailSend = async () => {
    setIsExporting(true);
    const subject = `Official Payment Receipt ${receiptNumber} - ${company.name}`;
    const body = `Dear ${document.clientName},\n\nWe have successfully received and verified your payment of ${formatCurrency(amountPaid, company.currency)} for "${document.title}".\n\nReceipt Details:\n• Receipt Number: ${receiptNumber}\n• Payment Date: ${paymentDate}\n• Payment Method: ${paymentMethod}\n• Transaction Reference: ${transactionReference || "Direct Settlement"}\n• Amount Received: ${formatCurrency(amountPaid, company.currency)}\n• Contract Remaining Balance: ${formatCurrency(remainingBalance, company.currency)}\n\nPlease find attached the official verified payment receipt document.\n\nThank you for your business!\n\nBest regards,\n${company.name} Accounts`;
    try {
      const html = getReceiptHtmlContent();
      const filename = `Receipt_${receiptNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Receipt ${receiptNumber} - ${company.name}`,
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
        `Receipt ${receiptNumber}.pdf downloaded and email client opened ready to send!`,
        "success"
      );
    } catch (err) {
      console.warn("Receipt Email fallback:", err);
      const mailtoUrl = `mailto:${encodeURIComponent(document.clientEmail || "")}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, "_blank");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPDF = () => {
    const html = getReceiptHtmlContent();
    printCleanDocument(`Receipt-${receiptNumber}`, html);
    showToast("Print Ready", `Receipt ${receiptNumber} opened in clean print window.`, "info");
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const html = getReceiptHtmlContent();
      const filename = `Receipt_${receiptNumber}.pdf`;
      const blob = await generatePdfBlobFromHtml(
        `Receipt ${receiptNumber} - ${company.name}`,
        html
      );
      downloadPdfBlob(blob, filename);
      showToast("PDF Downloaded", `Receipt ${receiptNumber}.pdf saved to your device.`, "success");
    } catch (err) {
      console.warn("PDF fallback to html file:", err);
      const html = getReceiptHtmlContent();
      downloadDocumentFile(`Receipt-${receiptNumber}`, `Receipt ${receiptNumber} - ${company.name}`, html);
      showToast("File Downloaded", `Payment Receipt ${receiptNumber} downloaded to your computer.`, "success");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {initialReceipt ? "Edit Payment Receipt" : "Record Payment & Issue Receipt"}
                </h2>
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                  {receiptNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {document.docNumber} • {document.clientName} ({document.clientCompany})
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
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeView === "preview"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Receipt PDF</span>
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

        {/* Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {activeView === "edit" ? (
            <div className="space-y-6">
              {/* Financial Balance Overview Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Proposal Total
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {formatCurrency(document.grandTotal, company.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Prior Paid
                  </span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(priorTotalPaid, company.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                    This Receipt
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                    {formatCurrency(amountPaid, company.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Balance After
                  </span>
                  <span className={`font-black text-sm ${remainingBalance === 0 ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"}`}>
                    {remainingBalance === 0 ? "100% Settled" : formatCurrency(remainingBalance, company.currency)}
                  </span>
                </div>
              </div>

              {/* Amount Received Input & Quick Presets */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Amount Received / Paid ({company.currency})
                  </label>
                  {invoice && (
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Linked to Invoice {invoice.invoiceNumber}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xl font-black text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white dark:bg-slate-900"
                  />
                  <span className="absolute right-4 top-3 text-slate-400 font-bold text-sm">
                    {company.currency}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Quick Fill:</span>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(document.grandTotal)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 cursor-pointer"
                  >
                    100% Full Proposal ({formatCurrency(document.grandTotal, company.currency)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(Math.round(document.grandTotal * 0.5 * 100) / 100)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 cursor-pointer"
                  >
                    50% Deposit ({formatCurrency(document.grandTotal * 0.5, company.currency)})
                  </button>
                  {invoice && (
                    <button
                      type="button"
                      onClick={() => setAmountPaid(invoice.grandTotal)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100 cursor-pointer"
                    >
                      Invoice Amount ({formatCurrency(invoice.grandTotal, company.currency)})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 cursor-pointer"
                  >
                    <option value="Bank Transfer">Bank Transfer / Wire</option>
                    <option value="Credit Card">Credit / Debit Card</option>
                    <option value="Stripe">Stripe Online</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online Gateway">Online Payment Gateway</option>
                  </select>
                </div>
              </div>

              {/* Transaction Reference & Received By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction / Reference ID or Cheque #
                  </label>
                  <input
                    type="text"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    placeholder="e.g. WIRE-89324021 or Cheque #1042"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Received By (Staff / Dept)
                  </label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="e.g. Accounts Department"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Receipt Notes & Acknowledgment
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 resize-none"
                />
              </div>
            </div>
          ) : (
            /* Branded Official Receipt PDF View */
            <div className="p-5 sm:p-7 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-inner space-y-4 max-w-3xl mx-auto font-sans">
              {/* Header */}
              <div className="flex flex-col sm:flex-row print:flex-row items-start justify-between gap-3 border-b border-slate-200 pb-3.5">
                <div className="space-y-1 max-w-sm">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="max-h-11 max-w-[170px] object-contain mb-1" />
                  ) : (
                    <h1 className="text-xl font-black tracking-tight text-emerald-900">{company.name}</h1>
                  )}
                  <div className="text-[11px] text-slate-600 space-y-0.5 mt-0.5 font-medium leading-tight">
                    <p className="font-bold text-slate-900 text-xs">{company.name}</p>
                    <p>{company.address || ""}</p>
                    <p>Email: {company.email || ""} {company.phone ? `| Tel: ${company.phone}` : ""}</p>
                    {company.taxId && <p className="font-mono text-slate-500 text-[10px]">Tax ID / VAT: {company.taxId}</p>}
                  </div>
                </div>
                <div className="w-full sm:w-auto print:w-auto text-left sm:text-right print:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider mb-1">
                    OFFICIAL PAYMENT RECEIPT
                  </span>
                  <h2 className="text-base font-mono font-bold text-slate-900 leading-tight">{receiptNumber}</h2>
                  <div className="text-[11px] text-slate-600 space-y-0.5 mt-1.5">
                    <p><span className="font-bold text-slate-800">Date:</span> {paymentDate}</p>
                    <p><span className="font-bold text-slate-800">Method:</span> <span className="font-semibold text-slate-900">{paymentMethod}</span></p>
                    <p><span className="font-bold text-slate-800">Status:</span> <span className="font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase text-[10px]">Paid & Settled</span></p>
                  </div>
                </div>
              </div>

              {/* Receipt Details Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-black text-slate-500 uppercase tracking-wider text-[9px] block mb-1">
                    RECEIVED FROM (CLIENT)
                  </span>
                  <p className="font-black text-slate-900 text-sm">{document.clientName}</p>
                  {document.clientCompany && <p className="font-bold text-slate-800 text-xs">{document.clientCompany}</p>}
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{document.clientAddress || ""}</p>
                  <p className="text-[11px] text-slate-600">{document.clientEmail || ""}</p>
                </div>
                <div>
                  <span className="font-black text-slate-500 uppercase tracking-wider text-[9px] block mb-1">
                    TRANSACTION METADATA
                  </span>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <p><span className="font-bold text-slate-800">Reference / TXN:</span> <span className="font-mono font-semibold text-slate-900">{transactionReference || "Direct Settlement"}</span></p>
                    <p><span className="font-bold text-slate-800">Proposal Reference:</span> <span className="font-mono font-semibold text-slate-900">{document.docNumber}</span></p>
                    <p><span className="font-bold text-slate-800">Received By:</span> <span className="font-semibold text-slate-900">{receivedBy}</span></p>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2 pt-1">
                <div className="border-b border-slate-200 pb-1">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                    Payment Allocation Summary
                  </h3>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Payment Purpose / Description</th>
                        <th className="py-2 px-3 text-right">Amount Received ({company.currency || "$"})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-white">
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          <span className="font-bold text-slate-900 block text-xs">Payment towards {document.title}</span>
                          <span className="text-slate-600 text-[11px] mt-0.5 block">Document Reference: {document.docNumber}</span>
                          {invoice && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              Linked Invoice: {invoice.invoiceNumber} — {invoice.milestoneTitle || `${invoice.percentage}% Milestone`}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                          {formatCurrency(amountPaid, company.currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Balance Summary Box */}
              <div className="flex justify-end pt-1">
                <div className="w-full sm:w-72 bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs shadow-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="font-medium">Total Project Contract:</span>
                    <span className="font-mono font-semibold text-slate-200">{formatCurrency(document.grandTotal, company.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 text-[11px]">
                    <span className="font-medium">Amount Received Now:</span>
                    <span className="font-mono font-bold">{formatCurrency(amountPaid, company.currency)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between items-center font-black text-xs">
                    <span className="text-slate-300">Remaining Balance:</span>
                    <span className="font-mono text-sm text-amber-400">
                      {remainingBalance <= 0 ? "0.00 (Fully Settled)" : formatCurrency(remainingBalance, company.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-normal">
                  <span className="font-bold text-slate-900 block mb-0.5 text-[11px]">Receipt Notes:</span>
                  {notes}
                </div>
              )}

              {/* Official Seal & Signature Block */}
              <div className="pt-3 mt-1 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                <div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center text-center p-1 text-[7px] font-bold text-emerald-800 bg-emerald-50/50 rotate-[-8deg] shadow-xs">
                    <span className="tracking-widest uppercase text-[6px] text-emerald-600">Verified</span>
                    <span className="font-black text-[9px] text-emerald-900 my-0.5">OFFICIAL RECEIPT</span>
                    <span className="font-mono text-[7px]">{paymentDate}</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-600 mt-1.5">Received By: <span className="font-bold text-slate-800">{receivedBy}</span></p>
                </div>
                <div className="text-right">
                  <div className="w-48 border-b border-slate-300 pb-1 text-slate-800 font-serif italic text-xs min-h-8 flex items-end justify-end">
                    {company.signatureImageUrl ? (
                      <img
                        src={company.signatureImageUrl}
                        alt="Signature"
                        className="max-h-8 max-w-[140px] object-contain"
                      />
                    ) : (
                      company.signatoryName || `${company.name} Accounts`
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block mt-1">
                    {company.signatoryTitle || "Authorized Cashier / Finance Desk"}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{company.signatorySubtitle || company.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppSend}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              title="Send receipt via WhatsApp with PDF attachment"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
              <span>WhatsApp + PDF</span>
            </button>

            <button
              type="button"
              onClick={handleEmailSend}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              title="Send receipt via Email with PDF attachment"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email + PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              title="Directly download formatted PDF receipt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              title="Open print preview dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Layout</span>
            </button>
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
