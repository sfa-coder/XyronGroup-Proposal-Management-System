import React, { useState } from "react";
import { CompanyProfile, ThemeSettings, User, Client, ProposalDocument, Invoice, PaymentReceipt } from "../types";
import { validateUploadedFile, sanitizeText, sanitizeEmail, sanitizeUrl } from "../utils/sanitize";
import {
  Building2,
  Save,
  Upload,
  CreditCard,
  DollarSign,
  Percent,
  Check,
  Palette,
  Sun,
  Moon,
  Type,
  User as UserIcon,
  ShieldCheck,
  Sliders,
  Sparkles,
  Globe,
  PenTool,
  Database,
  Download,
  Terminal,
  HardDrive,
  FileJson,
  Copy,
  CheckCircle2,
  Rocket,
  Monitor,
  Laptop,
  ExternalLink,
  Cloud,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  X,
} from "lucide-react";
import { pushAllLocalDataToFirebase } from "../utils/firebaseSync";
import { firebaseInfo } from "../lib/firebase";

interface CompanyProfileSettingsProps {
  company: CompanyProfile;
  onSave: (updated: CompanyProfile) => void;
  themeSettings: ThemeSettings;
  onSaveTheme: (updatedTheme: ThemeSettings) => void;
  currentUser: User | null;
  onOpenEditProfile: () => void;
  clients?: Client[];
  documents?: ProposalDocument[];
  invoices?: Invoice[];
  receipts?: PaymentReceipt[];
  users?: User[];
  onImportData?: (data: {
    company?: CompanyProfile;
    clients?: Client[];
    documents?: ProposalDocument[];
    invoices?: Invoice[];
    receipts?: PaymentReceipt[];
  }) => void;
  onDeleteAllData?: () => Promise<void> | void;
  showToast: (title: string, message?: string, type?: "success" | "info" | "warning" | "error") => void;
}

export const CompanyProfileSettings: React.FC<CompanyProfileSettingsProps> = ({
  company,
  onSave,
  themeSettings,
  onSaveTheme,
  currentUser,
  onOpenEditProfile,
  clients = [],
  documents = [],
  invoices = [],
  receipts = [],
  users = [],
  onImportData = () => {},
  onDeleteAllData,
  showToast,
}) => {
  const isMasterAdmin = currentUser?.role === "Master Admin";

  const [activeSubTab, setActiveSubTab] = useState<"company" | "theme" | "profile" | "database">("company");
  const [formData, setFormData] = useState<CompanyProfile>(company);
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(themeSettings);
  const [copiedTerminalCommand, setCopiedTerminalCommand] = useState(false);
  const [syncingFirebase, setSyncingFirebase] = useState(false);
  const [copiedCloudUrl, setCopiedCloudUrl] = useState(false);

  // Delete All Data Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Master Admin Authorization Gate
  if (!isMasterAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Master Admin Privileges Required
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
          Access to Enterprise Settings, Themes, Database Management, and Data Controls is strictly reserved for Master Administrators. You do not have permission to view or modify these system configurations.
        </p>
      </div>
    );
  }

  const handleConfirmDeleteAll = async () => {
    if (deleteConfirmationText.trim() !== "DELETE") {
      showToast("Verification Required", 'Please type "DELETE" in capital letters to confirm.', "warning");
      return;
    }
    setIsDeleting(true);
    try {
      if (onDeleteAllData) {
        await onDeleteAllData();
      }
      setShowDeleteModal(false);
      setDeleteConfirmationText("");
    } catch (e: any) {
      showToast("Delete Error", e?.message || "Failed to delete all data", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Active running development cloud URL
  const activeDevUrl = "https://ais-dev-u7h7tymh5o3vr4pb4rbnhp-135786567979.asia-east1.run.app";
  const workableCloudUrl = typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost")
    ? window.location.origin
    : activeDevUrl;

  const handlePushToFirebase = async () => {
    setSyncingFirebase(true);
    try {
      const res = await pushAllLocalDataToFirebase({
        company,
        clients,
        documents,
        invoices,
        receipts,
        users,
      });
      if (res.success) {
        showToast("Firebase Cloud Synced!", `Successfully synced ${res.count} records (including users) to Google Firebase Firestore.`, "success");
      } else {
        showToast("Sync Notice", res.error || "Unable to sync at the moment.", "warning");
      }
    } catch (e: any) {
      showToast("Sync Error", e?.message || "Failed to push to Firebase", "error");
    } finally {
      setSyncingFirebase(false);
    }
  };

  const updateThemeLive = (updatedTheme: ThemeSettings) => {
    setCurrentTheme(updatedTheme);
    onSaveTheme(updatedTheme);
  };

  const handleSubmitCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedData: CompanyProfile = {
      ...formData,
      name: sanitizeText(formData.name, 100),
      tagline: formData.tagline ? sanitizeText(formData.tagline, 150) : undefined,
      email: sanitizeEmail(formData.email) || formData.email,
      phone: sanitizeText(formData.phone, 50),
      website: sanitizeUrl(formData.website) || formData.website,
      address: sanitizeText(formData.address, 200),
      taxId: sanitizeText(formData.taxId, 60),
      paymentTerms: sanitizeText(formData.paymentTerms, 3000),
      bankDetails: sanitizeText(formData.bankDetails, 1500),
      currency: sanitizeText(formData.currency, 10) || "$",
      defaultTaxRate: Number(formData.defaultTaxRate) || 0,
      signatoryName: formData.signatoryName ? sanitizeText(formData.signatoryName, 100) : undefined,
      signatoryTitle: formData.signatoryTitle ? sanitizeText(formData.signatoryTitle, 100) : undefined,
      signatorySubtitle: formData.signatorySubtitle ? sanitizeText(formData.signatorySubtitle, 100) : undefined,
      signatureImageUrl: formData.signatureImageUrl,
    };
    onSave(sanitizedData);
    showToast("Branding Saved", "Company profile & letterhead defaults updated securely.", "success");
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateUploadedFile(file, ["image/jpeg", "image/png", "image/webp", "image/svg+xml"], 2 * 1024 * 1024);
      if (!validation.valid) {
        showToast("Invalid Signature File", validation.error || "Please select a valid image under 2MB.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, signatureImageUrl: reader.result as string });
        showToast("Signature Uploaded", "Authorized signature image updated.", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTheme = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTheme(currentTheme);
    if (formData.name !== company.name || JSON.stringify(formData) !== JSON.stringify(company)) {
      onSave(formData);
    }
    showToast("Theme & Brand Updated", "Company identity, colors, and typography preferences applied.", "success");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateUploadedFile(file, ["image/jpeg", "image/png", "image/webp"], 2 * 1024 * 1024);
      if (!validation.valid) {
        showToast("Invalid Logo File", validation.error || "Please select a valid PNG, JPG, or WEBP image under 2MB.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
        showToast("Logo Uploaded", "Company logo preview updated.", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  const currencyOptions = [
    { symbol: "PKR", code: "PKR - Pakistani Rupee (PKR)" },
    { symbol: "$", code: "USD - US Dollar ($)" },
    { symbol: "€", code: "EUR - Euro (€)" },
    { symbol: "£", code: "GBP - British Pound (£)" },
    { symbol: "₹", code: "INR - Indian Rupee (₹)" },
    { symbol: "AED", code: "AED - UAE Dirham (AED)" },
    { symbol: "SAR", code: "SAR - Saudi Riyal (SAR)" },
    { symbol: "CAD$", code: "CAD - Canadian Dollar (CAD$)" },
    { symbol: "A$", code: "AUD - Australian Dollar (A$)" },
    { symbol: "S$", code: "SGD - Singapore Dollar (S$)" },
    { symbol: "¥", code: "JPY - Japanese Yen (¥)" },
  ];

  const colorPresets = [
    { name: "Primary Blue", hex: "#2F80ED", bgClass: "bg-[#2F80ED]" },
    { name: "Accent Teal", hex: "#42B0D5", bgClass: "bg-[#42B0D5]" },
    { name: "Deep Indigo", hex: "#4F46E5", bgClass: "bg-indigo-600" },
    { name: "Emerald Mint", hex: "#059669", bgClass: "bg-emerald-600" },
    { name: "Crimson Rose", hex: "#E11D48", bgClass: "bg-rose-600" },
    { name: "Dark Slate Gray", hex: "#333333", bgClass: "bg-[#333333]" },
  ];

  const fontOptions = [
    { name: "Plus Jakarta Sans", description: "Modern, crisp & balanced UI typography" },
    { name: "Inter", description: "Clean, neutral system sans-serif" },
    { name: "Outfit", description: "Geometric, high-impact display headers" },
    { name: "Poppins", description: "Friendly, rounded geometric proportions" },
    { name: "Playfair Display", description: "High-contrast serif for luxury proposals" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Settings Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Customization
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage company branding, currency defaults, theme colors, and user profile
            </p>
          </div>
        </div>

        {/* Sub-Nav Pills & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveSubTab("company")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === "company"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Company Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("theme")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === "theme"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>Theme & Colors</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("profile")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === "profile"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("database")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === "database"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Database & Cloud</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all cursor-pointer shadow-sm"
            title="Master Admin Danger Zone: Delete all data"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Delete All Data</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: COMPANY BRANDING & FINANCIAL DEFAULTS */}
      {activeSubTab === "company" && (
        <form onSubmit={handleSubmitCompany} className="space-y-6 animate-in fade-in duration-200">
          {/* Branding & Logo */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Brand Identity & Logo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Company Logo</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/80 transition-colors">
                  {formData.logoUrl ? (
                    <div className="space-y-3">
                      <img
                        src={formData.logoUrl}
                        alt="Company Logo Preview"
                        className="max-h-20 max-w-full object-contain mx-auto rounded-xl shadow-sm border dark:border-slate-700 bg-white p-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: "" })}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <span className="text-xs text-slate-400 block">PNG, JPG, SVG up to 2MB</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="mt-3 text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-600 dark:file:text-indigo-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. XyronGroup Tech Solutions"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tax ID / VAT / NTN Number
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="e.g. PK-982341092"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="e.g. https://xyrongroup.com"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Business Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, Suite, City, Country"
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial & Currency Defaults */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Financial Defaults & Currency
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                PKR Included
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Currency Symbol *
                </label>
                <div className="relative">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    {currencyOptions.map((opt) => (
                      <option key={opt.symbol} value={opt.symbol}>
                        {opt.code}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Applies to all new proposals, quotation calculations, and PDF headers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Tax / Sales Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-8 font-bold"
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Standard tax/sales rate automatically applied to items.</p>
              </div>
            </div>
          </div>

          {/* Payment Terms & Bank Details */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Payment Terms & Bank Details (PDF Footer)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Standard Payment Terms & Conditions
                </label>
                <textarea
                  rows={3}
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="e.g. 50% deposit upon proposal acceptance, 50% upon final delivery."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Account / Wire Payment Details
                </label>
                <textarea
                  rows={3}
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  placeholder="Bank Name | Account Title | IBAN / Account # | Branch Code"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Authorized Signatory & Service Provider Representative */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Authorized Signatory & Service Provider Representative
              </h2>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                PDF Sign-off Block
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the signature text, designation, and official company representation that appears in the Service Provider signature block across proposals, quotations, and invoices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Authorized Signatory / Signer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryName ?? "XyronGroup Authorized Signatory"}
                    onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                    placeholder="e.g. XyronGroup Authorized Signatory or Faraz Ahmed Sheikh"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Appears above the signature line (in script or typed style).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Representative Role / Title *
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryTitle ?? "Service Provider Representative"}
                    onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
                    placeholder="e.g. Service Provider Representative"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Appears directly below the signature line.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.signatorySubtitle ?? formData.name ?? "XyronGroup"}
                    onChange={(e) => setFormData({ ...formData, signatorySubtitle: e.target.value })}
                    placeholder="e.g. XyronGroup"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Bottom line in the signatory block.</p>
                </div>
              </div>

              {/* Optional Signature Image Preview / Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Signature Image (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/80 transition-colors">
                  {formData.signatureImageUrl ? (
                    <div className="space-y-2 w-full">
                      <img
                        src={formData.signatureImageUrl}
                        alt="Signature Preview"
                        className="max-h-16 max-w-full object-contain mx-auto rounded-lg bg-white p-1 border dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, signatureImageUrl: "" })}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer block mx-auto"
                      >
                        Remove Signature
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <PenTool className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-[11px] text-slate-400 block">PNG / JPG scan with transparent background</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="mt-2 text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-600 dark:file:text-indigo-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live Visual Preview of Signatory Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Live Signatory Preview (PDF & Document Footer)
              </span>
              <div className="max-w-xs p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="w-full border-b border-slate-300 dark:border-slate-700 min-h-8 flex items-end pb-1 mb-1.5">
                  {formData.signatureImageUrl ? (
                    <img src={formData.signatureImageUrl} alt="Signature" className="max-h-7 object-contain" />
                  ) : (
                    <span className="font-serif italic text-slate-800 dark:text-slate-200 text-xs">
                      {formData.signatoryName || "XyronGroup Authorized Signatory"}
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  {formData.signatoryTitle || "Service Provider Representative"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                  {formData.signatorySubtitle || formData.name || "XyronGroup"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Branding</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: THEME CUSTOMIZER (COLORS, DARK/LIGHT VIEW, FONTS) */}
      {activeSubTab === "theme" && (
        <form onSubmit={handleSubmitTheme} className="space-y-6 animate-in fade-in duration-200">
          {/* Company Name & Brand Identity (Accessible from Themes) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Company & Brand Identity
              </h2>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                Active: {formData.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Global Solutions"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Updates your application header, official proposals, quotations, invoices, and payment receipts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Brand Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Premium Digital Transformation & Cloud Engineering"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Displayed on proposal covers and branded export letterheads.
                </p>
              </div>
            </div>
          </div>

          {/* Dark / Light Theme Mode Selection */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Display Theme Mode (Dark / Light View)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateThemeLive({ ...currentTheme, mode: "light" })}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                  currentTheme.mode === "light"
                    ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">Clean Light Theme</span>
                    {currentTheme.mode === "light" && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Soft floating white cards, high contrast typography inspired by DocApp dashboard layout.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateThemeLive({ ...currentTheme, mode: "dark" })}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                  currentTheme.mode === "dark"
                    ? "border-indigo-600 bg-indigo-950/40 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="p-3 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800 shrink-0">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">Obsidian Dark Theme</span>
                    {currentTheme.mode === "dark" && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Deep charcoal canvas with electric accent glow, eye-friendly for low light environments.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Accent Color Palette Selection */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Primary Accent Color Palette
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {colorPresets.map((preset) => {
                const isSelected = currentTheme.primaryColor === preset.hex;
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => updateThemeLive({ ...currentTheme, primaryColor: preset.hex })}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-slate-900 dark:border-white ring-2 ring-indigo-500/30 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${preset.bgClass} flex items-center justify-center shadow`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography / Font Selection */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Font Family Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fontOptions.map((font) => {
                const isSelected = currentTheme.fontFamily === font.name;
                return (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => updateThemeLive({ ...currentTheme, fontFamily: font.name })}
                    className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{font.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{font.description}</p>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2 italic">
                        "The quick brown fox jumps over the lazy dog"
                      </p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply Theme Preferences</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: MY PROFILE & SECURITY */}
      {activeSubTab === "profile" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{currentUser?.name}</h2>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentUser?.role} Account
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEditProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Edit My Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Username</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{currentUser?.username}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{currentUser?.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned System Role</span>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{currentUser?.role}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Account Created</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{currentUser?.createdAt || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DATABASE & CLOUD HOSTING */}
      {activeSubTab === "database" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* FIREBASE CLOUD HOSTING & CLOUD DATABASE CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-emerald-500/40 shadow-xl space-y-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0 shadow-lg">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-white">
                      Google Firebase Cloud Hosting &amp; Database
                    </h2>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live &amp; Synced
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your application is cloud-hosted and backed by Google Firebase Firestore. You can use it from any laptop, phone, or tablet anywhere in the world!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={syncingFirebase}
                  onClick={handlePushToFirebase}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingFirebase ? "animate-spin" : ""}`} />
                  <span>{syncingFirebase ? "Syncing..." : "Push All to Firebase"}</span>
                </button>

                <a
                  href={workableCloudUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-900/40 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Cloud App</span>
                </a>
              </div>
            </div>

            {/* Workable Link Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Your Active Workable Cloud URL
                </span>
                <span className="text-[10px] text-slate-400 font-medium">SSL Encrypted • 24/7 Always Online</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 p-2.5 rounded-xl bg-slate-900 text-xs font-mono text-indigo-300 border border-slate-800 break-all select-all">
                  {workableCloudUrl}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(workableCloudUrl);
                    setCopiedCloudUrl(true);
                    showToast("Link Copied!", "Workable URL copied to clipboard. Open in a new tab or bookmark.", "success");
                    setTimeout(() => setCopiedCloudUrl(false), 3000);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  {copiedCloudUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  <span>{copiedCloudUrl ? "Copied!" : "Copy URL"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                💡 <span className="font-semibold text-slate-300">Tip:</span> To share a public link with colleagues or clients without needing to log in, click the <span className="font-bold text-emerald-400">Share</span> button at the top right of Google AI Studio.
              </p>
            </div>

            {/* Cloud Architecture Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Firebase Project ID
                </span>
                <p className="font-mono text-xs font-bold text-white truncate">{firebaseInfo.projectId}</p>
                <span className="text-[10px] text-emerald-400 block">Provisioned &amp; Deployed</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Firestore Database
                </span>
                <p className="font-mono text-xs font-bold text-white truncate">{firebaseInfo.databaseId}</p>
                <span className="text-[10px] text-emerald-400 block">Multi-Device Realtime Sync</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Offline &amp; Cloud Fallback
                </span>
                <p className="font-bold text-white">Hybrid Cloud + Local</p>
                <span className="text-[10px] text-slate-400 block">Works offline, syncs when online</span>
              </div>
            </div>
          </div>

          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Database & Localhost Environment
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Run this exact proposal app on your local machine (`localhost:3000`) and export/import all proposals.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Filter out any rejected proposals as requested
                    const cleanDocs = documents.filter((d) => d.status !== "Rejected");
                    const exportData = {
                      appName: "XyronGroup Proposal Platform",
                      version: "2.0.0",
                      exportedAt: new Date().toISOString(),
                      summary: {
                        proposalsCount: cleanDocs.length,
                        clientsCount: clients.length,
                        invoicesCount: invoices.length,
                        receiptsCount: receipts.length,
                      },
                      company,
                      clients,
                      documents: cleanDocs,
                      invoices,
                      receipts,
                    };
                    const jsonString = JSON.stringify(exportData, null, 2);
                    const blob = new Blob([jsonString], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `xyron_proposals_backup_${new Date().toISOString().split("T")[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("Database Exported", `Downloaded complete JSON database (${cleanDocs.length} proposals, ${clients.length} clients, ${invoices.length} invoices, ${receipts.length} receipts).`, "success");
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Live Backup (JSON)</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proposals & Quotes</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{documents.length} Records</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CRM Clients</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{clients.length} Clients</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoices & Receipts</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{invoices.length + receipts.length} Entries</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand Profile</span>
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{company.name}</p>
              </div>
            </div>
          </div>

          {/* 1-Click Zero-Hassle Launcher Block */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-indigo-950/40 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-xl space-y-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    One-Click App Launchers
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                      No CMD Typing Needed
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-0.5">
                    Avoid running terminal commands every day — choose between Direct Desktop App (PWA) or 1-Click Localhost script.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option 1: Direct Web / Chrome App */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Method 1 • Zero Terminal / Zero Node
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    Direct Desktop App (PWA)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Install this app straight from Google Chrome or Microsoft Edge. It adds a native icon to your <strong>Windows Desktop and Taskbar</strong>. Double-click that icon daily to open instantly in its own clean window!
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                    <li>Click the <strong>Install</strong> icon in the browser address bar</li>
                    <li>Or click <strong>Menu (3 dots) &gt; Save and share &gt; Install app</strong></li>
                    <li>Zero terminal, zero command prompt, always ready</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    Works on Windows, Mac &amp; Mobile
                  </span>
                </div>
              </div>

              {/* Option 2: 1-Click Localhost Script */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Method 2 • For Localhost (Offline)
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    One-Click <code className="text-emerald-400">Start-App.bat</code>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If you run locally, download this script. Double-clicking it automatically runs the server and launches your browser to <code className="text-indigo-300">http://localhost:3000</code> in 1 second!
                  </p>
                  <p className="text-[11px] text-amber-200/90 bg-amber-950/40 p-2 rounded-xl border border-amber-500/20">
                    💡 Right-click <code className="font-bold">Start-App.bat</code> &gt; <strong>Send to &gt; Desktop (create shortcut)</strong> to launch from your desktop anytime.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const batContent = `@echo off
title XyronGroup - Proposal & Quotation Manager
color 0B

echo =====================================================================
echo           XyronGroup - Proposal & Quotation Manager
echo                     One-Click Launcher
echo =====================================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b
)

if not exist "node_modules\\" (
    echo [INFO] First-time setup detected: Installing required packages...
    echo This only happens once. Please wait...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b
    )
    echo [SUCCESS] Dependencies installed successfully!
    echo.
)

echo [INFO] Launching your browser to http://localhost:3000 ...
start "" http://localhost:3000

echo [INFO] Starting application server...
npm run dev

pause
`;
                      const blob = new Blob([batContent], { type: "application/x-bat" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Start-App.bat";
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast("Start-App.bat Downloaded", "Place in your project folder and double-click anytime!", "success");
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Start-App.bat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const cmdContent = `#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install from https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing dependencies..."
    npm install
fi

echo "[INFO] Opening http://localhost:3000 in your browser..."
sleep 2 && open "http://localhost:3000" &

npm run dev
`;
                      const blob = new Blob([cmdContent], { type: "application/x-sh" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Start-App.command";
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast("Start-App.command Downloaded", "Saved for macOS launcher.", "success");
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer transition-all"
                  >
                    <Download className="w-3 h-3" />
                    <span>Mac (.command)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Localhost Setup Steps */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                How to Run this Application on Localhost
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export Codebase from AI Studio
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click the <strong>Settings</strong> or <strong>Share/Export</strong> menu in the upper-right corner of Google AI Studio, and select <strong>"Export to GitHub"</strong> or <strong>"Download ZIP"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Extract & Open Project Directory
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Extract the downloaded ZIP on your computer, open your terminal (Terminal, Command Prompt, or VS Code terminal), and navigate to the project directory:
                  </p>
                  <div className="mt-2 p-3 bg-slate-900 text-indigo-200 font-mono text-xs rounded-xl flex items-center justify-between border border-slate-800">
                    <code>cd /path/to/extracted-app</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("npm install && npm run dev");
                        setCopiedTerminalCommand(true);
                        setTimeout(() => setCopiedTerminalCommand(false), 2000);
                        showToast("Copied", "Command copied to clipboard.", "info");
                      }}
                      className="px-2 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    >
                      {copiedTerminalCommand ? "Copied!" : "Copy Commands"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Install Packages & Run Dev Server
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Run the following command to install dependencies and start the local development server:
                  </p>
                  <div className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800">
                    <p className="text-slate-400"># Install dependencies</p>
                    <p>npm install</p>
                    <p className="text-slate-400 mt-2"># Start Vite dev server on localhost</p>
                    <p>npm run dev</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Open in Your Browser
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Visit <strong className="text-indigo-600 dark:text-indigo-400">http://localhost:3000</strong> in Google Chrome or any browser. Your finalized Vista Maritime proposal, clients, templates, and company profile are bundled in the repository and will load immediately!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Database Export & Import Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Download className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Export & Download Database</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download your live proposals and CRM data in your preferred format:
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    const cleanDocs = documents.filter((d) => d.status !== "Rejected");
                    const exportData = {
                      appName: "XyronGroup Proposal Platform",
                      version: "2.0.0",
                      exportedAt: new Date().toISOString(),
                      company,
                      clients,
                      documents: cleanDocs,
                      invoices,
                      receipts,
                    };
                    const jsonString = JSON.stringify(exportData, null, 2);
                    const blob = new Blob([jsonString], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `xyron_database_backup_${new Date().toISOString().split("T")[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("Database Exported", `JSON database backup downloaded (${cleanDocs.length} proposals).`, "success");
                  }}
                  className="w-full p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 text-left flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileJson className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Full JSON Database Dump</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Complete backup of all proposals, clients & invoices</span>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </button>

                <a
                  href="/seed-database.sql"
                  download="seed-database.sql"
                  onClick={() => showToast("SQL Downloaded", "SQL seed script downloaded.", "info")}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left flex items-center justify-between cursor-pointer transition-all block"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">SQL Schema & Seed Script (.sql)</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Compatible with PostgreSQL and MySQL relational databases</span>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500" />
                </a>

                <a
                  href="/database-export.json"
                  download="database-export.json"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 mt-1 pl-1"
                >
                  <span>View raw static database-export.json</span>
                </a>
              </div>
            </div>

            {/* Import / Restore Tool */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Import / Sync JSON Backup</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Load a JSON backup file to sync proposals into your current workspace or local machine:
              </p>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-colors">
                <FileJson className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select JSON Backup File</span>
                  </span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          try {
                            const parsed = JSON.parse(reader.result as string);
                            if (parsed.company || parsed.clients || parsed.documents || parsed.invoices || parsed.receipts) {
                              onImportData(parsed);
                              showToast("Database Restored", "All records successfully loaded into active workspace.", "success");
                            } else {
                              showToast("Invalid JSON", "Selected file does not match the database backup schema.", "warning");
                            }
                          } catch (err) {
                            showToast("Import Failed", "Failed to parse JSON file.", "error");
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-2">
                  Supports .json files exported from PropelQuote / Xyron platform.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300">
                <strong>Data Safety:</strong> Your proposals are safely preserved in <code className="font-mono font-bold">src/data/initialData.ts</code>, so when you clone or run this on localhost, everything appears automatically.
              </div>
            </div>

            {/* DANGER ZONE: PURGE ALL OPERATIONAL DATA */}
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-900/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-rose-900 dark:text-rose-200">
                    Danger Zone: Purge &amp; Delete All Data
                  </h3>
                  <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-0.5">
                    Master Admin emergency control to wipe all documents, invoices, receipts, and clients
                  </p>
                </div>
              </div>

              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                Clicking this button will permanently delete all proposals, quotations, invoices, receipts, and clients from your browser storage and Google Firebase Firestore. Your administrator accounts and authentication credentials will remain intact so you can immediately begin fresh.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmationText("");
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All Data (Master Admin)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE ALL DATA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border-2 border-rose-500/40 p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <button
              type="button"
              onClick={() => {
                if (!isDeleting) {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                }
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Permanent Data Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This action is irreversible. All records will be removed from local storage and Firebase Firestore.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2 text-xs text-rose-900 dark:text-rose-300">
              <p className="font-bold">What will be deleted:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>All Proposal and Quotation documents ({documents.length} items)</li>
                <li>All Invoices and generated PDFs ({invoices.length} items)</li>
                <li>All Payment Receipts ({receipts.length} items)</li>
                <li>All Clients in CRM ({clients.length} items)</li>
              </ul>
              <p className="text-[11px] pt-1 text-slate-600 dark:text-slate-400">
                Note: Your user accounts and login access will be preserved so you do not get locked out.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Type <span className="font-mono font-black text-rose-600 dark:text-rose-400">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE in capital letters"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm font-bold focus:outline-none focus:border-rose-500"
                disabled={isDeleting}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                disabled={deleteConfirmationText.trim() !== "DELETE" || isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 dark:disabled:bg-rose-950 disabled:text-rose-200 text-white font-extrabold text-xs shadow-lg shadow-rose-900/30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting Everything..." : "Permanently Delete Everything"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
