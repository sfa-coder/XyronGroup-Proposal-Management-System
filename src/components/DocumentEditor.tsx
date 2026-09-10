import React, { useState, useEffect, useMemo } from "react";
import {
  ProposalDocument,
  Client,
  CompanyProfile,
  LineItem,
  Milestone,
  PaymentMilestone,
  IndustryTemplate,
  DocumentStatus,
  PricingModel,
  RetainerServiceItem,
} from "../types";
import { generateDocNumber, formatCurrency } from "../utils/storage";
import { industryTemplates } from "../data/initialData";
import { QuickInsertAgencyTemplateModal } from "./QuickInsertAgencyTemplateModal";
import { CommercialPricingSection, CommercialFinancials } from "./CommercialPricingSection";
import {
  Save,
  Eye,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  User,
  BookOpen,
  FileText,
  DollarSign,
  Send,
  Check,
  ArrowLeft,
  Percent,
  MessageSquare,
  Zap,
  CheckCircle2,
  Layers,
  Clock,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  Building2,
  Info,
  PenTool,
  Repeat,
  TrendingUp,
} from "lucide-react";

interface DocumentEditorProps {
  initialDocument?: ProposalDocument | null;
  defaultType?: "Proposal" | "Quotation";
  defaultClientId?: string;
  existingDocuments: ProposalDocument[];
  clients: Client[];
  company: CompanyProfile;
  onSaveDoc: (doc: ProposalDocument) => void;
  onPreviewPDF: (doc: ProposalDocument) => void;
  onOpenAIGenerator: () => void;
  onOpenNewClientModal: () => void;
  onCancel: () => void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
  onOpenAutoSend?: (doc: ProposalDocument) => void;
  onOpenTemplateManager?: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialDocument,
  defaultType = "Proposal",
  defaultClientId,
  existingDocuments,
  clients,
  company,
  onSaveDoc,
  onPreviewPDF,
  onOpenAIGenerator,
  onOpenNewClientModal,
  onCancel,
  showToast,
  onOpenAutoSend,
  onOpenTemplateManager,
}) => {
  // We unify type to Proposal
  const [docType, setDocType] = useState<"Proposal" | "Quotation">(
    initialDocument?.type || defaultType
  );

  const [docNumber, setDocNumber] = useState<string>(
    initialDocument?.docNumber || generateDocNumber(docType, existingDocuments)
  );

  const [title, setTitle] = useState(initialDocument?.title || "");
  const [status, setStatus] = useState<DocumentStatus>(
    initialDocument?.status || "Draft"
  );
  const [version, setVersion] = useState(initialDocument?.version || "1.0");
  const [preparedBy, setPreparedBy] = useState(initialDocument?.preparedBy || company.name);
  const [senderEmail, setSenderEmail] = useState(
    initialDocument?.senderEmail || company.email || "contact@xyrongroup.com"
  );
  const [senderName, setSenderName] = useState(
    initialDocument?.senderName || initialDocument?.preparedBy || company.name || "XyronGroup Team"
  );
  const [quickInsertModalOpen, setQuickInsertModalOpen] = useState(false);

  // Client Selection State
  const [clientId, setClientId] = useState<string>(
    initialDocument?.clientId || defaultClientId || (clients[0]?.id || "")
  );

  const selectedClient = clients.find((c) => c.id === clientId);

  // Dates
  const today = new Date().toISOString().split("T")[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [issueDate, setIssueDate] = useState(initialDocument?.issueDate || today);
  const [expiryDate, setExpiryDate] = useState(initialDocument?.expiryDate || nextMonth);

  // Proposal Content Fields
  const [overview, setOverview] = useState(initialDocument?.overview || "");
  const [requirements, setRequirements] = useState(initialDocument?.requirements || "");
  const [proposedSolution, setProposedSolution] = useState(initialDocument?.proposedSolution || "");
  const [scopeOfWork, setScopeOfWork] = useState(initialDocument?.scopeOfWork || "");
  const [deliverablesText, setDeliverablesText] = useState<string>(
    initialDocument?.deliverables ? initialDocument.deliverables.join("\n") : ""
  );

  const [providerResponsibilities, setProviderResponsibilities] = useState(
    initialDocument?.responsibilities?.provider ||
      "• Dedicated project team execution & technical delivery.\n• Weekly progress check-in calls & milestone reviews.\n• Comprehensive QA testing, deployment, and 30-day post-launch warranty."
  );
  const [clientResponsibilities, setClientResponsibilities] = useState(
    initialDocument?.responsibilities?.client ||
      "• Timely access to brand assets, APIs, and staging server credentials.\n• Design & milestone review feedback within 3 business days.\n• Prompt disbursement of agreed milestone payments."
  );

  const [milestones, setMilestones] = useState<Milestone[]>(
    initialDocument?.milestones || [
      { id: "m1", name: "Phase 1: Discovery & Architecture", timeline: "2 Weeks", description: "Requirement gathering, system architecture, and UX wireframes." },
      { id: "m2", name: "Phase 2: Execution & Core Engineering", timeline: "4 Weeks", description: "Design systems, frontend/backend engineering, and integrations." },
      { id: "m3", name: "Phase 3: QA, Launch & Handover", timeline: "2 Weeks", description: "User acceptance testing, security checks, production deployment, and training." },
    ]
  );

  // Commercial Pricing Model State
  const [pricingModel, setPricingModel] = useState<PricingModel>(
    initialDocument?.pricingModel || "setup-and-retainer"
  );
  const [setupFee, setSetupFee] = useState<number>(
    initialDocument?.setupFee ?? 325000
  );
  const [monthlyRetainerFee, setMonthlyRetainerFee] = useState<number>(
    initialDocument?.monthlyRetainerFee ?? 210000
  );
  const [engagementMonths, setEngagementMonths] = useState<number>(
    initialDocument?.engagementMonths ?? 6
  );
  const [paymentFrequency, setPaymentFrequency] = useState<string>(
    initialDocument?.paymentFrequency || "Monthly in Advance"
  );
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    initialDocument?.discountType || "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialDocument?.discountValue ?? 0
  );
  const [taxEnabled, setTaxEnabled] = useState<boolean>(
    initialDocument?.taxEnabled ?? false
  );
  const [taxRate, setTaxRate] = useState<number>(
    initialDocument?.taxRate ?? company.defaultTaxRate ?? 0
  );
  const [customPricingNotes, setCustomPricingNotes] = useState<string>(
    initialDocument?.customPricingNotes || ""
  );

  // Retainer Core Services Matrix
  const [retainerServices, setRetainerServices] = useState<RetainerServiceItem[]>(
    initialDocument?.retainerServices || [
      {
        id: "rs_1",
        serviceName: "SEO Strategy & Optimization",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Technical site audit, on-page optimization & high-intent commercial keyword rankings",
      },
      {
        id: "rs_2",
        serviceName: "Local SEO & GBP Management",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Google Business Profiles (multi-location setup), local citations & maps authority",
      },
      {
        id: "rs_3",
        serviceName: "Social Media Management",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Monthly content calendar, static/carousel graphics, copywriting & community management",
      },
      {
        id: "rs_4",
        serviceName: "Content Creation",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "High-authority articles, copywriting, infographics & brand asset production",
      },
      {
        id: "rs_5",
        serviceName: "Short-Form Video Content",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Short-form vertical video production (Reels/TikTok) with viral hooks & editing",
      },
      {
        id: "rs_6",
        serviceName: "Reporting & Optimization",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Bi-weekly syncs, monthly ROI analytics, KPI tracking & conversion optimization",
      },
    ]
  );

  // Commercial Line Items (for One-Time / Custom)
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialDocument?.lineItems || [
      { id: "li_1", description: "Initial Setup, Technical Architecture & Launch Onboarding", quantity: 1, unitPrice: 325000, discount: 0, taxRate: 0 },
      { id: "li_2", description: "Monthly Organic Growth, Content & Digital Marketing Retainer", quantity: 5, unitPrice: 210000, discount: 0, taxRate: 0 },
    ]
  );

  // Payment Schedule
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentMilestone[]>(
    initialDocument?.paymentSchedule || [
      { id: "ps_1", description: "Initial Setup & Month 1 Launch Investment", percentage: 24, amount: 325000, dueCondition: "Upon Agreement Signing" },
      { id: "ps_2", description: "Recurring Monthly Retainer (Months 2–6)", percentage: 76, amount: 1050000, dueCondition: "1st of each month in advance" },
    ]
  );

  const [termsAndConditions, setTermsAndConditions] = useState(
    initialDocument?.termsAndConditions ||
      company.paymentTerms ||
      "Payment Terms: The initial setup and first-month investment of PKR 325,000 is payable upon agreement signing. The recurring monthly retainer of PKR 210,000 is payable in advance at the beginning of each subsequent month.\n\nMinimum Engagement: A minimum 6-month engagement is recommended to allow sufficient time for SEO growth, content consistency, audience development, and measurable performance improvements."
  );

  // Acceptance & Sign-off Details
  const [acceptanceAccepted, setAcceptanceAccepted] = useState(
    initialDocument?.acceptanceDetails?.accepted || initialDocument?.status === "Accepted" || false
  );
  const [authorizedName, setAuthorizedName] = useState(
    initialDocument?.acceptanceDetails?.authorizedName || selectedClient?.name || ""
  );
  const [authorizedCompany, setAuthorizedCompany] = useState(
    initialDocument?.acceptanceDetails?.authorizedCompany || selectedClient?.company || ""
  );
  const [authorizedDate, setAuthorizedDate] = useState(
    initialDocument?.acceptanceDetails?.authorizedDate || today
  );
  const [acceptanceNotes, setAcceptanceNotes] = useState(
    initialDocument?.acceptanceDetails?.notes || "Approved as presented. Work authorized to begin."
  );

  // Provider Signatory & Representative Details
  const [providerSignatoryName, setProviderSignatoryName] = useState(
    initialDocument?.providerSignatoryName ?? company.signatoryName ?? `${company.name || "XyronGroup"} Authorized Signatory`
  );
  const [providerSignatoryTitle, setProviderSignatoryTitle] = useState(
    initialDocument?.providerSignatoryTitle ?? company.signatoryTitle ?? "Service Provider Representative"
  );
  const [providerSignatorySubtitle, setProviderSignatorySubtitle] = useState(
    initialDocument?.providerSignatorySubtitle ?? company.signatorySubtitle ?? company.name ?? "XyronGroup"
  );
  const [providerSignatureUrl, setProviderSignatureUrl] = useState(
    initialDocument?.providerSignatureUrl ?? company.signatureImageUrl ?? ""
  );

  const handleProviderSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProviderSignatureUrl(reader.result as string);
        showToast("Signature Uploaded", "Provider official signature image added.", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  // Real-time Commercial & Financial Calculations
  const financials: CommercialFinancials = useMemo(() => {
    const currency = company.currency || "PKR";
    const months = Math.max(1, Number(engagementMonths) || 1);
    const monthsRemaining = Math.max(0, months - 1);

    if (pricingModel === "setup-and-retainer") {
      const setup = Math.max(0, Number(setupFee) || 0);
      const monthly = Math.max(0, Number(monthlyRetainerFee) || 0);
      const remainingTotal = monthly * monthsRemaining;
      // Formula: Total = Setup (Month 1) + Monthly * (Months - 1)
      const subtotal = months === 1 ? setup : setup + remainingTotal;

      let discountVal = 0;
      if (discountType === "percentage") {
        const pct = Math.min(100, Math.max(0, Number(discountValue) || 0));
        discountVal = Math.round(subtotal * (pct / 100));
      } else {
        discountVal = Math.min(subtotal, Math.max(0, Number(discountValue) || 0));
      }

      const taxableAmount = Math.max(0, subtotal - discountVal);
      let taxVal = 0;
      if (taxEnabled) {
        const tRate = Math.min(100, Math.max(0, Number(taxRate) || 0));
        taxVal = Math.round(taxableAmount * (tRate / 100));
      }

      const grandTotal = taxableAmount + taxVal;

      return {
        subtotal,
        discountTotal: discountVal,
        taxTotal: taxVal,
        grandTotal,
        firstMonthPayable: setup,
        recurringMonthlyPayable: monthly,
        months,
        monthsRemaining,
        remainingTotal,
      };
    } else if (pricingModel === "monthly-retainer") {
      const monthly = Math.max(0, Number(monthlyRetainerFee) || 0);
      const subtotal = monthly * months;

      let discountVal = 0;
      if (discountType === "percentage") {
        const pct = Math.min(100, Math.max(0, Number(discountValue) || 0));
        discountVal = Math.round(subtotal * (pct / 100));
      } else {
        discountVal = Math.min(subtotal, Math.max(0, Number(discountValue) || 0));
      }

      const taxableAmount = Math.max(0, subtotal - discountVal);
      let taxVal = 0;
      if (taxEnabled) {
        const tRate = Math.min(100, Math.max(0, Number(taxRate) || 0));
        taxVal = Math.round(taxableAmount * (tRate / 100));
      }

      const grandTotal = taxableAmount + taxVal;

      return {
        subtotal,
        discountTotal: discountVal,
        taxTotal: taxVal,
        grandTotal,
        firstMonthPayable: monthly,
        recurringMonthlyPayable: monthly,
        months,
        monthsRemaining,
        remainingTotal: monthly * monthsRemaining,
      };
    } else {
      // One-Time Project or Custom Model based on line items
      let subtotal = 0;
      let taxTotal = 0;
      let discountTotal = 0;

      lineItems.forEach((item) => {
        const lineSub = (item.quantity || 0) * (item.unitPrice || 0);
        const discVal = lineSub * ((item.discount || 0) / 100);
        const afterDisc = lineSub - discVal;
        const taxVal = afterDisc * ((item.taxRate || 0) / 100);

        subtotal += lineSub;
        discountTotal += discVal;
        taxTotal += taxVal;
      });

      const grandTotal = subtotal - discountTotal + taxTotal;

      return {
        subtotal,
        discountTotal,
        taxTotal,
        grandTotal,
        firstMonthPayable: grandTotal,
        recurringMonthlyPayable: 0,
        months: 1,
        monthsRemaining: 0,
        remainingTotal: 0,
      };
    }
  }, [
    pricingModel,
    setupFee,
    monthlyRetainerFee,
    engagementMonths,
    discountType,
    discountValue,
    taxEnabled,
    taxRate,
    lineItems,
    company.currency,
  ]);

  const { subtotal, discountTotal, taxTotal, grandTotal } = financials;

  // Line item handlers
  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: "New Item / Commercial Service Description",
      quantity: 1,
      unitPrice: 10000,
      discount: 0,
      taxRate: taxEnabled ? taxRate : (company.defaultTaxRate || 0),
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, val: any) => {
    setLineItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, [field]: val } : li))
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) {
      showToast("Cannot Delete", "At least one item is required in the commercial quotation.", "warning");
      return;
    }
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  // Milestone handlers
  const handleAddMilestone = () => {
    const newM: Milestone = {
      id: `m_${Date.now()}`,
      name: `Phase ${milestones.length + 1}: `,
      timeline: "2 Weeks",
      description: "Milestone deliverable and objective description",
    };
    setMilestones([...milestones, newM]);
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  // Payment Schedule Handlers
  const handleAddPaymentMilestone = () => {
    const nextMonth = paymentSchedule.length + 1;
    const defaultAmount = monthlyRetainerFee > 0 ? monthlyRetainerFee : (grandTotal > 0 ? Math.round(grandTotal / (nextMonth || 1)) : 50000);
    const defaultPct = grandTotal > 0 ? Math.round((defaultAmount / grandTotal) * 1000) / 10 : 0;
    
    const newPM: PaymentMilestone = {
      id: `pm_${Date.now()}`,
      description: `Stage ${nextMonth} Milestone Payment`,
      percentage: defaultPct,
      amount: defaultAmount,
      dueCondition: `1st of Month ${nextMonth} / Upon Stage Delivery`,
    };
    setPaymentSchedule([...paymentSchedule, newPM]);
  };

  const handleAddRecurringMonthlyMilestone = () => {
    const nextMonthIndex = paymentSchedule.length + 1;
    const recurringAmt = monthlyRetainerFee > 0 ? monthlyRetainerFee : 210000;
    const pct = grandTotal > 0 ? Math.round((recurringAmt / grandTotal) * 1000) / 10 : 0;

    const newPM: PaymentMilestone = {
      id: `pm_rec_${Date.now()}`,
      description: `Month ${nextMonthIndex} Recurring Retainer (SEO & Social Marketing)`,
      percentage: pct,
      amount: recurringAmt,
      dueCondition: `1st of Month ${nextMonthIndex} in Advance`,
    };
    setPaymentSchedule([...paymentSchedule, newPM]);
    showToast("Monthly Milestone Added", `Added Month ${nextMonthIndex} recurring milestone for ${formatCurrency(recurringAmt, company.currency)}.`, "success");
  };

  const handleUpdatePaymentMilestone = (id: string, field: keyof PaymentMilestone, val: any) => {
    setPaymentSchedule((prev) =>
      prev.map((pm) => {
        if (pm.id === id) {
          const updated = { ...pm, [field]: val };
          if (field === "percentage") {
            const pct = parseFloat(val) || 0;
            updated.percentage = pct;
            if (grandTotal > 0) {
              updated.amount = Math.round((grandTotal * (pct / 100)) * 100) / 100;
            }
          } else if (field === "amount") {
            const amt = parseFloat(val) || 0;
            updated.amount = amt;
            if (grandTotal > 0) {
              updated.percentage = Math.round((amt / grandTotal) * 1000) / 10;
            }
          }
          return updated;
        }
        return pm;
      })
    );
  };

  const handleRemovePaymentMilestone = (id: string) => {
    setPaymentSchedule((prev) => prev.filter((pm) => pm.id !== id));
  };

  const handleApplyPresetPaymentPlan = (type: "50-50" | "40-30-30" | "30-40-30" | "100" | "retainer-6m") => {
    if (type === "50-50") {
      setPaymentSchedule([
        { id: `pm_${Date.now()}_1`, description: "50% Upfront Deposit upon Agreement Signing", percentage: 50, amount: grandTotal * 0.5, dueCondition: "Project Initiation" },
        { id: `pm_${Date.now()}_2`, description: "50% Final Payment upon Sign-off & Delivery", percentage: 50, amount: grandTotal * 0.5, dueCondition: "Final Delivery" },
      ]);
    } else if (type === "40-30-30") {
      setPaymentSchedule([
        { id: `pm_${Date.now()}_1`, description: "40% Upfront Deposit upon Agreement Signing", percentage: 40, amount: grandTotal * 0.4, dueCondition: "Project Initiation" },
        { id: `pm_${Date.now()}_2`, description: "30% Midpoint Review & Core Execution", percentage: 30, amount: grandTotal * 0.3, dueCondition: "Design/Build Approval" },
        { id: `pm_${Date.now()}_3`, description: "30% Final Delivery & Handover", percentage: 30, amount: grandTotal * 0.3, dueCondition: "Final Deployment" },
      ]);
    } else if (type === "30-40-30") {
      setPaymentSchedule([
        { id: `pm_${Date.now()}_1`, description: "30% Upfront Deposit upon Agreement Signing", percentage: 30, amount: grandTotal * 0.3, dueCondition: "Project Kick-off" },
        { id: `pm_${Date.now()}_2`, description: "40% Midpoint Deliverables", percentage: 40, amount: grandTotal * 0.4, dueCondition: "Milestone Completion" },
        { id: `pm_${Date.now()}_3`, description: "30% Final Sign-off & Handover", percentage: 30, amount: grandTotal * 0.3, dueCondition: "Final Deployment" },
      ]);
    } else if (type === "100") {
      setPaymentSchedule([
        { id: `pm_${Date.now()}_1`, description: "100% Upfront Project Investment", percentage: 100, amount: grandTotal, dueCondition: "Upon Agreement Signing" },
      ]);
    } else if (type === "retainer-6m") {
      const month1 = setupFee > 0 ? setupFee : (financials.firstMonthPayable || 325000);
      const monthly = monthlyRetainerFee > 0 ? monthlyRetainerFee : 210000;
      const count = engagementMonths || 6;
      
      const schedule: PaymentMilestone[] = [
        {
          id: `pm_${Date.now()}_1`,
          description: "Month 1 / Initial Setup & Onboarding Investment",
          percentage: grandTotal > 0 ? Math.round((month1 / grandTotal) * 1000) / 10 : 23.6,
          amount: month1,
          dueCondition: "Upon Agreement Signing & Onboarding Kick-off",
        },
      ];

      for (let i = 2; i <= count; i++) {
        schedule.push({
          id: `pm_${Date.now()}_${i}`,
          description: `Month ${i} Recurring Retainer (SEO, Social & Content Growth)`,
          percentage: grandTotal > 0 ? Math.round((monthly / grandTotal) * 1000) / 10 : 15.3,
          amount: monthly,
          dueCondition: `1st of Month ${i} in Advance`,
        });
      }
      setPaymentSchedule(schedule);
    }
    showToast("Payment Schedule Updated", `Applied ${type} payment milestones.`, "info");
  };

  // Insert Industry Template
  const handleApplyTemplate = (tpl: IndustryTemplate) => {
    setTitle(tpl.title);
    setOverview(tpl.defaultOverview);
    setScopeOfWork(tpl.defaultScope);
    setDeliverablesText(tpl.defaultDeliverables.join("\n"));
    setMilestones(
      tpl.defaultMilestones.map((m, idx) => ({
        id: `tpl_m_${idx}`,
        name: m.name,
        timeline: m.timeline,
        description: m.description,
      }))
    );
    setLineItems(
      tpl.defaultLineItems.map((li, idx) => ({
        id: `tpl_li_${idx}`,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        discount: 0,
        taxRate: li.taxRate || company.defaultTaxRate || 10,
      }))
    );
    showToast("Template Applied", `Loaded complete structured preset: ${tpl.title}`, "info");
  };

  // Modular Agency Services Insert Handler
  const handleInsertAgencyServices = (data: {
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
  }) => {
    setTitle(data.title);
    setOverview(data.overview);
    setRequirements(data.requirements);
    setProposedSolution(data.proposedSolution);
    setScopeOfWork(data.scopeOfWork);
    setDeliverablesText(data.deliverables.join("\n"));
    setProviderResponsibilities(data.providerResponsibilities);
    setClientResponsibilities(data.clientResponsibilities);
    setMilestones(
      data.milestones.map((m, idx) => ({
        id: `srv_m_${Date.now()}_${idx}`,
        name: m.name,
        timeline: m.timeline,
        description: m.description,
      }))
    );
    setLineItems(
      data.lineItems.map((li, idx) => ({
        id: `srv_li_${Date.now()}_${idx}`,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        discount: li.discount,
        taxRate: li.taxRate || company.defaultTaxRate || 10,
      }))
    );
    setPaymentSchedule(
      data.paymentSchedule.map((pm, idx) => ({
        id: `srv_pm_${Date.now()}_${idx}`,
        description: pm.description,
        percentage: pm.percentage,
        amount: Math.round((grandTotal * (pm.percentage / 100)) * 100) / 100,
        dueCondition: pm.dueCondition,
      }))
    );
  };

  // Retainer Terms & Content Helper Handlers
  const handleApplyRetainerTerms = () => {
    const currency = company.currency || "PKR";
    const formattedSetup = formatCurrency(setupFee, currency);
    const formattedMonthly = formatCurrency(monthlyRetainerFee, currency);

    if (pricingModel === "setup-and-retainer") {
      setTermsAndConditions(
        `Payment Terms: The initial setup and first-month investment of ${formattedSetup} is payable upon agreement signing. The recurring monthly retainer of ${formattedMonthly} is payable in advance at the beginning of each subsequent month.\n\nMinimum Engagement: A minimum ${engagementMonths}-month engagement is recommended to allow sufficient time for SEO growth, content consistency, audience development, and measurable performance improvements.\n\nService Adjustments: Additional scope, third-party advertising budgets, or specialized software licenses outside this schedule will be quoted separately upon mutual consent.`
      );

      // Auto-populate 2-stage retainer payment schedule
      const firstMonthPct = Math.round((financials.firstMonthPayable / (financials.grandTotal || 1)) * 100);
      const remainingPct = Math.max(0, 100 - firstMonthPct);

      setPaymentSchedule([
        {
          id: `ps_ret_1`,
          description: `Initial Setup & Month 1 Launch Investment (${formattedSetup})`,
          percentage: firstMonthPct,
          amount: financials.firstMonthPayable,
          dueCondition: "Upon Agreement Signing & Onboarding",
        },
        ...(engagementMonths > 1
          ? [
              {
                id: `ps_ret_2`,
                description: `Recurring Monthly Retainer (Months 2–${engagementMonths}: ${engagementMonths - 1} × ${formattedMonthly}/mo)`,
                percentage: remainingPct,
                amount: financials.remainingTotal,
                dueCondition: "Invoiced on 1st of each month in advance",
              },
            ]
          : []),
      ]);
      showToast(
        "Retainer Terms & Schedule Applied",
        `Updated commercial payment terms and milestone disbursement for ${engagementMonths}-month engagement.`,
        "success"
      );
    } else if (pricingModel === "monthly-retainer") {
      setTermsAndConditions(
        `Payment Terms: The monthly retainer of ${formattedMonthly} is payable in advance at the beginning of each service cycle.\n\nMinimum Engagement: A minimum ${engagementMonths}-month engagement is required to maintain ongoing momentum and target KPIs.`
      );

      setPaymentSchedule([
        {
          id: `ps_ret_1`,
          description: `Month 1 Retainer Investment (${formattedMonthly})`,
          percentage: Math.round(100 / engagementMonths),
          amount: monthlyRetainerFee,
          dueCondition: "Upon Agreement Signing",
        },
        ...(engagementMonths > 1
          ? [
              {
                id: `ps_ret_2`,
                description: `Subsequent Retainers (Months 2–${engagementMonths}: ${engagementMonths - 1} × ${formattedMonthly}/mo)`,
                percentage: Math.round(((engagementMonths - 1) / engagementMonths) * 100),
                amount: monthlyRetainerFee * (engagementMonths - 1),
                dueCondition: "Invoiced on 1st of each month in advance",
              },
            ]
          : []),
      ]);
      showToast("Monthly Retainer Terms Applied", "Retainer schedule generated.", "success");
    }
  };

  const handleInsertRetainerOverview = () => {
    const retainerText = `The proposed engagement is structured as an initial setup and launch phase followed by a monthly growth retainer. A minimum ${engagementMonths}-month engagement is recommended to establish consistent digital performance, strengthen organic visibility, and generate measurable results.`;
    
    if (overview.includes("initial setup and launch phase followed by a monthly growth retainer")) {
      showToast("Overview Already Updated", "Executive summary already contains retainer strategy.", "info");
      return;
    }

    setOverview((prev) => (prev ? `${prev}\n\n${retainerText}` : retainerText));
    showToast("Retainer Overview Added", "Executive summary updated with minimum engagement scope.", "success");
  };

  // Build Unified Proposal Document Object
  const buildDocumentObject = (overrideStatus?: "Draft" | "Sent" | "Accepted" | "Rejected"): ProposalDocument => {
    const deliverablesList = deliverablesText
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const effectiveStatus = overrideStatus || (acceptanceAccepted ? "Accepted" : status);

    return {
      id: initialDocument ? initialDocument.id : `doc_${Date.now()}`,
      docNumber,
      title: title || `Proposal & Quotation for ${selectedClient ? selectedClient.name : "Client"}`,
      type: "Proposal",
      status: effectiveStatus,
      version,
      preparedBy,
      senderEmail,
      senderName,
      clientId: selectedClient?.id || "",
      clientName: selectedClient?.name || "Valued Client",
      clientCompany: selectedClient?.company || "",
      clientEmail: selectedClient?.email || "",
      clientAddress: selectedClient?.address || "",
      clientTaxId: selectedClient?.taxId || "",
      issueDate,
      expiryDate,
      overview,
      requirements,
      proposedSolution,
      scopeOfWork,
      deliverables: deliverablesList,
      responsibilities: {
        provider: providerResponsibilities,
        client: clientResponsibilities,
      },
      milestones,
      pricingModel,
      setupFee,
      monthlyRetainerFee,
      engagementMonths,
      paymentFrequency,
      discountType,
      discountValue,
      taxEnabled,
      taxRate: taxEnabled ? taxRate : 0,
      customPricingNotes,
      retainerServices,
      firstMonthTotal: financials.firstMonthPayable,
      recurringMonthlyAmount: financials.recurringMonthlyPayable,
      lineItems,
      subtotal: financials.subtotal,
      taxTotal: financials.taxTotal,
      discountTotal: financials.discountTotal,
      grandTotal: financials.grandTotal,
      paymentSchedule,
      termsAndConditions,
      providerSignatoryName,
      providerSignatoryTitle,
      providerSignatorySubtitle,
      providerSignatureUrl,
      acceptanceDetails: {
        accepted: acceptanceAccepted || effectiveStatus === "Accepted",
        authorizedName: authorizedName || selectedClient?.name,
        authorizedCompany: authorizedCompany || selectedClient?.company,
        authorizedDate: authorizedDate || today,
        notes: acceptanceNotes,
      },
      companySnapshot: company,
      createdAt: initialDocument ? initialDocument.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = (newStatus?: "Draft" | "Sent" | "Accepted") => {
    if (!title.trim()) {
      showToast("Title Required", "Please enter a title for this proposal.", "warning");
      return;
    }
    if (pricingModel === "setup-and-retainer" && setupFee <= 0 && monthlyRetainerFee <= 0) {
      showToast("Pricing Required", "Please enter a valid Setup Fee or Monthly Retainer amount.", "warning");
      return;
    }
    if (engagementMonths < 1) {
      showToast("Invalid Engagement", "Minimum engagement period must be at least 1 month.", "warning");
      return;
    }

    const docObj = buildDocumentObject(newStatus);
    onSaveDoc(docObj);
    showToast(
      "Proposal Saved",
      `${docObj.docNumber} saved with ${pricingModel.replace("-", " ")} pricing (${formatCurrency(docObj.grandTotal, company.currency || "PKR")}).`,
      "success"
    );
  };

  const handlePreviewPDFClick = () => {
    const docObj = buildDocumentObject();
    onPreviewPDF(docObj);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Editor Top Bar */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Back to Document List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-lg text-white font-mono">{docNumber}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Unified Proposal & Quotation
              </span>
              {acceptanceAccepted && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Signed & Accepted
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              {title || "Untitled Business Proposal & Quotation"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#4F46E5] hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Assist</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("Draft")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("Sent")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mark Sent</span>
          </button>

          {onOpenAutoSend && (
            <button
              type="button"
              onClick={() => {
                const currentDoc = buildDocumentObject();
                onOpenAutoSend(currentDoc);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer"
              title="Auto-Send Proposal via Email or WhatsApp"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-Send</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePreviewPDFClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live Printable PDF</span>
          </button>
        </div>
      </div>

      {/* Industry Templates Quick Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Quick Insert Industry Template — Agency Services
              </h3>
              <p className="text-[11px] text-slate-400">
                Modular 9-Service Suite (Web, 360 Marketing, SEO, Branding, IT, SaaS, Software, Content)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickInsertModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Modular Service Inserter</span>
            </button>
            {onOpenTemplateManager && (
              <button
                type="button"
                onClick={onOpenTemplateManager}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Manage Presets</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {industryTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl)}
              className="p-3 rounded-2xl text-left bg-[#F8FAFC] hover:bg-indigo-50/70 border border-slate-200/60 text-slate-800 hover:text-indigo-900 text-xs font-medium transition-all group cursor-pointer"
            >
              <span className="font-extrabold block truncate group-hover:text-[#4F46E5]">{tpl.title}</span>
              <span className="text-[10px] text-slate-400 block truncate">{tpl.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. Header Info & Client Selection */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#4F46E5]" />
          1. Document Metadata & Client Target
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Format</label>
            <div className="p-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs font-bold text-[#4F46E5] flex items-center justify-between">
              <span>Business Proposal & Quotation</span>
              <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Reference Number</label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted (Approved)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Proposal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next-Gen Enterprise Web Portal Redesign & API Integration"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Client / Organization *</label>
              <button
                type="button"
                onClick={onOpenNewClientModal}
                className="text-xs text-[#4F46E5] font-semibold hover:underline"
              >
                + Add New Client to CRM
              </button>
            </div>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company ? `${c.company} • ` : ""}{c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Email Sender Configuration Fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sender Email (From Email)
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="contact@xyrongroup.com"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sender Name / Prepared By
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => {
                setSenderName(e.target.value);
                setPreparedBy(e.target.value);
              }}
              placeholder="XyronGroup Team"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proposal Version</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1.0"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] bg-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Executive Summary, Requirements & Solution */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#4F46E5]" />
          2. Executive Summary, Objectives & Proposed Solution
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Summary / Project Background</label>
            <textarea
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="High-level background, strategic goal, target market context, and solution vision..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Requirements & Key Objectives</label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="• Improve customer conversion rate by 35%&#10;• Eliminate manual data entry via REST APIs&#10;• Mobile responsive, accessible WCAG AA standards"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Solution & Strategic Value</label>
              <textarea
                rows={3}
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                placeholder="Modern, headless web architecture engineered for speed, high scalability, and seamless integration with existing CRM systems..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scope of Work, Deliverables & Responsibilities */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-[#4F46E5]" />
          3. Detailed Scope of Work, Deliverables & Responsibilities
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope of Work Breakdown</label>
            <textarea
              rows={4}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="• Discovery & Architecture: User research, data modeling, wireframes&#10;• UX/UI Design: Design systems, high-fidelity prototypes&#10;• Engineering: Frontend portal, backend services, payment gateways&#10;• Deployment: Cloud staging, UAT testing, DNS switchover"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tangible Deliverables (One item per line)
            </label>
            <textarea
              rows={3}
              value={deliverablesText}
              onChange={(e) => setDeliverablesText(e.target.value)}
              placeholder="Interactive Figma Design Prototypes & Design Tokens&#10;Production-ready React 19 Frontend Web Application&#10;RESTful API Documentation & Secure Middleware&#10;Admin Training Session & 30-Day Launch Warranty"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Responsibilities ({company.name})</label>
              <textarea
                rows={3}
                value={providerResponsibilities}
                onChange={(e) => setProviderResponsibilities(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Responsibilities ({selectedClient?.name || "Client"})</label>
              <textarea
                rows={3}
                value={clientResponsibilities}
                onChange={(e) => setClientResponsibilities(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Project Roadmap & Milestones */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4F46E5]" />
            4. Project Implementation Schedule & Milestones
          </h2>
          <button
            type="button"
            onClick={handleAddMilestone}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Phase</span>
          </button>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div key={m.id} className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="flex sm:hidden items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Roadmap Milestone #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(m.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Remove milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="sm:col-span-4">
                <label className="block sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Phase Title
                </label>
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => setMilestones(milestones.map((item) => (item.id === m.id ? { ...item, name: e.target.value } : item)))}
                  placeholder="Phase Title (e.g. Phase 1: UX Design)"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Timeline
                </label>
                <input
                  type="text"
                  value={m.timeline}
                  onChange={(e) => setMilestones(milestones.map((item) => (item.id === m.id ? { ...item, timeline: e.target.value } : item)))}
                  placeholder="Timeline (e.g. Weeks 1-2)"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Deliverables & Scope
                </label>
                <input
                  type="text"
                  value={m.description}
                  onChange={(e) => setMilestones(milestones.map((item) => (item.id === m.id ? { ...item, description: e.target.value } : item)))}
                  placeholder="Phase Deliverables & Scope"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <div className="hidden sm:block sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(m.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Investment & Commercial Quotation */}
      <CommercialPricingSection
        pricingModel={pricingModel}
        onPricingModelChange={(m) => {
          setPricingModel(m);
          if (m === "setup-and-retainer" && setupFee === 0 && monthlyRetainerFee === 0) {
            setSetupFee(325000);
            setMonthlyRetainerFee(210000);
            setEngagementMonths(6);
          }
        }}
        setupFee={setupFee}
        onSetupFeeChange={setSetupFee}
        monthlyRetainerFee={monthlyRetainerFee}
        onMonthlyRetainerFeeChange={setMonthlyRetainerFee}
        engagementMonths={engagementMonths}
        onEngagementMonthsChange={setEngagementMonths}
        paymentFrequency={paymentFrequency}
        onPaymentFrequencyChange={setPaymentFrequency}
        discountType={discountType}
        onDiscountTypeChange={setDiscountType}
        discountValue={discountValue}
        onDiscountValueChange={setDiscountValue}
        taxEnabled={taxEnabled}
        onTaxEnabledChange={setTaxEnabled}
        taxRate={taxRate}
        onTaxRateChange={setTaxRate}
        customPricingNotes={customPricingNotes}
        onCustomPricingNotesChange={setCustomPricingNotes}
        lineItems={lineItems}
        onLineItemsChange={setLineItems}
        onChangeLineItems={setLineItems}
        onAddLineItem={handleAddLineItem}
        onUpdateLineItem={handleUpdateLineItem}
        onRemoveLineItem={handleRemoveLineItem}
        retainerServices={retainerServices}
        onRetainerServicesChange={setRetainerServices}
        onChangeRetainerServices={setRetainerServices}
        onAddRetainerService={(item) => setRetainerServices([...retainerServices, item])}
        onUpdateRetainerService={(id, field, val) =>
          setRetainerServices(
            retainerServices.map((rs) => (rs.id === id ? { ...rs, [field]: val } : rs))
          )
        }
        onRemoveRetainerService={(id) =>
          setRetainerServices(retainerServices.filter((rs) => rs.id !== id))
        }
        currency={company.currency || "PKR"}
        financials={financials}
        onApplyRetainerTerms={handleApplyRetainerTerms}
        onInsertRetainerOverview={handleInsertRetainerOverview}
      />

      {/* 6. Milestone-Based Payment Schedule */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#4F46E5]" />
              6. Milestone-Based Payment Schedule
            </h2>
            <p className="text-xs text-slate-400">
              Schedule upfront setup/deposit and recurring monthly disbursements (e.g. Month 1 setup + Months 2–6 retainers)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => handleApplyPresetPaymentPlan("50-50")}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs transition-all"
                title="50% Deposit / 50% Delivery"
              >
                50/50
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetPaymentPlan("40-30-30")}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs transition-all"
                title="40% Kick-off / 30% Midpoint / 30% Sign-off"
              >
                40/30/30
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetPaymentPlan("100")}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs transition-all"
                title="100% Upfront"
              >
                100% Upfront
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetPaymentPlan("retainer-6m")}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-white hover:shadow-xs text-indigo-700 font-bold transition-all"
                title="Month 1 Setup + Months 2-6 Monthly Retainers"
              >
                📅 Setup + 5-Mo Retainers
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleAddRecurringMonthlyMilestone}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
                title="Add a recurring monthly installment (e.g. Month 2, 3, etc.)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Monthly Retainer</span>
              </button>
              <button
                type="button"
                onClick={handleAddPaymentMilestone}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="sm:col-span-5">Milestone / Installment Stage</div>
            <div className="sm:col-span-2 text-center">Share / %</div>
            <div className="sm:col-span-2 text-right">Amount ({company.currency || "PKR"})</div>
            <div className="sm:col-span-2">Due Condition / Terms</div>
            <div className="sm:col-span-1"></div>
          </div>

          {paymentSchedule.map((pm, idx) => (
            <div
              key={pm.id}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="flex sm:hidden items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Payment Stage #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePaymentMilestone(pm.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Remove milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="sm:col-span-5">
                <label className="block sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Milestone Description
                </label>
                <input
                  type="text"
                  value={pm.description}
                  onChange={(e) => handleUpdatePaymentMilestone(pm.id, "description", e.target.value)}
                  placeholder="Payment Milestone Stage"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Share / %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={pm.percentage}
                    onChange={(e) => handleUpdatePaymentMilestone(pm.id, "percentage", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 pr-6 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-slate-400">%</span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Amount ({company.currency || "PKR"})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={pm.amount}
                    onChange={(e) => handleUpdatePaymentMilestone(pm.id, "amount", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 text-right bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Due Condition / Terms
                </label>
                <input
                  type="text"
                  value={pm.dueCondition || ""}
                  onChange={(e) => handleUpdatePaymentMilestone(pm.id, "dueCondition", e.target.value)}
                  placeholder="e.g. 1st of Month / Kick-off"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
              </div>
              <div className="hidden sm:block sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemovePaymentMilestone(pm.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Remove milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Schedule Totals Bar */}
          {paymentSchedule.length > 0 && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
              <div className="text-slate-500">
                💡 <span className="font-semibold text-slate-700">{paymentSchedule.length} payment stage(s) scheduled.</span> You can edit both the amount and % directly.
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Total Scheduled Disbursements:</span>
                <span className="font-mono font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  {formatCurrency(paymentSchedule.reduce((sum, pm) => sum + (pm.amount || 0), 0), company.currency || "PKR")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. Terms & Commercial Agreement */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
          7. Terms & Conditions / Service Level Agreement
        </h2>
        <textarea
          rows={3}
          value={termsAndConditions}
          onChange={(e) => setTermsAndConditions(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
        />
      </div>

      {/* 8. Commercial Authorization & Signatures */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            8. Commercial Signatures & Authorization
          </h2>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={acceptanceAccepted}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setAcceptanceAccepted(isChecked);
                if (isChecked) setStatus("Accepted");
              }}
              className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]"
            />
            <span className="text-xs font-bold text-slate-800">Record as Accepted & Authorized</span>
          </label>
        </div>

        {/* 2-Column Signatory Layout: Provider (Left) & Client (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Provider Signatory Box */}
          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                Service Provider Signatory
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                Left Signature Block
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Authorized Signatory Name / Signature *
                </label>
                <input
                  type="text"
                  value={providerSignatoryName}
                  onChange={(e) => setProviderSignatoryName(e.target.value)}
                  placeholder="e.g. XyronGroup Authorized Signatory or Faraz Ahmed Sheikh"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Rendered in script/cursive styling above the line.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Representative Role / Title *
                </label>
                <input
                  type="text"
                  value={providerSignatoryTitle}
                  onChange={(e) => setProviderSignatoryTitle(e.target.value)}
                  placeholder="e.g. Service Provider Representative"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Direct title below signature line.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provider Organization / Subtitle
                </label>
                <input
                  type="text"
                  value={providerSignatorySubtitle}
                  onChange={(e) => setProviderSignatorySubtitle(e.target.value)}
                  placeholder="e.g. XyronGroup"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Provider Signature Image (PNG/JPG)
                </label>
                {providerSignatureUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                    <img src={providerSignatureUrl} alt="Signature" className="max-h-8 object-contain" />
                    <button
                      type="button"
                      onClick={() => setProviderSignatureUrl("")}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProviderSignatureUpload}
                    className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-indigo-50 file:text-indigo-600 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Client Acceptance Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Client Acceptance & Authorization
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                Right Signature Block
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Client Signee</label>
                <input
                  type="text"
                  value={authorizedName}
                  onChange={(e) => setAuthorizedName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Title / Organization</label>
                <input
                  type="text"
                  value={authorizedCompany}
                  onChange={(e) => setAuthorizedCompany(e.target.value)}
                  placeholder="e.g. Chief Technology Officer"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Acceptance Date</label>
                <input
                  type="date"
                  value={authorizedDate}
                  onChange={(e) => setAuthorizedDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Acceptance Notes / Purchase Order Reference</label>
                <input
                  type="text"
                  value={acceptanceNotes}
                  onChange={(e) => setAcceptanceNotes(e.target.value)}
                  placeholder="e.g. Approved per Master Service Agreement #2026-PO991"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="order-3 sm:order-1 px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer text-center"
        >
          Cancel
        </button>
        <div className="order-1 sm:order-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleSave("Draft")}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-sm cursor-pointer text-center"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("Sent")}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#4F46E5] hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Mark Sent</span>
          </button>
        </div>
      </div>

      {/* Quick Insert Agency Services Modal */}
      <QuickInsertAgencyTemplateModal
        isOpen={quickInsertModalOpen}
        onClose={() => setQuickInsertModalOpen(false)}
        company={company}
        selectedClient={selectedClient}
        onInsertServices={handleInsertAgencyServices}
        showToast={showToast}
      />
    </div>
  );
};
