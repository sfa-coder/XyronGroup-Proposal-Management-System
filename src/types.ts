export type DocumentType = "Proposal" | "Quotation";

export type DocumentStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Completed";

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Partially Paid" | "Overdue";

export type PaymentMethod =
  | "Bank Transfer"
  | "Wire Transfer"
  | "Credit Card"
  | "Stripe"
  | "PayPal"
  | "Cash"
  | "Cheque"
  | "Online Gateway";

export type PaymentReceiptStatus = "Settled" | "Pending" | "Refunded";

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  proposalId: string; // Linked ProposalDocument id
  proposalDocNumber: string;
  proposalTitle: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress?: string;
  clientTaxId?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  percentage: number; // percentage of proposal (e.g. 50%) or 100
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number; // Total amount to pay on this invoice
  amountPaid: number; // Collected amount
  balanceDue: number; // Remaining
  milestoneTitle?: string;
  notes?: string;
  paymentTerms?: string;
  bankDetails?: string;
  lineItems?: LineItem[];
  createdAt: string;
  updatedAt: string;
  isCompleted?: boolean;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string; // e.g. REC-2026-001
  invoiceId?: string;
  invoiceNumber?: string;
  proposalId: string;
  proposalDocNumber: string;
  proposalTitle: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress?: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string; // e.g. TRX-982348129 or Cheque #
  amountPaid: number;
  currency: string;
  notes?: string;
  receivedBy: string;
  status: PaymentReceiptStatus;
  createdAt: string;
  isCompleted?: boolean;
}

export type UserRole = "Master Admin" | "Manager" | "Standard User";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string; // Salted SHA-256 hash string
  createdAt: string;
  lastLogin?: string;
  active: boolean; // true = Active, false = Suspended
  isFirstLogin?: boolean;
  avatarColor?: string;
}

export interface ThemeSettings {
  mode: "light" | "dark";
  primaryColor: string; // e.g. '#2563EB', '#4F46E5', '#059669', '#E11D48', '#0F172A'
  fontFamily: string; // 'Plus Jakarta Sans', 'Inter', 'Outfit', 'Poppins', 'Playfair Display'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface CompanyProfile {
  name: string;
  tagline?: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  paymentTerms: string;
  bankDetails: string;
  currency: string;
  defaultTaxRate: number;
  signatoryName?: string; // e.g. "XyronGroup Authorized Signatory" or "Faraz Ahmed Sheikh"
  signatoryTitle?: string; // e.g. "Service Provider Representative" or "Managing Director"
  signatorySubtitle?: string; // e.g. "XyronGroup"
  signatureImageUrl?: string; // Optional official signature image / e-signature
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes?: string;
  createdAt: string;
}

export type PricingModel = "one-time" | "monthly-retainer" | "setup-and-retainer" | "custom";

export interface RetainerServiceItem {
  id: string;
  serviceName: string;
  initialSetup: string; // e.g. "Included", "Optional (+PKR 25,000)", "N/A"
  monthlyRetainer: string; // e.g. "Included", "Optional (+PKR 35,000/mo)", "N/A"
  notes?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage 0-100
  taxRate: number; // percentage 0-100
  notes?: string;
}

export interface Milestone {
  id: string;
  name: string;
  timeline: string;
  description: string;
}

export interface PaymentMilestone {
  id: string;
  description: string;
  percentage: number;
  amount: number;
  dueCondition?: string;
}

export interface ProposalDocument {
  id: string;
  docNumber: string; // e.g. PROP-2026-001 or QUOT-2026-001
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress: string;
  clientTaxId?: string;
  issueDate: string;
  expiryDate: string;
  preparedBy?: string;
  senderEmail?: string;
  senderName?: string;
  version?: string;
  overview: string;
  requirements?: string;
  proposedSolution?: string;
  scopeOfWork: string;
  deliverables: string[];
  features?: string[];
  milestones: Milestone[];
  responsibilities?: {
    client?: string;
    provider?: string;
  };
  assumptions?: string;
  
  // Pricing Model & Recurring Retainer Structure
  pricingModel?: PricingModel;
  setupFee?: number; // One-Time Setup / First Month Investment
  monthlyRetainerFee?: number; // Recurring Monthly Growth Retainer
  engagementMonths?: number; // Minimum Engagement Period (e.g. 6 months)
  paymentFrequency?: string; // e.g. "Monthly in Advance"
  firstMonthTotal?: number; // Month 1 payable amount
  recurringMonthlyAmount?: number; // Recurring monthly amount (Months 2–N)
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  taxEnabled?: boolean;
  taxRate?: number;
  retainerServices?: RetainerServiceItem[];
  minimumEngagementText?: string;
  customPricingNotes?: string;

  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  additionalCharges?: number;
  grandTotal: number;
  paymentSchedule?: PaymentMilestone[];
  termsAndConditions: string;
  companySnapshot: CompanyProfile;
  providerSignatoryName?: string;
  providerSignatoryTitle?: string;
  providerSignatorySubtitle?: string;
  providerSignatureUrl?: string;
  acceptanceDetails?: {
    accepted?: boolean;
    authorizedName?: string;
    authorizedCompany?: string;
    authorizedDate?: string;
    signatureDataUrl?: string; // Digital canvas e-signature drawing or typed font
    signatureType?: "drawn" | "typed" | "uploaded";
    signerEmail?: string;
    signerIp?: string;
    verificationHash?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
  isCompleted?: boolean;
  completedAt?: string;
  completedNotes?: string;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  category: "proposal_expiry" | "invoice_due" | "invoice_overdue" | "proposal_followup" | "custom";
  subject: string;
  whatsappMessage: string;
  emailMessage: string;
  daysOffset?: number; // e.g. -3 (3 days before), 0 (on due date), +7 (7 days overdue)
}

export interface IndustryTemplate {
  id: string;
  title: string;
  category: string;
  iconName: string;
  defaultOverview: string;
  defaultScope: string;
  defaultDeliverables: string[];
  defaultMilestones: { name: string; timeline: string; description: string }[];
  defaultLineItems: { description: string; quantity: number; unitPrice: number; taxRate: number }[];
}

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
}
