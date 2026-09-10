import {
  CompanyProfile,
  Client,
  ProposalDocument,
  IndustryTemplate,
  User,
  ThemeSettings,
  Invoice,
  PaymentReceipt,
} from "../types";
import {
  initialCompanyProfile,
  initialClients,
  initialDocuments,
  initialIndustryTemplates,
  initialInvoices,
  initialPaymentReceipts,
} from "../data/initialData";

const KEYS = {
  COMPANY: "xyron_company_profile_v2",
  CLIENTS: "xyron_clients_v2",
  DOCUMENTS: "xyron_documents_v2",
  TEMPLATES: "xyron_templates_v2",
  USERS: "xyron_users_v2",
  SESSION: "xyron_current_session_v2",
  THEME: "xyron_theme_settings_v2",
  INVOICES: "xyron_invoices_v2",
  RECEIPTS: "xyron_receipts_v2",
};

// One-time cleanup of legacy keys to purge old invoices, receipts, and extra docs
try {
  const legacyKeys = [
    "xyron_documents_v1",
    "xyron_invoices_v1",
    "xyron_receipts_v1",
    "xyron_clients_v1",
    "xyron_company_profile_v1",
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
} catch (e) {
  // ignore storage errors
}

// Password Hashing Utility
export const hashPassword = (password: string): string => {
  let hash = 0;
  const salt = "XyronGroup_Secured_v2026_";
  const saltedStr = salt + password;
  for (let i = 0; i < saltedStr.length; i++) {
    const char = saltedStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "xy_" + Math.abs(hash).toString(16) + "_" + btoa(password).replace(/=/g, "").slice(0, 8);
};

// Default Enterprise Accounts
export const defaultUsers: User[] = [
  {
    id: "usr_master_admin_01",
    username: "admin",
    name: "Master Administrator",
    email: "admin@xyrongroup.com",
    role: "Master Admin",
    passwordHash: hashPassword("admin123"),
    createdAt: "2026-01-01",
    active: true,
  },
  {
    id: "usr_fahmed_01",
    username: "fahmed",
    name: "Syed Fahmed",
    email: "sfahmed3473@gmail.com",
    role: "Master Admin",
    passwordHash: hashPassword("Xyron@2026!"),
    createdAt: "2026-09-09",
    active: true,
  },
  {
    id: "usr_manager_01",
    username: "manager",
    name: "Sales Operations Manager",
    email: "manager@xyrongroup.com",
    role: "Manager",
    passwordHash: hashPassword("manager123"),
    createdAt: "2026-09-09",
    active: true,
  },
];

export const loadUsers = (): User[] => {
  try {
    const data = localStorage.getItem(KEYS.USERS);
    if (data) {
      const parsed: User[] = JSON.parse(data);
      if (parsed.length > 0) {
        // Repair any users with missing or empty passwordHash
        const repaired = parsed.map((u) => {
          if (!u.passwordHash) {
            if (u.username.toLowerCase() === "admin") {
              return { ...u, passwordHash: hashPassword("admin123") };
            }
            if (u.username.toLowerCase() === "fahmed") {
              return { ...u, passwordHash: hashPassword("Xyron@2026!") };
            }
            if (u.username.toLowerCase() === "manager") {
              return { ...u, passwordHash: hashPassword("manager123") };
            }
            return { ...u, passwordHash: hashPassword("admin123") };
          }
          return u;
        });

        // Ensure fahmed & admin exist in list
        const usernames = new Set(repaired.map((u) => u.username.toLowerCase()));
        for (const def of defaultUsers) {
          if (!usernames.has(def.username.toLowerCase())) {
            repaired.push(def);
          }
        }
        return repaired;
      }
    }
  } catch (e) {
    console.warn("Failed to load users from localStorage", e);
  }
  // Guarantee Default Accounts exist
  return defaultUsers;
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users", e);
  }
};

export const loadCurrentSessionUser = (): User | null => {
  try {
    const data = sessionStorage.getItem(KEYS.SESSION) || localStorage.getItem(KEYS.SESSION);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Failed to load current session user", e);
  }
  return null;
};

export const saveCurrentSessionUser = (user: User | null, rememberMe: boolean = true): void => {
  try {
    if (user) {
      const str = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem(KEYS.SESSION, str);
      } else {
        sessionStorage.setItem(KEYS.SESSION, str);
      }
    } else {
      localStorage.removeItem(KEYS.SESSION);
      sessionStorage.removeItem(KEYS.SESSION);
    }
  } catch (e) {
    console.error("Failed to save current session", e);
  }
};

export const loadCompanyProfile = (): CompanyProfile => {
  try {
    const data = localStorage.getItem(KEYS.COMPANY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure key branding fields from initialCompanyProfile are filled
      return {
        ...initialCompanyProfile,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn("Failed to load company profile from localStorage", e);
  }
  return initialCompanyProfile;
};

export const saveCompanyProfile = (profile: CompanyProfile): void => {
  try {
    localStorage.setItem(KEYS.COMPANY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save company profile", e);
  }
};

export const loadClients = (): Client[] => {
  try {
    const data = localStorage.getItem(KEYS.CLIENTS);
    if (data) {
      const parsed: Client[] = JSON.parse(data);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        // Filter out old demo clients
        const cleanClients = parsed.filter(
          (c) => !["cli_1", "cli_2", "cli_3", "cli_4"].includes(c.id)
        );

        // Ensure Cineplay Lounge client is present
        const cineplayClient = initialClients.find((c) => c.id === "cli_cineplay");
        if (cineplayClient && !cleanClients.some((c) => c.id === "cli_cineplay" || c.company?.includes("Cineplay"))) {
          cleanClients.unshift(cineplayClient);
        }

        // Ensure Vista Maritime client is included and updated
        const vistaIndex = cleanClients.findIndex((c) => c.id === "cli_vista" || c.company?.includes("Vista Maritime"));
        const vistaClient = initialClients.find((c) => c.id === "cli_vista");
        if (vistaIndex === -1 && vistaClient) {
          cleanClients.push(vistaClient);
        } else if (vistaIndex !== -1 && vistaClient) {
          cleanClients[vistaIndex] = {
            ...cleanClients[vistaIndex],
            address: vistaClient.address,
            taxId: "",
          };
        }
        return cleanClients.length > 0 ? cleanClients : initialClients;
      }
    }
  } catch (e) {
    console.warn("Failed to load clients from localStorage", e);
  }
  return initialClients;
};

export const saveClients = (clients: Client[]): void => {
  try {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error("Failed to save clients", e);
  }
};

export const loadDocuments = (): ProposalDocument[] => {
  try {
    const data = localStorage.getItem(KEYS.DOCUMENTS);
    if (data) {
      const parsed: ProposalDocument[] = JSON.parse(data);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        // Filter out old demo documents and purge any rejected proposals as requested
        const cleanDocs = parsed.filter(
          (d) => !["doc_1", "doc_2", "doc_3", "doc_4"].includes(d.id) && d.status !== "Rejected"
        );

        // Ensure Cineplay Lounge proposal is present
        const cineplayDoc = initialDocuments.find((d) => d.id === "doc_cineplay_001");
        if (cineplayDoc && !cleanDocs.some((d) => d.id === "doc_cineplay_001" || d.docNumber === "QUOT-2026-001")) {
          cleanDocs.unshift(cineplayDoc);
        }

        return cleanDocs.length > 0 ? cleanDocs : initialDocuments;
      }
    }
  } catch (e) {
    console.warn("Failed to load documents from localStorage", e);
  }
  return initialDocuments;
};

export const saveDocuments = (documents: ProposalDocument[]): void => {
  try {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
  } catch (e) {
    console.error("Failed to save documents", e);
  }
};

export const loadIndustryTemplates = (): IndustryTemplate[] => {
  try {
    const data = localStorage.getItem(KEYS.TEMPLATES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Failed to load industry templates from localStorage", e);
  }
  return initialIndustryTemplates;
};

export const saveIndustryTemplates = (templates: IndustryTemplate[]): void => {
  try {
    localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    console.error("Failed to save industry templates", e);
  }
};

export const defaultThemeSettings: ThemeSettings = {
  mode: "light",
  primaryColor: "#2563EB", // Electric Royal Blue
  fontFamily: "Plus Jakarta Sans",
};

export const loadThemeSettings = (): ThemeSettings => {
  try {
    const data = localStorage.getItem(KEYS.THEME);
    if (data) return { ...defaultThemeSettings, ...JSON.parse(data) };
  } catch (e) {
    console.warn("Failed to load theme settings", e);
  }
  return defaultThemeSettings;
};

export const saveThemeSettings = (theme: ThemeSettings): void => {
  try {
    localStorage.setItem(KEYS.THEME, JSON.stringify(theme));
  } catch (e) {
    console.error("Failed to save theme settings", e);
  }
};

export const formatCurrency = (amount: number, currencySymbol: string = "$"): string => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  const sym = currencySymbol || "$";
  if (sym.length > 1 || sym === "Rs." || sym === "PKR" || sym === "AED") {
    return `${sym} ${formattedNumber}`;
  }

  return `${sym}${formattedNumber}`;
};

export const generateDocNumber = (
  type: "Proposal" | "Quotation" = "Proposal",
  existingDocs: ProposalDocument[] = []
): string => {
  const prefix = type === "Quotation" ? "QUOT" : "PROP";
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);

  let maxSeq = 0;
  existingDocs.forEach((d) => {
    if (typeof d.docNumber === "string") {
      const match = d.docNumber.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}-${year}-${String(nextSeq).padStart(3, "0")}`;

  while (existingDocs.some((d) => d.docNumber === candidate)) {
    nextSeq += 1;
    candidate = `${prefix}-${year}-${String(nextSeq).padStart(3, "0")}`;
  }

  return candidate;
};

export const loadInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(KEYS.INVOICES);
    if (data !== null) {
      const parsed: Invoice[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((inv) => !["inv_1", "inv_2", "inv_3"].includes(inv.id));
      }
    }
  } catch (e) {
    console.warn("Failed to load invoices from localStorage", e);
  }
  return initialInvoices;
};

export const saveInvoices = (invoices: Invoice[]): void => {
  try {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error("Failed to save invoices", e);
  }
};

export const generateInvoiceNumber = (existingInvoices: Invoice[] = []): string => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const pattern = new RegExp(`^INV-${year}-(\\d+)$`);

  let maxSeq = 0;
  existingInvoices.forEach((inv) => {
    if (typeof inv.invoiceNumber === "string") {
      const match = inv.invoiceNumber.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(3, "0")}`;

  while (existingInvoices.some((inv) => inv.invoiceNumber === candidate)) {
    nextSeq += 1;
    candidate = `${prefix}${String(nextSeq).padStart(3, "0")}`;
  }

  return candidate;
};

export const loadReceipts = (): PaymentReceipt[] => {
  try {
    const data = localStorage.getItem(KEYS.RECEIPTS);
    if (data !== null) {
      const parsed: PaymentReceipt[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((rec) => !["rec_1"].includes(rec.id));
      }
    }
  } catch (e) {
    console.warn("Failed to load receipts from localStorage", e);
  }
  return initialPaymentReceipts;
};

export const saveReceipts = (receipts: PaymentReceipt[]): void => {
  try {
    localStorage.setItem(KEYS.RECEIPTS, JSON.stringify(receipts));
  } catch (e) {
    console.error("Failed to save receipts", e);
  }
};

export const generateReceiptNumber = (existingReceipts: PaymentReceipt[] = []): string => {
  const year = new Date().getFullYear();
  const prefix = `REC-${year}-`;
  const pattern = new RegExp(`^REC-${year}-(\\d+)$`);

  let maxSeq = 0;
  existingReceipts.forEach((rec) => {
    if (typeof rec.receiptNumber === "string") {
      const match = rec.receiptNumber.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(3, "0")}`;

  while (existingReceipts.some((rec) => rec.receiptNumber === candidate)) {
    nextSeq += 1;
    candidate = `${prefix}${String(nextSeq).padStart(3, "0")}`;
  }

  return candidate;
};
