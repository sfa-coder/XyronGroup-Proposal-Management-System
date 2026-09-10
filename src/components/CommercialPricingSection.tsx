import React from "react";
import {
  PricingModel,
  RetainerServiceItem,
  LineItem,
  CompanyProfile,
} from "../types";
import { formatCurrency } from "../utils/storage";
import {
  Briefcase,
  Repeat,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  HelpCircle,
  FileText,
  ShieldAlert,
} from "lucide-react";

export interface CommercialFinancials {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  firstMonthPayable: number;
  recurringMonthlyPayable: number;
  months: number;
  monthsRemaining: number;
  remainingTotal: number;
}

interface CommercialPricingSectionProps {
  pricingModel: PricingModel;
  onPricingModelChange?: (model: PricingModel) => void;
  onChangePricingModel?: (model: PricingModel) => void;
  setupFee: number;
  onSetupFeeChange?: (val: number) => void;
  onChangeSetupFee?: (val: number) => void;
  monthlyRetainerFee: number;
  onMonthlyRetainerFeeChange?: (val: number) => void;
  onChangeMonthlyRetainerFee?: (val: number) => void;
  engagementMonths: number;
  onEngagementMonthsChange?: (val: number) => void;
  onChangeEngagementMonths?: (val: number) => void;
  paymentFrequency: string;
  onPaymentFrequencyChange?: (val: string) => void;
  onChangePaymentFrequency?: (val: string) => void;
  discountType: "percentage" | "fixed";
  onDiscountTypeChange?: (val: "percentage" | "fixed") => void;
  onChangeDiscountType?: (val: "percentage" | "fixed") => void;
  discountValue: number;
  onDiscountValueChange?: (val: number) => void;
  onChangeDiscountValue?: (val: number) => void;
  taxEnabled: boolean;
  onTaxEnabledChange?: (val: boolean) => void;
  onChangeTaxEnabled?: (val: boolean) => void;
  taxRate: number;
  onTaxRateChange?: (val: number) => void;
  onChangeTaxRate?: (val: number) => void;
  customPricingNotes: string;
  onCustomPricingNotesChange?: (val: string) => void;
  onChangeCustomPricingNotes?: (val: string) => void;
  retainerServices: RetainerServiceItem[];
  onRetainerServicesChange?: (services: RetainerServiceItem[]) => void;
  onChangeRetainerServices?: (services: RetainerServiceItem[]) => void;
  onAddRetainerService?: (item: RetainerServiceItem) => void;
  onUpdateRetainerService?: (id: string, field: keyof RetainerServiceItem, val: string) => void;
  onRemoveRetainerService?: (id: string) => void;
  lineItems: LineItem[];
  onLineItemsChange?: (items: LineItem[]) => void;
  onChangeLineItems?: (items: LineItem[]) => void;
  onAddLineItem?: () => void;
  onUpdateLineItem?: (id: string, field: keyof LineItem, val: any) => void;
  onRemoveLineItem?: (id: string) => void;
  company?: CompanyProfile;
  currency?: string;
  financials: CommercialFinancials;
  onApplyRetainerTerms: () => void;
  onInsertRetainerOverview: () => void;
}

export const CommercialPricingSection: React.FC<CommercialPricingSectionProps> = (props) => {
  const {
    pricingModel,
    setupFee,
    monthlyRetainerFee,
    engagementMonths,
    paymentFrequency,
    discountType,
    discountValue,
    taxEnabled,
    taxRate,
    customPricingNotes,
    retainerServices,
    lineItems,
    company,
    financials,
    onApplyRetainerTerms,
    onInsertRetainerOverview,
  } = props;

  const onChangePricingModel = props.onPricingModelChange || props.onChangePricingModel || (() => {});
  const onChangeSetupFee = props.onSetupFeeChange || props.onChangeSetupFee || (() => {});
  const onChangeMonthlyRetainerFee = props.onMonthlyRetainerFeeChange || props.onChangeMonthlyRetainerFee || (() => {});
  const onChangeEngagementMonths = props.onEngagementMonthsChange || props.onChangeEngagementMonths || (() => {});
  const onChangePaymentFrequency = props.onPaymentFrequencyChange || props.onChangePaymentFrequency || (() => {});
  const onChangeDiscountType = props.onDiscountTypeChange || props.onChangeDiscountType || (() => {});
  const onChangeDiscountValue = props.onDiscountValueChange || props.onChangeDiscountValue || (() => {});
  const onChangeTaxEnabled = props.onTaxEnabledChange || props.onChangeTaxEnabled || (() => {});
  const onChangeTaxRate = props.onTaxRateChange || props.onChangeTaxRate || (() => {});
  const onChangeCustomPricingNotes = props.onCustomPricingNotesChange || props.onChangeCustomPricingNotes || (() => {});
  const onChangeRetainerServices = props.onRetainerServicesChange || props.onChangeRetainerServices || (() => {});
  const onChangeLineItems = props.onLineItemsChange || props.onChangeLineItems || (() => {});

  const currency = props.currency || company?.currency || "PKR";

  // Retainer Services Handlers
  const handleAddRetainerService = () => {
    const newService: RetainerServiceItem = {
      id: `rs_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      serviceName: "New Core Service / Scope Deliverable",
      initialSetup: "Included",
      monthlyRetainer: "Included",
      notes: "Active retainer deliverable",
    };
    if (props.onAddRetainerService) {
      props.onAddRetainerService(newService);
    }
    onChangeRetainerServices([...retainerServices, newService]);
  };

  const handleUpdateRetainerService = (
    id: string,
    field: keyof RetainerServiceItem,
    val: string
  ) => {
    if (props.onUpdateRetainerService) {
      props.onUpdateRetainerService(id, field, val);
    }
    onChangeRetainerServices(
      retainerServices.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleRemoveRetainerService = (id: string) => {
    if (props.onRemoveRetainerService) {
      props.onRemoveRetainerService(id);
    }
    if (retainerServices.length === 1) return;
    onChangeRetainerServices(retainerServices.filter((s) => s.id !== id));
  };

  const handleResetAgencyServices = () => {
    const defaultServices: RetainerServiceItem[] = [
      {
        id: `rs_${Date.now()}_1`,
        serviceName: "SEO Strategy & Optimization",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Technical site audit, on-page optimization & high-intent commercial keyword rankings",
      },
      {
        id: `rs_${Date.now()}_2`,
        serviceName: "Local SEO & GBP Management",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Google Business Profiles (multi-location setup), local citations & maps authority",
      },
      {
        id: `rs_${Date.now()}_3`,
        serviceName: "Social Media Management",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Monthly content calendar, static/carousel graphics, copywriting & community management",
      },
      {
        id: `rs_${Date.now()}_4`,
        serviceName: "Content Creation",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "High-authority articles, copywriting, infographics & brand asset production",
      },
      {
        id: `rs_${Date.now()}_5`,
        serviceName: "Short-Form Video Content",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Short-form vertical video production (Reels/TikTok) with viral hooks & editing",
      },
      {
        id: `rs_${Date.now()}_6`,
        serviceName: "Reporting & Optimization",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Bi-weekly syncs, monthly ROI analytics, KPI tracking & conversion optimization",
      },
    ];
    onChangeRetainerServices(defaultServices);
  };

  // Line item handlers for one-time / custom
  const handleAddLineItem = () => {
    if (props.onAddLineItem) {
      props.onAddLineItem();
      return;
    }
    const newItem: LineItem = {
      id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: "Service Deliverable / Milestone Scope",
      quantity: 1,
      unitPrice: 10000,
      discount: 0,
      taxRate: taxEnabled ? taxRate : 0,
    };
    onChangeLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, val: any) => {
    if (props.onUpdateLineItem) {
      props.onUpdateLineItem(id, field, val);
    }
    onChangeLineItems(
      lineItems.map((li) => (li.id === id ? { ...li, [field]: val } : li))
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (props.onRemoveLineItem) {
      props.onRemoveLineItem(id);
      return;
    }
    if (lineItems.length === 1) return;
    onChangeLineItems(lineItems.filter((li) => li.id !== id));
  };

  const isRetainerModel =
    pricingModel === "setup-and-retainer" || pricingModel === "monthly-retainer";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      {/* Header & Pricing Model Selector */}
      <div className="border-b border-slate-100 pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              5. Investment & Commercial Quotation
            </h2>
            <p className="text-xs text-slate-400">
              Select commercial structure: one-time project, recurring retainer, or hybrid setup + retainer
            </p>
          </div>
        </div>

        {/* Pricing Model Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onChangePricingModel("one-time")}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              pricingModel === "one-time"
                ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                : "bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100/80"
            }`}
          >
            <Briefcase className={`w-4 h-4 shrink-0 ${pricingModel === "one-time" ? "text-indigo-400" : "text-slate-500"}`} />
            <div>
              <span className="block text-xs font-bold leading-tight">One-Time Project</span>
              <span className={`text-[10px] block ${pricingModel === "one-time" ? "text-slate-300" : "text-slate-400"}`}>
                Fixed scope milestones
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangePricingModel("monthly-retainer")}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              pricingModel === "monthly-retainer"
                ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                : "bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100/80"
            }`}
          >
            <Repeat className={`w-4 h-4 shrink-0 ${pricingModel === "monthly-retainer" ? "text-emerald-400" : "text-slate-500"}`} />
            <div>
              <span className="block text-xs font-bold leading-tight">Monthly Retainer</span>
              <span className={`text-[10px] block ${pricingModel === "monthly-retainer" ? "text-slate-300" : "text-slate-400"}`}>
                Pure recurring monthly
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangePricingModel("setup-and-retainer")}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              pricingModel === "setup-and-retainer"
                ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-lg shadow-indigo-500/25"
                : "bg-indigo-50/50 text-indigo-950 border-indigo-200 hover:bg-indigo-100/60"
            }`}
          >
            <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
              Agency Best
            </div>
            <Sparkles className={`w-4 h-4 shrink-0 ${pricingModel === "setup-and-retainer" ? "text-amber-300" : "text-indigo-600"}`} />
            <div>
              <span className="block text-xs font-extrabold leading-tight">Setup + Retainer</span>
              <span className={`text-[10px] block ${pricingModel === "setup-and-retainer" ? "text-indigo-200" : "text-indigo-600/80"}`}>
                Month 1 setup + recurring
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangePricingModel("custom")}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              pricingModel === "custom"
                ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                : "bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100/80"
            }`}
          >
            <Sliders className={`w-4 h-4 shrink-0 ${pricingModel === "custom" ? "text-indigo-400" : "text-slate-500"}`} />
            <div>
              <span className="block text-xs font-bold leading-tight">Custom Terms</span>
              <span className={`text-[10px] block ${pricingModel === "custom" ? "text-slate-300" : "text-slate-400"}`}>
                Custom fee structure
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* RETAINER MODEL CONFIGURATION (Setup + Retainer OR Monthly Retainer) */}
      {isRetainerModel && (
        <div className="space-y-6">
          {/* Quick Preset Badges */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Quick Agency Retainer Presets:
            </span>
            <button
              type="button"
              onClick={() => {
                onChangeSetupFee(325000);
                onChangeMonthlyRetainerFee(210000);
                onChangeEngagementMonths(6);
              }}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-slate-800 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
            >
              🚀 Digital Growth: PKR 325k Setup + PKR 210k/mo (6 Mos)
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeSetupFee(150000);
                onChangeMonthlyRetainerFee(120000);
                onChangeEngagementMonths(3);
              }}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-slate-800 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
            >
              ⚡ Starter: PKR 150k Setup + PKR 120k/mo (3 Mos)
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeSetupFee(500000);
                onChangeMonthlyRetainerFee(350000);
                onChangeEngagementMonths(12);
              }}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-slate-800 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
            >
              🏢 Enterprise: PKR 500k Setup + PKR 350k/mo (12 Mos)
            </button>
          </div>

          {/* Interactive Pricing Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Setup Fee (Only if setup-and-retainer) */}
            {pricingModel === "setup-and-retainer" && (
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-950">
                  Initial Setup / Month 1 ({currency}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={setupFee}
                    onChange={(e) => onChangeSetupFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="325000"
                    className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 font-mono font-bold text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
                <p className="text-[10px] text-indigo-700 font-medium">Month 1 launch + onboarding investment</p>
              </div>
            )}

            {/* Monthly Retainer */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-emerald-950">
                Monthly Retainer ({currency}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={monthlyRetainerFee}
                  onChange={(e) => onChangeMonthlyRetainerFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="210000"
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 font-mono font-bold text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-emerald-700 font-medium">Payable monthly in advance</p>
            </div>

            {/* Minimum Engagement Period */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                  Minimum Engagement *
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  {engagementMonths} {engagementMonths === 1 ? "Month" : "Months"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChangeEngagementMonths(m)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      engagementMonths === m
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
              <div className="pt-1">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={engagementMonths}
                  onChange={(e) => onChangeEngagementMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center bg-white"
                  placeholder="Custom Months"
                />
              </div>
            </div>

            {/* Payment Frequency */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                Payment Frequency
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => onChangePaymentFrequency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="Monthly in Advance">Monthly in Advance</option>
                <option value="Payable upon Signing + Monthly">Payable upon Signing + Monthly</option>
                <option value="Quarterly in Advance">Quarterly in Advance</option>
                <option value="Bimonthly (Every 2 Months)">Bimonthly (Every 2 Months)</option>
              </select>
              <p className="text-[10px] text-slate-500">Invoiced prior to each service cycle</p>
            </div>
          </div>

          {/* Discounts & Tax Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Optional Discount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-indigo-600" />
                  Optional Engagement Discount
                </label>
                <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => onChangeDiscountType("percentage")}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      discountType === "percentage" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    % Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeDiscountType("fixed")}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      discountType === "fixed" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    Fixed ({currency})
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => onChangeDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder={discountType === "percentage" ? "e.g. 5%" : "e.g. 25000"}
                  className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                />
              </div>
            </div>

            {/* Tax */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => onChangeTaxEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Apply Applicable Tax / GST</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {taxEnabled ? `+${taxRate}%` : "No Tax"}
                </span>
              </div>
              {taxEnabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={taxRate}
                    onChange={(e) => onChangeTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="10"
                    className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                  />
                  <span className="text-xs text-slate-500 font-medium">% Tax Rate</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 pt-1">Taxes disabled (all figures displayed net of tax)</p>
              )}
            </div>
          </div>

          {/* 3. COMMERCIAL SUMMARY CARD (Prominent Display) */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
                  Commercial Structure Breakdown
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {pricingModel === "setup-and-retainer" ? "Setup & Recurring Growth Retainer" : "Monthly Growth Retainer"}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                {engagementMonths} Months Term
              </span>
            </div>

            {/* 4 Prominent Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingModel === "setup-and-retainer" && (
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Initial Setup & Launch
                  </span>
                  <p className="text-xl font-extrabold font-mono text-white mt-1">
                    {formatCurrency(setupFee, currency)}
                  </p>
                  <span className="text-[10px] text-indigo-400 font-medium">Month 1 (Due upon Signing)</span>
                </div>
              )}

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Growth Retainer
                </span>
                <p className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
                  {formatCurrency(monthlyRetainerFee, currency)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                </p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {pricingModel === "setup-and-retainer" && engagementMonths > 1
                    ? `Months 2–${engagementMonths} (${engagementMonths - 1} cycles)`
                    : `${engagementMonths} monthly cycles`}
                </span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Minimum Engagement
                </span>
                <p className="text-xl font-extrabold text-white mt-1">
                  {engagementMonths} {engagementMonths === 1 ? "Month" : "Months"}
                </p>
                <span className="text-[10px] text-amber-300 font-medium">Performance Optimization Term</span>
              </div>

              {/* Total Contract Value Highlight */}
              <div className="bg-emerald-950/70 p-4 rounded-2xl border border-emerald-500/40 shadow-inner">
                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">
                  Total {engagementMonths}-Month Investment
                </span>
                <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {formatCurrency(financials.grandTotal, currency)}
                </p>
                <span className="text-[10px] text-emerald-200/80 font-semibold block mt-0.5">
                  Total Multi-Month Contract Value
                </span>
              </div>
            </div>

            {/* Dynamic Formula Calculation Detail */}
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/40 text-xs text-slate-300 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                <span className="font-bold text-slate-200">Contract Calculation Formula:</span>
                <span className="font-mono text-[11px] text-indigo-300">
                  {pricingModel === "setup-and-retainer"
                    ? engagementMonths === 1
                      ? `Month 1 = ${formatCurrency(setupFee, currency)}`
                      : `Month 1 (${formatCurrency(setupFee, currency)}) + Months 2–${engagementMonths} (${formatCurrency(monthlyRetainerFee, currency)} × ${engagementMonths - 1})`
                    : `${formatCurrency(monthlyRetainerFee, currency)} × ${engagementMonths} Months`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block">First-Month Payable:</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {formatCurrency(financials.firstMonthPayable, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Subsequent Monthly Payable:</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {formatCurrency(financials.recurringMonthlyPayable, currency)} / mo
                  </span>
                </div>
                {financials.discountTotal > 0 && (
                  <div>
                    <span className="text-slate-400 block">Discount Savings:</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      -{formatCurrency(financials.discountTotal, currency)}
                    </span>
                  </div>
                )}
                {financials.taxTotal > 0 && (
                  <div>
                    <span className="text-slate-400 block">Estimated Tax:</span>
                    <span className="font-mono font-bold text-slate-200 text-xs">
                      +{formatCurrency(financials.taxTotal, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Retainer Deliverables Matrix Table */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Service Deliverables & Retainer Coverage Matrix
                </h4>
                <p className="text-xs text-slate-400">
                  Specify which services are included in the initial setup and ongoing monthly retainer
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAgencyServices}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 cursor-pointer"
                >
                  Load Agency Defaults
                </button>
                <button
                  type="button"
                  onClick={handleAddRetainerService}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              </div>
            </div>

            {/* Retainer Matrix Table */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full min-w-[560px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="py-2.5 px-4 w-5/12">Service / Scope Area</th>
                    <th className="py-2.5 px-3 w-3/12 text-center">Initial Setup</th>
                    <th className="py-2.5 px-3 w-3/12 text-center">Monthly Retainer</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {retainerServices.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/80 bg-white">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={srv.serviceName}
                          onChange={(e) => handleUpdateRetainerService(srv.id, "serviceName", e.target.value)}
                          placeholder="Service Name (e.g. SEO Strategy)"
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                        />
                        <input
                          type="text"
                          value={srv.notes || ""}
                          onChange={(e) => handleUpdateRetainerService(srv.id, "notes", e.target.value)}
                          placeholder="Deliverable scope / frequency notes"
                          className="w-full px-2.5 py-0.5 mt-1 rounded border border-transparent hover:border-slate-200 focus:border-slate-300 text-[11px] text-slate-500 bg-transparent"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          value={srv.initialSetup}
                          onChange={(e) => handleUpdateRetainerService(srv.id, "initialSetup", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-emerald-50 text-emerald-800 text-center cursor-pointer"
                        >
                          <option value="Included">Included</option>
                          <option value="Setup & Launch">Setup & Launch</option>
                          <option value="Optional (+PKR 25,000)">Optional (+PKR 25,000)</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          value={srv.monthlyRetainer}
                          onChange={(e) => handleUpdateRetainerService(srv.id, "monthlyRetainer", e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-indigo-50 text-indigo-800 text-center cursor-pointer"
                        >
                          <option value="Included">Included</option>
                          <option value="Active Monthly">Active Monthly</option>
                          <option value="Optional (+PKR 35,000/mo)">Optional (+PKR 35,000/mo)</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRetainerService(srv.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Dynamic Wording & Retainer Terms Helpers */}
          <div className="bg-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Dynamic Proposal Content & Retainer Agreement Terms
              </span>
              <p className="text-xs text-indigo-800/80">
                Instantly populate professional retainer terms and executive summary wording for this proposal
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onInsertRetainerOverview}
                className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-900 text-xs font-bold shadow-2xs cursor-pointer"
              >
                ✨ Insert Retainer Overview
              </button>
              <button
                type="button"
                onClick={onApplyRetainerTerms}
                className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                📋 Apply Retainer Terms & Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONE-TIME PROJECT OR CUSTOM LINE-ITEMS TABLE */}
      {!isRetainerModel && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Itemized Quotation Line Items
              </h4>
              <p className="text-xs text-slate-400">Fixed deliverables, unit prices, discounts, and taxes</p>
            </div>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-600 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-2.5 px-3 min-w-[220px]">Item / Service Description</th>
                  <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-32 text-right">Unit Price ({currency})</th>
                  <th className="py-2.5 px-2 w-24 text-right">Disc %</th>
                  <th className="py-2.5 px-2 w-24 text-right">Tax %</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {lineItems.map((item) => {
                  const lineSub = (item.quantity || 0) * (item.unitPrice || 0);
                  const discVal = lineSub * ((item.discount || 0) / 100);
                  const afterDisc = lineSub - discVal;
                  const taxVal = afterDisc * ((item.taxRate || 0) / 100);
                  const lineTotal = afterDisc + taxVal;

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                          placeholder="Description of deliverable or service"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discount}
                          onChange={(e) => handleUpdateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 bg-white"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.taxRate}
                          onChange={(e) => handleUpdateLineItem(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 bg-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-extrabold font-mono text-slate-900">
                        {formatCurrency(lineTotal, currency)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View for Line Items */}
          <div className="block sm:hidden space-y-3">
            {lineItems.map((item, index) => {
              const lineSub = (item.quantity || 0) * (item.unitPrice || 0);
              const discVal = lineSub * ((item.discount || 0) / 100);
              const afterDisc = lineSub - discVal;
              const taxVal = afterDisc * ((item.taxRate || 0) / 100);
              const lineTotal = afterDisc + taxVal;

              return (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Item #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xs text-indigo-950">
                        {formatCurrency(lineTotal, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Deliverable Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                      placeholder="Description of deliverable or service"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-center font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit Price ({currency})</label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Disc %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.discount}
                        onChange={(e) => handleUpdateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tax %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.taxRate}
                        onChange={(e) => handleUpdateLineItem(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-right font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calculations Summary Box for One-Time */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <div className="w-full sm:w-80 bg-slate-900 text-white p-6 rounded-3xl space-y-2.5 text-xs shadow-xl">
              <div className="flex justify-between text-slate-300">
                <span>Commercial Subtotal:</span>
                <span className="font-mono">{formatCurrency(financials.subtotal, currency)}</span>
              </div>
              {financials.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount Savings:</span>
                  <span className="font-mono">-{formatCurrency(financials.discountTotal, currency)}</span>
                </div>
              )}
              {financials.taxTotal > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Estimated Tax:</span>
                  <span className="font-mono">+{formatCurrency(financials.taxTotal, currency)}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-3 flex justify-between font-extrabold text-base text-white">
                <span>Grand Total Investment:</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(financials.grandTotal, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
