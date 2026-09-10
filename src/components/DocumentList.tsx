import React, { useState } from "react";
import { ProposalDocument, CompanyProfile, Invoice, PaymentReceipt, DocumentStatus } from "../types";
import { formatCurrency } from "../utils/storage";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Copy,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Zap,
  Receipt,
  FolderCheck,
  Check,
  PenTool,
  Bell,
} from "lucide-react";

interface DocumentListProps {
  documents: ProposalDocument[];
  company: CompanyProfile;
  invoices?: Invoice[];
  receipts?: PaymentReceipt[];
  onOpenNewDoc: (type: "Proposal" | "Quotation") => void;
  onEditDoc: (doc: ProposalDocument) => void;
  onPreviewPDF: (doc: ProposalDocument) => void;
  onDuplicateDoc: (doc: ProposalDocument) => void;
  onUpdateStatus: (docId: string, status: DocumentStatus) => void;
  onDeleteDoc: (docId: string) => void;
  onOpenAutoSend?: (doc: ProposalDocument) => void;
  onOpenInvoiceModal?: (doc: ProposalDocument, invoice?: Invoice) => void;
  onOpenReceiptModal?: (doc: ProposalDocument, invoice?: Invoice, receipt?: PaymentReceipt) => void;
  onOpenESignature?: (doc: ProposalDocument) => void;
  onOpenReminderTemplates?: (doc?: ProposalDocument) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  company,
  invoices = [],
  receipts = [],
  onOpenNewDoc,
  onEditDoc,
  onPreviewPDF,
  onDuplicateDoc,
  onUpdateStatus,
  onDeleteDoc,
  onOpenAutoSend,
  onOpenInvoiceModal,
  onOpenReceiptModal,
  onOpenESignature,
  onOpenReminderTemplates,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [docToDelete, setDocToDelete] = useState<ProposalDocument | null>(null);

  // Show active documents by default (or all if filtered)
  const filteredDocs = documents.filter((doc) => {
    // Purge rejected documents by default unless explicitly filtering for Rejected
    if (statusFilter !== "Rejected" && doc.status === "Rejected") {
      return false;
    }

    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientCompany.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "All" || doc.type === typeFilter;
    const matchesStatus = statusFilter === "All" || doc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Sent
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            Draft
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Document Directory</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Proposals, Quotations, Milestone Invoices, and Payment Receipts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenReminderTemplates && (
            <button
              onClick={() => onOpenReminderTemplates()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              title="Automated WhatsApp and Email reminders for expiring proposals and overdue invoices"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Automated Reminders</span>
            </button>
          )}

          <button
            onClick={() => onOpenNewDoc("Proposal")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Proposal</span>
          </button>
        </div>
      </div>

      {/* Rejected Proposals Banner if any exist */}
      {documents.some((d) => d.status === "Rejected") && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Rejected proposal(s) detected ({documents.filter((d) => d.status === "Rejected").length})
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Permanently purge all rejected proposals from your database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              documents.filter((d) => d.status === "Rejected").forEach((d) => onDeleteDoc(d.id));
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
          >
            Purge Rejected Proposals
          </button>
        </div>
      )}

      {/* Filter & Search Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doc #, title, client name..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white dark:bg-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:outline-none font-medium cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Proposal">Proposals Only</option>
            <option value="Quotation">Quotations Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:outline-none font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mobile View: High-contrast touch-friendly Cards */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching documents found. Try adjusting filters or create a new proposal!
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const docInvoices = invoices.filter((i) => i.proposalId === doc.id);
              const docReceipts = receipts.filter((r) => r.proposalId === doc.id);

              return (
                <div key={doc.id} className="p-4 space-y-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div
                        onClick={() => onEditDoc(doc)}
                        className="font-extrabold text-sm text-slate-900 dark:text-white truncate cursor-pointer active:text-[#4F46E5]"
                      >
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {doc.docNumber} • {doc.issueDate}
                      </div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(doc.status)}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{doc.clientName}</span>
                      <span className="text-[10px] text-slate-400 block">{doc.clientCompany}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        {formatCurrency(doc.grandTotal, company.currency)}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.2 rounded text-[10px] font-bold ${
                          doc.type === "Proposal"
                            ? "bg-indigo-50 dark:bg-indigo-950/80 text-[#4F46E5] dark:text-indigo-400"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {doc.type}
                      </span>
                    </div>
                  </div>

                  {/* Invoices & Receipts Quick Action Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {onOpenInvoiceModal && (
                      <button
                        type="button"
                        onClick={() => onOpenInvoiceModal(doc)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Invoices ({docInvoices.length})</span>
                      </button>
                    )}

                    {onOpenReceiptModal && (
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal(doc)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        <span>Receipts ({docReceipts.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">Status:</span>
                      <select
                        value={doc.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            doc.id,
                            e.target.value as DocumentStatus
                          )
                        }
                        className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      {onOpenESignature && (
                        <button
                          type="button"
                          onClick={() => onOpenESignature(doc)}
                          className={`p-2 rounded-xl min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer ${
                            doc.acceptanceDetails?.accepted
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-slate-700 bg-indigo-50"
                          }`}
                          title="Sign & Authorize Document"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                      )}
                      {onOpenReminderTemplates && (
                        <button
                          type="button"
                          onClick={() => onOpenReminderTemplates(doc)}
                          className="p-2 rounded-xl text-amber-600 bg-amber-50 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                          title="Generate Automated Reminder"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                      {onOpenAutoSend && (
                        <button
                          type="button"
                          onClick={() => onOpenAutoSend(doc)}
                          className="p-2 rounded-xl text-emerald-600 bg-emerald-50 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                          title="Auto-Send via WhatsApp or Email"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onPreviewPDF(doc)}
                        className="p-2 rounded-xl text-[#4F46E5] bg-indigo-50 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        title="Preview & Print PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateDoc(doc)}
                        className="p-2 rounded-xl text-emerald-600 bg-emerald-50 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        title="Duplicate as New Draft"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditDoc(doc)}
                        className="p-2 rounded-xl text-slate-700 bg-slate-100 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        title="Edit Document"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocToDelete(doc)}
                        className="p-2 rounded-xl text-rose-600 bg-rose-50 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer hover:bg-rose-100 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Doc # & Title</th>
                <th className="py-3.5 px-4">Client / Company</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status & Change</th>
                <th className="py-3.5 px-4">Invoices & Receipts</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No matching documents found. Try adjusting filters or create a new proposal!
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const docInvoices = invoices.filter((i) => i.proposalId === doc.id);
                  const docReceipts = receipts.filter((r) => r.proposalId === doc.id);

                  return (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div
                          onClick={() => onEditDoc(doc)}
                          className="font-extrabold text-slate-900 dark:text-white hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {doc.docNumber} • Issued: {doc.issueDate} • Expires: {doc.expiryDate}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{doc.clientName}</div>
                        <div className="text-xs text-slate-400">{doc.clientCompany}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                            doc.type === "Proposal"
                              ? "bg-indigo-50 dark:bg-indigo-950/80 text-[#4F46E5] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
                              : "bg-blue-50 text-blue-700 border border-blue-200/60"
                          }`}
                        >
                          {doc.type}
                        </span>
                      </td>

                      {/* Status & Change Column */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(doc.status)}
                          <div>
                            <select
                              value={doc.status}
                              onChange={(e) =>
                                onUpdateStatus(
                                  doc.id,
                                  e.target.value as DocumentStatus
                                )
                              }
                              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
                            >
                              <option value="Draft">Set Draft</option>
                              <option value="Sent">Set Sent</option>
                              <option value="Accepted">Set Accepted</option>
                              <option value="Completed">Set Completed</option>
                              <option value="Rejected">Set Rejected</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Invoices & Payment Receipts Column next to Status & Change */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {/* Invoices */}
                          <div className="flex items-center gap-1.5">
                            {docInvoices.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => onOpenInvoiceModal && onOpenInvoiceModal(doc, docInvoices[0])}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors cursor-pointer"
                                title="View & customize invoices"
                              >
                                <FileSpreadsheet className="w-3 h-3 text-indigo-600" />
                                <span>{docInvoices.length} {docInvoices.length === 1 ? "Invoice" : "Invoices"}</span>
                              </button>
                            ) : (
                              onOpenInvoiceModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenInvoiceModal(doc)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 hover:text-indigo-600 transition-colors cursor-pointer"
                                  title="Create custom percentage or amount invoice"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Invoice</span>
                                </button>
                              )
                            )}

                            {docInvoices.length > 0 && onOpenInvoiceModal && (
                              <button
                                type="button"
                                onClick={() => onOpenInvoiceModal(doc)}
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="Create new milestone invoice"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Receipts */}
                          <div className="flex items-center gap-1.5">
                            {docReceipts.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => onOpenReceiptModal && onOpenReceiptModal(doc, undefined, docReceipts[0])}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100 transition-colors cursor-pointer"
                                title="View payment receipts"
                              >
                                <Receipt className="w-3 h-3 text-amber-600" />
                                <span>{docReceipts.length} {docReceipts.length === 1 ? "Receipt" : "Receipts"}</span>
                              </button>
                            ) : (
                              onOpenReceiptModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenReceiptModal(doc)}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/80 hover:text-amber-600 transition-colors cursor-pointer"
                                  title="Issue official payment receipt"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Receipt</span>
                                </button>
                              )
                            )}

                            {docReceipts.length > 0 && onOpenReceiptModal && (
                              <button
                                type="button"
                                onClick={() => onOpenReceiptModal(doc)}
                                className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="Issue additional payment receipt"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(doc.grandTotal, company.currency)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onOpenESignature && (
                            <button
                              type="button"
                              onClick={() => onOpenESignature(doc)}
                              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                doc.acceptanceDetails?.accepted
                                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100"
                                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                              }`}
                              title={doc.acceptanceDetails?.accepted ? "View digital signature verification audit" : "Sign & authorize with digital signature"}
                            >
                              <PenTool className="w-4 h-4" />
                            </button>
                          )}
                          {onOpenReminderTemplates && (
                            <button
                              type="button"
                              onClick={() => onOpenReminderTemplates(doc)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                              title="Generate automated reminder for this client"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}
                          {onOpenAutoSend && (
                            <button
                              type="button"
                              onClick={() => onOpenAutoSend(doc)}
                              className="p-1.5 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                              title="Auto-Send via WhatsApp or Email"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onPreviewPDF(doc)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-[#4F46E5] hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                            title="Preview & Print PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateDoc(doc)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                            title="Duplicate as New Draft"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditDoc(doc)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Document"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal (Works reliably in iframe and localhost without browser confirm dialog) */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Proposal?</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{docToDelete.docNumber}</span>
                <span className="text-[11px] font-extrabold text-slate-500">{docToDelete.type}</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">{docToDelete.title}</p>
              <p className="text-[11px] text-slate-400">Client: {docToDelete.clientName} ({docToDelete.clientCompany})</p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete this document? Any associated milestone invoices and payment receipts will also be removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDoc(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Yes, Delete Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
