import React, { useState } from "react";
import { ProposalDocument, Invoice, PaymentReceipt, CompanyProfile } from "../types";
import { formatCurrency } from "../utils/storage";
import {
  CheckCircle2,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  Receipt,
  Eye,
  Printer,
  RotateCcw,
  Sparkles,
  DollarSign,
  Calendar,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FolderCheck,
  CheckCheck,
  Zap,
} from "lucide-react";

interface CompletedProjectsProps {
  documents: ProposalDocument[];
  invoices: Invoice[];
  receipts: PaymentReceipt[];
  company: CompanyProfile;
  onReopenProject: (docId: string) => void;
  onPreviewPDF: (doc: ProposalDocument) => void;
  onOpenInvoiceModal: (doc: ProposalDocument, invoice?: Invoice) => void;
  onOpenReceiptModal: (doc: ProposalDocument, invoice?: Invoice, receipt?: PaymentReceipt) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const CompletedProjects: React.FC<CompletedProjectsProps> = ({
  documents,
  invoices,
  receipts,
  company,
  onReopenProject,
  onPreviewPDF,
  onOpenInvoiceModal,
  onOpenReceiptModal,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("All");
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Filter completed documents (either status is Completed or isCompleted flag is true)
  const completedDocs = documents.filter(
    (doc) => doc.status === "Completed" || doc.isCompleted === true
  );

  // Unique clients for filter
  const clientOptions = Array.from(new Set(completedDocs.map((d) => d.clientName).filter(Boolean)));

  const filteredDocs = completedDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientCompany.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClient = selectedClient === "All" || doc.clientName === selectedClient;

    return matchesSearch && matchesClient;
  });

  // Calculate Metrics
  const totalRevenue = completedDocs.reduce((acc, d) => acc + (d.grandTotal || 0), 0);
  const totalSettledReceipts = completedDocs.reduce((acc, doc) => {
    const docReceipts = receipts.filter((r) => r.proposalId === doc.id && r.status === "Settled");
    return acc + docReceipts.reduce((sum, r) => sum + r.amountPaid, 0);
  }, 0);

  const toggleExpand = (id: string) => {
    setExpandedDocId(expandedDocId === id ? null : id);
  };

  const handleSendCompletionWhatsApp = (doc: ProposalDocument) => {
    const message = `Hello ${doc.clientName},\n\nWe are pleased to confirm that all milestones and deliverables for *${doc.title}* (${doc.docNumber}) have been successfully completed and delivered in full.\n\n• *Total Project Value*: ${formatCurrency(doc.grandTotal, company.currency)}\n• *Status*: Fully Delivered & Archived\n\nThank you for collaborating with *${company.name}*! We look forward to our next project together.\n\nBest regards,\n*${company.name}*`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    showToast("WhatsApp Opened", "Project completion sign-off note prepared.", "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <FolderCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Completed Projects Archive
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {completedDocs.length} Completed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Archived proposals, delivered contracts, milestone invoices, and official payment receipts
            </p>
          </div>
        </div>
      </div>

      {/* Financial Scorecard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Realized Revenue
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(totalRevenue, company.currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Payments Collected & Settled
            </span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(totalSettledReceipts, company.currency)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Delivery Success Rate
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              100% On-Time
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search completed project #, title, client..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Client:</span>
          </div>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:outline-none font-medium cursor-pointer"
          >
            <option value="All">All Clients ({clientOptions.length})</option>
            {clientOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Completed Projects List */}
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <FolderCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No Completed Projects Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When a proposal or quotation is delivered and you select <span className="font-bold text-emerald-600">"Set Completed"</span> in the Document Directory, the project, all its invoices, and payment receipts will automatically move here!
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isExpanded = expandedDocId === doc.id;
            const docInvoices = invoices.filter((inv) => inv.proposalId === doc.id);
            const docReceipts = receipts.filter((r) => r.proposalId === doc.id);
            const docTotalPaid = docReceipts.reduce(
              (sum, r) => sum + (r.status === "Settled" ? r.amountPaid : 0),
              0
            );
            const balanceDue = Math.max(0, doc.grandTotal - docTotalPaid);

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-emerald-500/30"
              >
                {/* Main Card Header Bar */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Completed & Delivered
                      </span>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg">
                        {doc.docNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        Completed: {doc.completedAt ? new Date(doc.completedAt).toLocaleDateString() : doc.issueDate}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {doc.title}
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Client: <span className="font-bold text-slate-800 dark:text-slate-200">{doc.clientName}</span> ({doc.clientCompany}) • {doc.clientEmail}
                    </p>
                  </div>

                  {/* Financial Settlement Card & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-right min-w-[150px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Value
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white block">
                        {formatCurrency(doc.grandTotal, company.currency)}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                          balanceDue === 0
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {balanceDue === 0 ? "100% Settled" : `Balance: ${formatCurrency(balanceDue, company.currency)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPreviewPDF(doc)}
                        className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
                        title="View Original Proposal PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendCompletionWhatsApp(doc)}
                        className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="Send Thank You & Completion on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onReopenProject(doc.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Move back to Active Proposals"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpand(doc.id)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse dossier" : "Expand project dossier"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Project Dossier (Invoices, Receipts, Milestone Breakdown) */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      {/* Invoices Dossier */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                              Project Invoices ({docInvoices.length})
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenInvoiceModal(doc)}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            + Add Invoice
                          </button>
                        </div>

                        {docInvoices.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">No invoices generated for this project yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {docInvoices.map((inv) => (
                              <div
                                key={inv.id}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded">
                                      {inv.percentage}%
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded">
                                      {inv.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                                    {inv.milestoneTitle || "Milestone"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(inv.grandTotal, company.currency)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenInvoiceModal(doc, inv)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer"
                                    title="View / Edit Invoice"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Payment Receipts Dossier */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                              Payment Receipts ({docReceipts.length})
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenReceiptModal(doc)}
                            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            + Issue Receipt
                          </button>
                        </div>

                        {docReceipts.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">No receipts recorded yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {docReceipts.map((rec) => (
                              <div
                                key={rec.id}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{rec.receiptNumber}</span>
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded">
                                      {rec.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {rec.paymentMethod} • {rec.paymentDate}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-600">
                                    {formatCurrency(rec.amountPaid, company.currency)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenReceiptModal(doc, undefined, rec)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-amber-600 cursor-pointer"
                                    title="View / Print Receipt"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scope & Deliverables Delivered */}
                    {doc.deliverables && doc.deliverables.length > 0 && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Delivered Tangibles
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {doc.deliverables.map((deliv, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{deliv}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
