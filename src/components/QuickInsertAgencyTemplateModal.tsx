import React, { useState } from "react";
import {
  AGENCY_SERVICES,
  AgencyServiceTemplate,
  TemplateVariables,
  replaceTemplateVariables,
} from "../data/agencyServiceTemplates";
import { CompanyProfile, Client } from "../types";
import { formatCurrency } from "../utils/storage";
import {
  X,
  Sparkles,
  Check,
  Globe,
  TrendingUp,
  Search,
  Palette,
  ShieldCheck,
  Share2,
  Cloud,
  Code2,
  Video,
  Layers,
  DollarSign,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  ChevronRight,
  Info,
} from "lucide-react";

interface QuickInsertAgencyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  selectedClient?: Client;
  onInsertServices: (data: {
    title: string;
    overview: string;
    requirements: string;
    proposedSolution: string;
    scopeOfWork: string;
    deliverables: string[];
    providerResponsibilities: string;
    clientResponsibilities: string;
    milestones: { name: string; timeline: string; description: string }[];
    lineItems: { description: string; quantity: number; unitPrice: number; discount: number; taxRate: number }[];
    paymentSchedule: { description: string; percentage: number; dueCondition: string }[];
  }) => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const QuickInsertAgencyTemplateModal: React.FC<QuickInsertAgencyTemplateModalProps> = ({
  isOpen,
  onClose,
  company,
  selectedClient,
  onInsertServices,
  showToast,
}) => {
  if (!isOpen) return null;

  // Selected Service IDs (multi-select supported)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([AGENCY_SERVICES[0].id]);
  const [activeTab, setActiveTab] = useState<"services" | "variables" | "preview">("services");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Editable Variables State
  const [variables, setVariables] = useState<TemplateVariables>({
    clientName: selectedClient?.name || "Sarah Jenkins",
    clientCompany: selectedClient?.company || "Acme Enterprise Corp",
    companyName: company.name || "XyronGroup",
    projectName: "Digital & Commercial Growth Engagement",
    serviceName: "Custom Web & Digital Marketing",
    projectStartDate: new Date().toISOString().split("T")[0],
    projectEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    projectDuration: "6 - 8 Weeks",
    preparedBy: company.name || "XyronGroup Team",
    proposalDate: new Date().toISOString().split("T")[0],
    proposalValidity: "30 Calendar Days",
    currency: company.currency || "PKR",
    taxRate: company.defaultTaxRate || 10,
    paymentTerms: company.paymentTerms || "50% Upfront, 30% Milestone 2, 20% Handover",
  });

  const toggleSelectService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length === 1) {
        showToast("Minimum 1 Service", "Please keep at least one service selected.", "warning");
        return;
      }
      setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Globe":
        return <Globe className="w-5 h-5" />;
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5" />;
      case "Search":
        return <Search className="w-5 h-5" />;
      case "Palette":
        return <Palette className="w-5 h-5" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5" />;
      case "Share2":
        return <Share2 className="w-5 h-5" />;
      case "Cloud":
        return <Cloud className="w-5 h-5" />;
      case "Code2":
        return <Code2 className="w-5 h-5" />;
      case "Video":
        return <Video className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const selectedServices = AGENCY_SERVICES.filter((s) => selectedServiceIds.includes(s.id));

  // Merge logic across selected services
  const buildMergedProposalData = () => {
    const titles = selectedServices.map((s) => s.name).join(" & ");
    const proposalTitle =
      selectedServices.length === 1
        ? `${selectedServices[0].name} for ${variables.clientCompany || variables.clientName}`
        : `${titles} for ${variables.clientCompany || variables.clientName}`;

    // Executive Summaries (Clean without markdown hashes or SERVICE prefixes)
    const overview = selectedServices
      .map((s) => selectedServices.length > 1 ? `${s.name}:\n${s.executiveSummary}` : s.executiveSummary)
      .join("\n\n");

    // Client Requirements
    const reqList: string[] = [];
    selectedServices.forEach((s) => {
      s.clientRequirements.forEach((r) => {
        if (!reqList.includes(r)) reqList.push(r);
      });
    });
    const requirements = reqList.map((r) => `• ${r}`).join("\n");

    // Proposed Solution & Strategic Value
    const solutionSections = selectedServices
      .map(
        (s) =>
          `${s.name} Solution:\n${s.proposedSolutionScope.map((item) => `• ${item}`).join("\n")}`
      )
      .join("\n\n");

    // Detailed Scope of Work
    const scopeOfWork = selectedServices
      .map(
        (s) =>
          `${s.name} Scope:\n${s.proposedSolutionScope.map((item) => `• ${item}`).join("\n")}`
      )
      .join("\n\n");

    // Tangible Deliverables (clean list with Website sitemap and no [SERVICE] brackets)
    const deliverables: string[] = [];
    selectedServices.forEach((s) => {
      s.tangibleDeliverables.forEach((d) => {
        const cleanD = d.replace(/\[service.*?\]/gi, "").replace(/^\[.*?\]\s*/, "").trim();
        if (!deliverables.includes(cleanD)) deliverables.push(cleanD);
      });
    });

    // Provider Responsibilities (XyronGroup)
    const providerRespList: string[] = [];
    selectedServices.forEach((s) => {
      s.providerResponsibilities.forEach((pr) => {
        if (!providerRespList.includes(pr)) providerRespList.push(pr);
      });
    });
    const providerResponsibilities = providerRespList.map((p) => `• ${p}`).join("\n");

    // Client Responsibilities
    const clientRespList: string[] = [];
    selectedServices.forEach((s) => {
      s.clientResponsibilities.forEach((cr) => {
        if (!clientRespList.includes(cr)) clientRespList.push(cr);
      });
    });
    const clientResponsibilities = clientRespList.map((c) => `• ${c}`).join("\n");

    // Project Implementation Milestones
    const milestones: { name: string; timeline: string; description: string }[] = [];
    selectedServices.forEach((s) => {
      s.defaultMilestones.forEach((m) => {
        milestones.push({
          name: m.name.replace(/\[service.*?\]/gi, "").replace(/\(SERVICE \d+\)/gi, "").trim(),
          timeline: m.timeline,
          description: m.description,
        });
      });
    });

    // Commercial Quotation Line Items
    const lineItems: { description: string; quantity: number; unitPrice: number; discount: number; taxRate: number }[] = [];
    selectedServices.forEach((s) => {
      s.defaultLineItems.forEach((li) => {
        lineItems.push({
          description: li.description.replace(/\[service.*?\]/gi, "").replace(/^\[.*?\]\s*/, "").trim(),
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          discount: li.discount,
          taxRate: typeof variables.taxRate === "number" ? variables.taxRate : parseFloat(String(variables.taxRate)) || 10,
        });
      });
    });

    // Payment Schedule (use primary preset or combine)
    const paymentSchedule =
      selectedServices[0]?.defaultPaymentSchedule || [
        { description: "50% Upfront Deposit upon Agreement Signing", percentage: 50, dueCondition: "Upon Signing" },
        { description: "30% Midpoint Milestone Approval", percentage: 30, dueCondition: "Upon Phase 2 Sign-off" },
        { description: "20% Final Sign-off & Handover", percentage: 20, dueCondition: "Upon Final Delivery" },
      ];

    // Apply Variable Replacements
    return {
      title: replaceTemplateVariables(proposalTitle, variables),
      overview: replaceTemplateVariables(overview, variables),
      requirements: replaceTemplateVariables(requirements, variables),
      proposedSolution: replaceTemplateVariables(solutionSections, variables),
      scopeOfWork: replaceTemplateVariables(scopeOfWork, variables),
      deliverables: deliverables.map((d) => replaceTemplateVariables(d, variables)),
      providerResponsibilities: replaceTemplateVariables(providerResponsibilities, variables),
      clientResponsibilities: replaceTemplateVariables(clientResponsibilities, variables),
      milestones: milestones.map((m) => ({
        ...m,
        name: replaceTemplateVariables(m.name, variables),
        description: replaceTemplateVariables(m.description, variables),
      })),
      lineItems: lineItems.map((li) => ({
        ...li,
        description: replaceTemplateVariables(li.description, variables),
      })),
      paymentSchedule,
    };
  };

  const handleApplyInsert = () => {
    const merged = buildMergedProposalData();
    onInsertServices(merged);
    showToast(
      "Industry Template Inserted",
      `Applied ${selectedServices.length} agency service(s) into your proposal. All fields remain 100% editable.`,
      "success"
    );
    onClose();
  };

  const filteredServices =
    categoryFilter === "All"
      ? AGENCY_SERVICES
      : AGENCY_SERVICES.filter((s) => s.category === categoryFilter);

  // Financial preview calculation
  const previewData = buildMergedProposalData();
  const previewSubtotal = previewData.lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice * (1 - li.discount / 100),
    0
  );
  const previewTax = previewSubtotal * ((typeof variables.taxRate === "number" ? variables.taxRate : 10) / 100);
  const previewGrandTotal = previewSubtotal + previewTax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  Quick Insert Industry Template
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  Agency Modular Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select 1 or multiple services to auto-populate scope, deliverables, responsibilities, quotation line items & milestones.
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

        {/* Modal Sub-navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "services"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              1. Select Services ({selectedServiceIds.length} Selected)
            </button>
            <button
              onClick={() => setActiveTab("variables")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "variables"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Global Variables</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              3. Live Content & Quotation Preview
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Currency:</span>
            <span className="font-bold text-slate-900">{variables.currency || "PKR"}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SERVICE SELECTION */}
          {activeTab === "services" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Category Filter Pills & Multi-select Counter */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {["All", "Design & Development", "Marketing & Growth", "Software & SaaS", "IT & Cloud"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        categoryFilter === cat
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                  {selectedServiceIds.length} of {AGENCY_SERVICES.length} Services Selected
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleSelectService(service.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${
                              isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {getServiceIcon(service.iconName)}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                              {service.serviceNumber}
                            </span>
                            <h3 className="font-extrabold text-xs text-slate-900 leading-snug">
                              {service.name}
                            </h3>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 bg-white group-hover:border-slate-400"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                        {service.executiveSummary}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                        <span>{service.tangibleDeliverables.length} Deliverables</span>
                        <span>{service.defaultMilestones.length} Phases</span>
                        <span>{service.defaultLineItems.length} Pricing Items</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL VARIABLES */}
          {activeTab === "variables" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <span className="font-bold block">Global Editable Variables</span>
                  These placeholders will be dynamically replaced throughout your proposal scopes, deliverables, responsibility contracts, and commercial quotations. All content remains 100% editable!
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Client Name]</label>
                  <input
                    type="text"
                    value={variables.clientName}
                    onChange={(e) => setVariables({ ...variables, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Company Name]</label>
                  <input
                    type="text"
                    value={variables.companyName}
                    onChange={(e) => setVariables({ ...variables, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. XyronGroup"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Project Name]</label>
                  <input
                    type="text"
                    value={variables.projectName}
                    onChange={(e) => setVariables({ ...variables, projectName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. Enterprise Web Portal & SEO"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Project Duration]</label>
                  <input
                    type="text"
                    value={variables.projectDuration}
                    onChange={(e) => setVariables({ ...variables, projectDuration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. 6 - 8 Weeks"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Currency]</label>
                  <input
                    type="text"
                    value={variables.currency}
                    onChange={(e) => setVariables({ ...variables, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="PKR, $, €, £"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Tax Rate %]</label>
                  <input
                    type="number"
                    value={variables.taxRate}
                    onChange={(e) => setVariables({ ...variables, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Prepared By]</label>
                  <input
                    type="text"
                    value={variables.preparedBy}
                    onChange={(e) => setVariables({ ...variables, preparedBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. XyronGroup Team"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Proposal Validity]</label>
                  <input
                    type="text"
                    value={variables.proposalValidity}
                    onChange={(e) => setVariables({ ...variables, proposalValidity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. 30 Calendar Days"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">[Payment Terms]</label>
                  <input
                    type="text"
                    value={variables.paymentTerms}
                    onChange={(e) => setVariables({ ...variables, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="e.g. 50% Deposit, 30% Milestone 2, 20% Delivery"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CONTENT PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Proposal Header Snapshot */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
                  Generated Proposal Title
                </span>
                <h3 className="font-extrabold text-base mt-1">{previewData.title}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
                  <span>Client: {variables.clientName} ({variables.clientCompany})</span>
                  <span>Currency: {variables.currency}</span>
                  <span>Estimated Total: {formatCurrency(previewGrandTotal, variables.currency || "PKR")}</span>
                </div>
              </div>

              {/* Tangible Deliverables Checklist Preview */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
                  Tangible Deliverables ({previewData.deliverables.length} Total)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {previewData.deliverables.map((deliv, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itemized Commercial Quotation Line Items Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-900 flex items-center justify-between">
                  <span>Investment & Commercial Quotation ({previewData.lineItems.length} Line Items)</span>
                  <span className="font-mono text-emerald-700">
                    Grand Total: {formatCurrency(previewGrandTotal, variables.currency || "PKR")}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/70 text-[11px] text-slate-400 font-bold">
                      <tr>
                        <th className="p-3">Item / Service Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price ({variables.currency})</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.lineItems.map((li, idx) => {
                        const lineTot = li.quantity * li.unitPrice * (1 - li.discount / 100);
                        return (
                          <tr key={idx}>
                            <td className="p-3 font-medium text-slate-800">{li.description}</td>
                            <td className="p-3 text-center">{li.quantity}</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(li.unitPrice, variables.currency || "PKR")}</td>
                            <td className="p-3 text-right font-bold text-slate-900 font-mono">
                              {formatCurrency(lineTot, variables.currency || "PKR")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-800">{selectedServiceIds.length} service(s)</span>
            <span>ready to insert into proposal editor.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyInsert}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Insert Selected Template into Proposal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
