import React, { useState, useMemo } from "react";
import {
  ProposalDocument,
  Invoice,
  PaymentReceipt,
  CompanyProfile,
  InvoiceStatus,
  PaymentReceiptStatus,
} from "../types";
import { formatCurrency } from "../utils/storage";
import {
  FileSpreadsheet,
  Receipt,
  Search,
  Filter,
  Plus,
  Printer,
  MessageCircle,
  Mail,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Layers,
  ArrowUpDown,
  Building2,
  User,
  ShieldCheck,
  Download,
  Eye,
} from "lucide-react";
import {
  buildInvoiceHtml,
  buildReceiptHtml,
  downloadDocumentFile,
  generatePdfBlobFromHtml,
  downloadPdfBlob,
  shareDocumentWithPdf,
  printCleanDocument,
} from "../utils/pdfExport";

interface InvoicesAndReceiptsViewProps {
  documents: ProposalDocument[];
  invoices: Invoice[];
  receipts: PaymentReceipt[];
  company: CompanyProfile;
  onOpenInvoiceModal: (doc: ProposalDocument, invoice?: Invoice) => void;
  onOpenReceiptModal: (doc: ProposalDocument, invoice?: Invoice, receipt?: PaymentReceipt) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onDeleteReceipt: (receiptId: string) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const InvoicesAndReceiptsView: React.FC<InvoicesAndReceiptsViewProps> = ({
  documents,
  invoices,
  receipts,
  company,
  onOpenInvoiceModal,
  onOpenReceiptModal,
  onDeleteInvoice,
  onDeleteReceipt,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<"invoices" | "receipts">("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [dateFilter, setDateFilter] = useState<"all" | "30days" | "month" | "year">("all");

  const currency = company.currency || "$";

  // Build document lookup map for fast details
  const docMap = useMemo(() => {
    const map: Record<string, ProposalDocument> = {};
    documents.forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [documents]);

  // Unique list of clients across invoices & receipts
  const clientOptions = useMemo(() => {
    const clientsSet = new Set<string>();
    invoices.forEach((inv) => {
      const doc = docMap[inv.proposalId];
      if (doc?.clientName) clientsSet.add(doc.clientName);
    });
    receipts.forEach((rec) => {
      const doc = docMap[rec.proposalId];
      if (doc?.clientName) clientsSet.add(doc.clientName);
    });
    return Array.from(clientsSet);
  }, [invoices, receipts, docMap]);

  // Financial Aggregate Stats
  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const totalCollected = receipts
      .filter((r) => r.status === "Settled" || !r.status)
      .reduce((sum, r) => sum + (r.amountPaid || 0), 0);
    const pendingBalance = Math.max(0, totalInvoiced - totalCollected);
    const collectionRate = totalInvoiced > 0 ? Math.min(100, Math.round((totalCollected / totalInvoiced) * 100)) : 0;

    return {
      totalInvoiced,
      totalCollected,
      pendingBalance,
      collectionRate,
      invoiceCount: invoices.length,
      receiptCount: receipts.length,
    };
  }, [invoices, receipts]);

  // Date filter checker helper
  const matchesDateRange = (dateString?: string) => {
    if (dateFilter === "all" || !dateString) return true;
    const date = new Date(dateString).getTime();
    const now = Date.now();
    if (isNaN(date)) return true;

    if (dateFilter === "30days") {
      return now - date <= 30 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === "month") {
      const d = new Date(dateString);
      const today = new Date();
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    if (dateFilter === "year") {
      const d = new Date(dateString);
      return d.getFullYear() === new Date().getFullYear();
    }
    return true;
  };

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const doc = docMap[inv.proposalId];
        const clientName = doc?.clientName || "";
        const clientCompany = doc?.clientCompany || "";
        const docTitle = doc?.title || "";
        const docNumber = doc?.docNumber || "";

        const matchesSearch =
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.milestoneTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
        const matchesClient = clientFilter === "All" || clientName === clientFilter;
        const matchesDate = matchesDateRange(inv.issueDate);

        return matchesSearch && matchesStatus && matchesClient && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.issueDate || b.createdAt || 0).getTime() - new Date(a.issueDate || a.createdAt || 0).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.issueDate || a.createdAt || 0).getTime() - new Date(b.issueDate || b.createdAt || 0).getTime();
        }
        if (sortBy === "highest") {
          return (b.grandTotal || 0) - (a.grandTotal || 0);
        }
        if (sortBy === "lowest") {
          return (a.grandTotal || 0) - (b.grandTotal || 0);
        }
        return 0;
      });
  }, [invoices, docMap, searchTerm, statusFilter, clientFilter, sortBy, dateFilter]);

  // Filtered & Sorted Receipts
  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((rec) => {
        const doc = docMap[rec.proposalId];
        const clientName = doc?.clientName || "";
        const clientCompany = doc?.clientCompany || "";
        const docTitle = doc?.title || "";
        const docNumber = doc?.docNumber || "";

        const matchesSearch =
          rec.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rec.transactionReference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rec.paymentMethod || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rec.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" || rec.status === statusFilter;
        const matchesClient = clientFilter === "All" || clientName === clientFilter;
        const matchesDate = matchesDateRange(rec.paymentDate);

        return matchesSearch && matchesStatus && matchesClient && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.paymentDate || b.createdAt || 0).getTime() - new Date(a.paymentDate || a.createdAt || 0).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.paymentDate || a.createdAt || 0).getTime() - new Date(b.paymentDate || b.createdAt || 0).getTime();
        }
        if (sortBy === "highest") {
          return (b.amountPaid || 0) - (a.amountPaid || 0);
        }
        if (sortBy === "lowest") {
          return (a.amountPaid || 0) - (b.amountPaid || 0);
        }
        return 0;
      });
  }, [receipts, docMap, searchTerm, statusFilter, clientFilter, sortBy, dateFilter]);

  // Handlers for Quick Print / WhatsApp / Email
  const handlePrintInvoice = (inv: Invoice) => {
    const doc = docMap[inv.proposalId] || {
      id: inv.proposalId,
      docNumber: "INV-DOC",
      title: "Commercial Invoice Scope",
      clientName: "Valued Client",
      clientCompany: "",
      grandTotal: inv.grandTotal,
    };
    const html = buildInvoiceHtml(inv, doc as any, company);
    printCleanDocument(`Invoice ${inv.invoiceNumber} - ${company.name}`, html);
    showToast("Print Ready", `Opened print window for Invoice ${inv.invoiceNumber}.`, "success");
  };

  const handleWhatsAppInvoice = async (inv: Invoice) => {
    const doc = docMap[inv.proposalId];
    const clientName = doc?.clientName || "Client";
    const message = `Hello ${clientName},\n\nPlease find your Commercial Invoice *${inv.invoiceNumber}* from *${company.name}*.\n\n• *Amount*: ${formatCurrency(inv.grandTotal, currency)}\n• *Due Date*: ${inv.dueDate}\n• *Milestone*: ${inv.milestoneTitle || "Milestone"}\n\nKindly review and process at your earliest convenience.\n\nBest regards,\n${company.name}`;
    
    try {
      const html = buildInvoiceHtml(inv, doc || ({ docNumber: "REF", title: "Services", grandTotal: inv.grandTotal, clientName } as any), company);
      const blob = await generatePdfBlobFromHtml(`Invoice ${inv.invoiceNumber}`, html);
      await shareDocumentWithPdf({
        channel: "whatsapp",
        pdfBlob: blob,
        filename: `${inv.invoiceNumber}.pdf`,
        title: `Invoice ${inv.invoiceNumber}`,
        text: message,
        phone: doc?.clientAddress || "",
        showToast,
      });
    } catch (e) {
      console.warn("WhatsApp dispatch fallback:", e);
      const encoded = encodeURIComponent(message);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    }
  };

  const handlePrintReceipt = (rec: PaymentReceipt) => {
    const doc = docMap[rec.proposalId] || {
      id: rec.proposalId,
      docNumber: "REC-DOC",
      title: "Payment Receipt Scope",
      clientName: "Valued Client",
      clientCompany: "",
      grandTotal: rec.amountPaid,
    };
    const inv = invoices.find((i) => i.id === rec.invoiceId);
    const html = buildReceiptHtml(rec, doc as any, company, inv, 0);
    printCleanDocument(`Receipt ${rec.receiptNumber} - ${company.name}`, html);
    showToast("Print Ready", `Opened print window for Receipt ${rec.receiptNumber}.`, "success");
  };

  const handleWhatsAppReceipt = async (rec: PaymentReceipt) => {
    const doc = docMap[rec.proposalId];
    const clientName = doc?.clientName || "Client";
    const message = `Hello ${clientName},\n\nPayment received with thanks! Official Payment Receipt *${rec.receiptNumber}* has been issued by *${company.name}*.\n\n• *Amount Settled*: ${formatCurrency(rec.amountPaid, currency)}\n• *Date*: ${rec.paymentDate}\n• *Payment Method*: ${rec.paymentMethod}\n• *Transaction ID*: ${rec.transactionReference || "Verified"}\n\nBest regards,\n${company.name} Accounts`;

    try {
      const inv = invoices.find((i) => i.id === rec.invoiceId);
      const html = buildReceiptHtml(rec, doc || ({ docNumber: "REF", title: "Services", grandTotal: rec.amountPaid, clientName } as any), company, inv, 0);
      const blob = await generatePdfBlobFromHtml(`Receipt ${rec.receiptNumber}`, html);
      await shareDocumentWithPdf({
        channel: "whatsapp",
        pdfBlob: blob,
        filename: `${rec.receiptNumber}.pdf`,
        title: `Receipt ${rec.receiptNumber}`,
        text: message,
        phone: doc?.clientAddress || "",
        showToast,
      });
    } catch (e) {
      console.warn("WhatsApp receipt fallback:", e);
      const encoded = encodeURIComponent(message);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    }
  };

  const getInvoiceStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Paid
          </span>
        );
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Sent
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Draft
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Financial Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(stats.totalInvoiced, currency)}
          </p>
          <p className="text-xs text-slate-500">{stats.invoiceCount} invoices recorded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats.totalCollected, currency)}
          </p>
          <p className="text-xs text-slate-500">{stats.receiptCount} receipts settled</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(stats.pendingBalance, currency)}
          </p>
          <p className="text-xs text-slate-500">Awaiting payment settlement</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Collection Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.collectionRate}%
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Invoices & Payment Receipts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track, search, and manage all commercial billings, milestones, and verified cash receipts.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start md:self-auto">
            <button
              onClick={() => {
                setActiveTab("invoices");
                setStatusFilter("All");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "invoices"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Invoices ({invoices.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("receipts");
                setStatusFilter("All");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "receipts"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Receipts ({receipts.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Multi-Criteria Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "invoices"
                  ? "Search by invoice #, client, proposal ref, milestone..."
                  : "Search by receipt #, client, transaction ID, payment method..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Status: All Statuses</option>
              {activeTab === "invoices" ? (
                <>
                  <option value="Paid">Paid</option>
                  <option value="Sent">Sent</option>
                  <option value="Draft">Draft</option>
                  <option value="Overdue">Overdue</option>
                </>
              ) : (
                <>
                  <option value="Settled">Settled & Verified</option>
                  <option value="Pending">Pending</option>
                </>
              )}
            </select>
          </div>

          {/* Client Filter */}
          <div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Client: All Clients</option>
              {clientOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter & Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Content Table / Cards List */}
        {activeTab === "invoices" ? (
          /* INVOICES LIST */
          filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile View: High-contrast touch-friendly Cards */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                {filteredInvoices.map((inv) => {
                  const doc = docMap[inv.proposalId];
                  return (
                    <div key={inv.id} className="p-4 space-y-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                              {inv.percentage}% Share
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                            {inv.milestoneTitle || "Commercial Invoice Milestone"}
                          </p>
                        </div>
                        <div className="shrink-0">{getInvoiceStatusBadge(inv.status)}</div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {doc?.clientName || "Valued Client"}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Ref: {doc?.docNumber || "PROP"}
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-black text-slate-900 dark:text-white text-sm block">
                            {formatCurrency(inv.grandTotal, currency)}
                          </span>
                          <span className="text-slate-400 text-[10px] block">
                            Due: {inv.dueDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <button
                          onClick={() => handlePrintInvoice(inv)}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Print / Save Invoice to PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (doc) onOpenReceiptModal(doc, inv);
                          }}
                          className="p-2 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Issue Payment Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppInvoice(inv)}
                          className="p-2 rounded-xl text-emerald-700 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Send Invoice via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (doc) onOpenInvoiceModal(doc, inv);
                          }}
                          className="p-2 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Edit Invoice"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          className="p-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Invoice # & Milestone</th>
                      <th className="py-3.5 px-4">Client & Project</th>
                      <th className="py-3.5 px-3">Issue / Due Date</th>
                      <th className="py-3.5 px-3 text-right">Amount ({currency})</th>
                      <th className="py-3.5 px-3 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredInvoices.map((inv) => {
                      const doc = docMap[inv.proposalId];
                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                {inv.invoiceNumber}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                {inv.percentage}% Share
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xs">
                              {inv.milestoneTitle || "Commercial Invoice Milestone"}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {doc?.clientName || "Valued Client"}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              {doc?.clientCompany ? `${doc.clientCompany} • ` : ""}
                              Ref: <span className="font-mono">{doc?.docNumber || "PROP"}</span>
                            </p>
                          </td>

                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                            <p className="font-medium">Issue: {inv.issueDate}</p>
                            <p className="text-slate-400 text-[11px]">Due: {inv.dueDate}</p>
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono">
                            <p className="font-black text-slate-900 dark:text-white text-sm">
                              {formatCurrency(inv.grandTotal, currency)}
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              Tax: {formatCurrency(inv.taxAmount, currency)} ({inv.taxRate}%)
                            </p>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            {getInvoiceStatusBadge(inv.status)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Preview & Print */}
                              <button
                                onClick={() => handlePrintInvoice(inv)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                                title="Print / Save Invoice to PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Record Payment */}
                              <button
                                onClick={() => {
                                  if (doc) onOpenReceiptModal(doc, inv);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                title="Issue Payment Receipt"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>

                              {/* WhatsApp */}
                              <button
                                onClick={() => handleWhatsAppInvoice(inv)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                title="Send Invoice via WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              {/* Edit Invoice */}
                              <button
                                onClick={() => {
                                  if (doc) onOpenInvoiceModal(doc, inv);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                                title="Edit Invoice"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete Invoice */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                    onDeleteInvoice(inv.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  No invoices found matching criteria
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== "All" || clientFilter !== "All"
                    ? "Try adjusting your search terms or filters."
                    : "Create milestones and generate commercial invoices from your proposals."}
                </p>
              </div>
            </div>
          )
        ) : (
          /* PAYMENT RECEIPTS LIST */
          filteredReceipts.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile View: High-contrast touch-friendly Cards */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                {filteredReceipts.map((rec) => {
                  const doc = docMap[rec.proposalId];
                  const linkedInv = invoices.find((i) => i.id === rec.invoiceId);
                  return (
                    <div key={rec.id} className="p-4 space-y-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                              {rec.receiptNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                              {rec.paymentMethod}
                            </span>
                          </div>
                          {linkedInv && (
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                              Settles: <span className="font-mono font-semibold">{linkedInv.invoiceNumber}</span>
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Verified
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {doc?.clientName || "Valued Client"}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Ref: {doc?.docNumber || "PROP"}
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                            {formatCurrency(rec.amountPaid, currency)}
                          </span>
                          <span className="text-slate-400 text-[10px] block">
                            Date: {rec.paymentDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <button
                          onClick={() => handlePrintReceipt(rec)}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:text-emerald-600 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Print / Save Receipt to PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppReceipt(rec)}
                          className="p-2 rounded-xl text-emerald-700 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Send Receipt via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (doc) onOpenReceiptModal(doc, linkedInv, rec);
                          }}
                          className="p-2 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Edit Receipt"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete receipt ${rec.receiptNumber}?`)) {
                              onDeleteReceipt(rec.id);
                            }
                          }}
                          className="p-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Receipt # & Method</th>
                      <th className="py-3.5 px-4">Paid By (Client)</th>
                      <th className="py-3.5 px-3">Date Settled</th>
                      <th className="py-3.5 px-3">Transaction Ref</th>
                      <th className="py-3.5 px-3 text-right">Amount Paid ({currency})</th>
                      <th className="py-3.5 px-3 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredReceipts.map((rec) => {
                      const doc = docMap[rec.proposalId];
                      const linkedInv = invoices.find((i) => i.id === rec.invoiceId);
                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                {rec.receiptNumber}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                {rec.paymentMethod}
                              </span>
                            </div>
                            {linkedInv && (
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                                Settles: <span className="font-mono font-semibold">{linkedInv.invoiceNumber}</span>
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {doc?.clientName || "Valued Client"}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              {doc?.clientCompany ? `${doc.clientCompany} • ` : ""}
                              Ref: <span className="font-mono">{doc?.docNumber || "PROP"}</span>
                            </p>
                          </td>

                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
                            {rec.paymentDate}
                          </td>

                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {rec.transactionReference || "N/A"}
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono">
                            <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              {formatCurrency(rec.amountPaid, currency)}
                            </p>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              Verified Paid
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Preview & Print */}
                              <button
                                onClick={() => handlePrintReceipt(rec)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                title="Print / Save Receipt to PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* WhatsApp */}
                              <button
                                onClick={() => handleWhatsAppReceipt(rec)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                title="Send Receipt via WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              {/* Edit Receipt */}
                              <button
                                onClick={() => {
                                  if (doc) onOpenReceiptModal(doc, linkedInv, rec);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                                title="Edit Receipt"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete Receipt */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete receipt ${rec.receiptNumber}?`)) {
                                    onDeleteReceipt(rec.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                title="Delete Receipt"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Receipt className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  No receipts found matching criteria
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== "All" || clientFilter !== "All"
                    ? "Try adjusting your search terms or filters."
                    : "Record payments to generate official payment acknowledgment receipts."}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
