import React from "react";
import { ProposalDocument, CompanyProfile, User, ThemeSettings, Invoice, PaymentReceipt } from "../types";
import { formatCurrency } from "../utils/storage";
import { FinancialChart } from "./FinancialChart";
import {
  FileText,
  FileCheck,
  Clock,
  DollarSign,
  Plus,
  Sparkles,
  UserPlus,
  ArrowUpRight,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Calendar,
  Activity,
  Send,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardProps {
  documents: ProposalDocument[];
  invoices?: Invoice[];
  receipts?: PaymentReceipt[];
  company: CompanyProfile;
  currentUser?: User | null;
  themeSettings?: ThemeSettings;
  onOpenNewDoc: (type: "Proposal" | "Quotation") => void;
  onOpenAIGenerator: () => void;
  onOpenNewClient: () => void;
  onEditDoc: (doc: ProposalDocument) => void;
  onPreviewPDF: (doc: ProposalDocument) => void;
  onDuplicateDoc: (doc: ProposalDocument) => void;
  onOpenDuplicateDoc?: (doc: ProposalDocument) => void;
  onOpenAutoSend?: (doc: ProposalDocument) => void;
  onOpenReminderTemplates?: (doc?: ProposalDocument) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  invoices = [],
  receipts = [],
  company,
  currentUser,
  themeSettings,
  onOpenNewDoc,
  onOpenAIGenerator,
  onOpenNewClient,
  onEditDoc,
  onPreviewPDF,
  onDuplicateDoc,
  onOpenAutoSend,
  onOpenReminderTemplates,
}) => {
  // Calculated Unified Metrics
  const totalProposals = documents.length;
  const activeDrafts = documents.filter((d) => d.status === "Draft").length;
  const totalSent = documents.filter((d) => d.status === "Sent").length;
  const totalAccepted = documents.filter((d) => d.status === "Accepted").length;
  const totalRejected = documents.filter((d) => d.status === "Rejected").length;

  const totalPipelineValue = documents.reduce((sum, d) => sum + (d.grandTotal || 0), 0);
  const acceptedRevenue = documents
    .filter((d) => d.status === "Accepted")
    .reduce((sum, d) => sum + (d.grandTotal || 0), 0);

  const closedCount = totalAccepted + totalRejected;
  const successRate = closedCount > 0 ? Math.round((totalAccepted / closedCount) * 100) : totalProposals > 0 ? Math.round((totalAccepted / totalProposals) * 100) : 0;

  // Chart Data for Ring/Gauge Success Rate
  const successData = [
    { name: "Accepted", value: totalAccepted || 1, color: "#059669" },
    { name: "In Progress / Other", value: Math.max(1, totalProposals - totalAccepted), color: "#E2E8F0" },
  ];

  // Pipeline Status Breakdown by Stage
  const pipelineStatusData = [
    { name: "Drafts", count: activeDrafts, value: documents.filter(d => d.status === "Draft").reduce((acc, d) => acc + (d.grandTotal || 0), 0) },
    { name: "Sent", count: totalSent, value: documents.filter(d => d.status === "Sent").reduce((acc, d) => acc + (d.grandTotal || 0), 0) },
    { name: "Accepted", count: totalAccepted, value: acceptedRevenue },
    { name: "Rejected", count: totalRejected, value: documents.filter(d => d.status === "Rejected").reduce((acc, d) => acc + (d.grandTotal || 0), 0) },
  ];

  // Multi-segment Status Percentages
  const totalDocs = documents.length || 1;
  const draftPct = Math.round((activeDrafts / totalDocs) * 100);
  const sentPct = Math.round((totalSent / totalDocs) * 100);
  const acceptedPct = Math.round((totalAccepted / totalDocs) * 100);
  const rejectedPct = Math.round((totalRejected / totalDocs) * 100);

  // Recent 5 documents
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Accepted
          </span>
        );
      case "Sent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Sent
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Draft
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* DocApp Inspired Top Section: Greeting Banner & Pipeline Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Welcome Hero Card */}
        <div 
          style={{ background: 'linear-gradient(135deg, var(--primary-color, #2F80ED) 0%, #1E40AF 100%)' }}
          className="lg:col-span-2 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle background decoration circles */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-20 top-0 w-40 h-40 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                Dashboard Overview
              </span>
              <span className="text-xs font-medium text-blue-100 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {currentUser?.name || "Master Administrator"}! 👋
            </h1>
            <p className="text-sm text-blue-100 mt-1 max-w-xl leading-relaxed">
              Ready to generate high-converting proposals and track client quotations in {company.currency || "PKR"}?
            </p>
          </div>

          {/* Quick Metrics Bar inside Hero Card to eliminate empty gap */}
          <div className="my-5 grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="px-2">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Accepted Revenue</span>
              <span className="text-sm sm:text-base font-extrabold text-white truncate block">
                {formatCurrency(acceptedRevenue, company.currency || "PKR")}
              </span>
            </div>
            <div className="px-2 border-l border-white/15">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Conversion Rate</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-300 block">
                {successRate}% Success
              </span>
            </div>
            <div className="px-2 border-l border-white/15">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Total Pipeline</span>
              <span className="text-sm sm:text-base font-extrabold text-white block">
                {totalDocs} Items
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/15">
            <button
              onClick={() => onOpenNewDoc("Proposal")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>New Proposal</span>
            </button>

            <button
              onClick={onOpenAIGenerator}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI Smart Generator</span>
            </button>
          </div>
        </div>

        {/* Pipeline Summary Widget */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Pipeline Activity</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Projects</span>
            </div>

            <div className="mt-4 space-y-3">
              {recentDocs.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onEditDoc(doc)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.title}</p>
                      <span className="text-[10px] text-slate-400 block">{doc.clientCompany || doc.clientName || "Direct Client"}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      {formatCurrency(doc.grandTotal, company.currency)}
                    </span>
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              ))}

              {recentDocs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No recent pipeline documents yet.</p>
              )}
            </div>
          </div>

          <button
            onClick={onOpenNewClient}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add New Client to CRM</span>
          </button>
        </div>
      </div>

      {/* High-Contrast Floating Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Proposals */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Total Proposals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalProposals}</span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg">
              Proposal + Quotation
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Unified commercial documents</p>
        </div>

        {/* Active Drafts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Active Drafts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{activeDrafts}</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-lg">
              In Progress
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Drafting scope & investment</p>
        </div>

        {/* Sent & Under Review */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Sent / In Review
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalSent}</span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg">
              Awaiting Sign-off
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Sent to prospective clients</p>
        </div>

        {/* Accepted Revenue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Accepted Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 truncate">
              {formatCurrency(acceptedRevenue, company.currency)}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg flex items-center gap-0.5 shrink-0">
              <FileCheck className="w-3.5 h-3.5" />
              {totalAccepted} Won
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Total approved commercial value</p>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Rate Gauge Ring */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Conversion Rate</h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
                Win Ratio
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Accepted vs Total Commercial Opportunities</p>
          </div>

          <div className="relative h-48 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {successData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center top-6">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{successRate}%</span>
              <span className="text-xs font-bold text-slate-400">Success Ratio</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Accepted Proposals</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totalAccepted}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Active Pipeline</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{totalSent + activeDrafts}</span>
            </div>
          </div>
        </div>

        {/* Proposals Pipeline Stage Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Proposal Pipeline Value</h3>
                <p className="text-xs text-slate-400 mt-0.5">Total Pipeline: {formatCurrency(totalPipelineValue, company.currency)} across {documents.length} projects</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Won
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Sent
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Draft
                </span>
              </div>
            </div>
          </div>

          <div className="h-52 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStatusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0, company.currency), "Value"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "16px", border: "none", color: "#FFF" }}
                />
                <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Proposal Stages Distribution</span>
              <span>{documents.length} Total Projects</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${acceptedPct}%` }} className="bg-emerald-600 h-full" title={`Accepted: ${acceptedPct}%`} />
              <div style={{ width: `${sentPct}%` }} className="bg-blue-600 h-full" title={`Sent: ${sentPct}%`} />
              <div style={{ width: `${draftPct}%` }} className="bg-amber-500 h-full" title={`Draft: ${draftPct}%`} />
              <div style={{ width: `${rejectedPct}%` }} className="bg-rose-500 h-full" title={`Rejected: ${rejectedPct}%`} />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Revenue Overview Recharts Chart */}
      <FinancialChart invoices={invoices} receipts={receipts} company={company} />

      {/* Recent Proposals & Quotations Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Documents</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage, duplicate, edit, or preview printable PDF documents</p>
          </div>
        </div>

        {/* Mobile View: High-contrast touch-friendly Cards */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {recentDocs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No documents created yet. Click "+ New Proposal" to get started!
            </div>
          ) : (
            recentDocs.map((doc) => (
              <div key={doc.id} className="p-4 space-y-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-extrabold text-sm text-slate-900 dark:text-white truncate cursor-pointer active:text-indigo-600"
                      onClick={() => onEditDoc(doc)}
                    >
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {doc.docNumber} • {doc.issueDate}
                    </div>
                  </div>
                  <div className="shrink-0">{getStatusBadge(doc.status)}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{doc.clientName}</span>
                    <span className="text-[10px] text-slate-400 block">{doc.clientCompany}</span>
                  </div>
                    <span className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        {formatCurrency(doc.grandTotal, company.currency)}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${doc.type === "Proposal" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                        {doc.type === "Proposal" ? "Proposal + Quotation" : "Quotation (Legacy)"}
                      </span>
                    </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {onOpenAutoSend && (
                    <button
                      type="button"
                      onClick={() => onOpenAutoSend(doc)}
                      className="p-2 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                      title="Auto-Send via WhatsApp or Email"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onPreviewPDF(doc)}
                    className="p-2 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                    title="Preview & Print PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateDoc(doc)}
                    className="p-2 rounded-xl text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                    title="Duplicate as New Draft"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditDoc(doc)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white min-h-[38px] cursor-pointer"
                    title="Edit Document"
                  >
                    <span>Edit</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Doc # & Title</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {recentDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No documents created yet. Click "+ New Proposal" to get started!
                  </td>
                </tr>
              ) : (
                recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div
                        className="font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        onClick={() => onEditDoc(doc)}
                      >
                        {doc.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{doc.docNumber} • {doc.issueDate}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{doc.clientName}</div>
                      <div className="text-xs text-slate-400">{doc.clientCompany}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${doc.type === "Proposal" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                        {doc.type === "Proposal" ? "Proposal + Quotation" : "Quotation (Legacy)"}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(doc.status)}</td>
                    <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(doc.grandTotal, company.currency)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenAutoSend && (
                          <button
                            type="button"
                            onClick={() => onOpenAutoSend(doc)}
                            className="p-1.5 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                            title="Auto-Send via WhatsApp or Email"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onPreviewPDF(doc)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
                          title="Preview & Print PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateDoc(doc)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
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
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
