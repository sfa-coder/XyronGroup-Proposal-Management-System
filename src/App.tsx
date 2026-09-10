import React, { useState, useEffect } from "react";
import {
  CompanyProfile,
  Client,
  ProposalDocument,
  IndustryTemplate,
  User,
  ToastMessage,
  ThemeSettings,
  Invoice,
  PaymentReceipt,
  DocumentStatus,
} from "./types";
import {
  loadCompanyProfile,
  saveCompanyProfile,
  loadClients,
  saveClients,
  loadDocuments,
  saveDocuments,
  loadIndustryTemplates,
  saveIndustryTemplates,
  loadUsers,
  saveUsers,
  loadCurrentSessionUser,
  saveCurrentSessionUser,
  loadThemeSettings,
  saveThemeSettings,
  generateDocNumber,
  loadInvoices,
  saveInvoices,
  loadReceipts,
  saveReceipts,
} from "./utils/storage";

import { Navigation, NavTab } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { CompanyProfileSettings } from "./components/CompanyProfileSettings";
import { ClientCRM } from "./components/ClientCRM";
import { DocumentEditor } from "./components/DocumentEditor";
import { DocumentList } from "./components/DocumentList";
import { InvoicesAndReceiptsView } from "./components/InvoicesAndReceiptsView";
import { CompletedProjects } from "./components/CompletedProjects";
import { InvoiceModal } from "./components/InvoiceModal";
import { PaymentReceiptModal } from "./components/PaymentReceiptModal";
import { AIGeneratorModal } from "./components/AIGeneratorModal";
import { PDFPreviewModal } from "./components/PDFPreviewModal";
import { AutoSendModal } from "./components/AutoSendModal";
import { TemplateManagerModal } from "./components/TemplateManagerModal";
import { UserManagementModal } from "./components/UserManagementModal";
import { UserProfileModal } from "./components/UserProfileModal";
import { FirstLoginSetupModal } from "./components/FirstLoginSetupModal";
import { LoginModal } from "./components/LoginModal";
import { ESignatureModal } from "./components/ESignatureModal";
import { ReminderTemplatesModal } from "./components/ReminderTemplatesModal";
import { OneClickLauncherModal } from "./components/OneClickLauncherModal";
import { ToastContainer } from "./components/ToastContainer";
import {
  initializeCloudSync,
  COLLECTIONS,
} from "./utils/firebaseSync";
import {
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  onCloudStatusChange,
  purgeAllDataFromFirestore,
} from "./lib/firebase";
import { logAuditEvent } from "./utils/security";

export default function App() {
  // Theme & Appearance State
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(loadThemeSettings);

  // Sync Dark/Light Mode & Font Family & Primary Accent Color globally
  useEffect(() => {
    const root = document.documentElement;
    if (themeSettings.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (themeSettings.primaryColor) {
      root.style.setProperty("--primary-color", themeSettings.primaryColor);
    }

    if (themeSettings.fontFamily) {
      document.body.style.fontFamily = `'${themeSettings.fontFamily}', system-ui, -apple-system, sans-serif`;
    }
  }, [themeSettings]);

  // Authentication & Users State
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentSessionUser);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // Privilege Guard: Restrict Settings to Master Admin only
  useEffect(() => {
    if (activeTab === "settings" && currentUser && currentUser.role !== "Master Admin") {
      setActiveTab("dashboard");
      showToast("Access Restricted", "Only Master Administrators can view or modify system settings.", "warning");
    }
  }, [activeTab, currentUser]);

  // Core Data State
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile);
  const [clients, setClients] = useState<Client[]>(loadClients);
  const [documents, setDocuments] = useState<ProposalDocument[]>(loadDocuments);
  const [invoices, setInvoices] = useState<Invoice[]>(loadInvoices);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(loadReceipts);
  const [industryTemplates, setIndustryTemplates] = useState<IndustryTemplate[]>(loadIndustryTemplates);

  // Modal / Editor State
  const [activeEditingDoc, setActiveEditingDoc] = useState<ProposalDocument | null>(null);
  const [editorDocType, setEditorDocType] = useState<"Proposal" | "Quotation">("Proposal");
  const [editorClientId, setEditorClientId] = useState<string | undefined>(undefined);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [pdfPreviewDoc, setPdfPreviewDoc] = useState<ProposalDocument | null>(null);
  const [eSignatureDoc, setESignatureDoc] = useState<ProposalDocument | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderTargetDoc, setReminderTargetDoc] = useState<ProposalDocument | null>(null);
  const [reminderTargetInvoice, setReminderTargetInvoice] = useState<Invoice | null>(null);
  const [autoSendDoc, setAutoSendDoc] = useState<ProposalDocument | null>(null);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [crmAddClientOpen, setCrmAddClientOpen] = useState(false);
  const [launcherModalOpen, setLauncherModalOpen] = useState(false);

  // Invoice & Receipt Modal States
  const [invoiceModalDoc, setInvoiceModalDoc] = useState<ProposalDocument | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);

  const [receiptModalDoc, setReceiptModalDoc] = useState<ProposalDocument | null>(null);
  const [receiptModalInvoice, setReceiptModalInvoice] = useState<Invoice | undefined>(undefined);
  const [editingReceipt, setEditingReceipt] = useState<PaymentReceipt | undefined>(undefined);

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth Handlers
  const handleLoginSuccess = (user: User, rememberMe: boolean) => {
    setCurrentUser(user);
    saveCurrentSessionUser(user, rememberMe);
    // Update user list lastLogin
    const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    saveDocumentToFirestore(COLLECTIONS.USERS, user.id, user).catch(() => {});
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentSessionUser(null);
    setUserManagementOpen(false);
  };

  const handleSaveUsers = (updatedUsers: User[]) => {
    // Cascade delete any removed user from Firestore
    const currentIds = new Set(updatedUsers.map((u) => u.id));
    for (const oldUser of users) {
      if (!currentIds.has(oldUser.id)) {
        deleteDocumentFromFirestore(COLLECTIONS.USERS, oldUser.id).catch(() => {});
      }
    }
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    // Immediately persist each user to Firebase Firestore
    for (const u of updatedUsers) {
      saveDocumentToFirestore(COLLECTIONS.USERS, u.id, u).catch(() => {});
    }
    showToast("Users Synced to Firebase", `${updatedUsers.length} user accounts saved & pushed to Cloud.`, "success");
  };

  // Toast Helper
  const showToast = (
    title: string,
    message?: string,
    type: "success" | "info" | "warning" | "error" = "info"
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Realtime Cloud Synchronization with Google Firebase Firestore
  useEffect(() => {
    initializeCloudSync({
      onDocumentsLoaded: (cloudDocs) => setDocuments(cloudDocs),
      onClientsLoaded: (cloudClients) => setClients(cloudClients),
      onInvoicesLoaded: (cloudInvoices) => setInvoices(cloudInvoices),
      onReceiptsLoaded: (cloudReceipts) => setReceipts(cloudReceipts),
      onCompanyLoaded: (cloudCompany) => setCompany(cloudCompany),
      onUsersLoaded: (cloudUsers) => setUsers(cloudUsers),
    }).catch((err) => {
      console.warn("Cloud sync initialization warning:", err);
    });
  }, []);

  // Company Profile Handlers
  const handleSaveCompanyProfile = (updated: CompanyProfile) => {
    setCompany(updated);
    saveCompanyProfile(updated);
    saveDocumentToFirestore(COLLECTIONS.COMPANY, "main_profile", updated).catch(() => {});
  };

  // Theme Handlers
  const handleSaveThemeSettings = (newTheme: ThemeSettings) => {
    setThemeSettings(newTheme);
    saveThemeSettings(newTheme);
  };

  const handleToggleThemeMode = () => {
    const newMode: "light" | "dark" = themeSettings.mode === "light" ? "dark" : "light";
    const updated: ThemeSettings = { ...themeSettings, mode: newMode };
    setThemeSettings(updated);
    saveThemeSettings(updated);
  };

  // User Profile Update Handler
  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    saveCurrentSessionUser(updatedUser, true);
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    saveDocumentToFirestore(COLLECTIONS.USERS, updatedUser.id, updatedUser).catch(() => {});
  };

  // Client Handlers
  const handleSaveClient = (client: Client) => {
    const exists = clients.some((c) => c.id === client.id);
    let updatedClients: Client[];
    if (exists) {
      updatedClients = clients.map((c) => (c.id === client.id ? client : c));
    } else {
      updatedClients = [client, ...clients];
    }
    setClients(updatedClients);
    saveClients(updatedClients);
    saveDocumentToFirestore(COLLECTIONS.CLIENTS, client.id, client).catch(() => {});
  };

  const handleDeleteClient = (clientId: string) => {
    const updated = clients.filter((c) => c.id !== clientId);
    setClients(updated);
    saveClients(updated);
    deleteDocumentFromFirestore(COLLECTIONS.CLIENTS, clientId).catch(() => {});
  };

  // Document Handlers
  const handleSaveDoc = (doc: ProposalDocument) => {
    const exists = documents.some((d) => d.id === doc.id);
    let updatedDocs: ProposalDocument[];
    if (exists) {
      updatedDocs = documents.map((d) => (d.id === doc.id ? doc : d));
    } else {
      updatedDocs = [doc, ...documents];
    }
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
    saveDocumentToFirestore(COLLECTIONS.PROPOSALS, doc.id, doc).catch(() => {});
    setActiveTab("documents");
    setActiveEditingDoc(null);
  };

  const handleDeleteDoc = (docId: string) => {
    const updatedDocs = documents.filter((d) => d.id !== docId);
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
    deleteDocumentFromFirestore(COLLECTIONS.PROPOSALS, docId).catch(() => {});

    // Cascade delete any linked invoices and payment receipts
    const linkedInvoices = invoices.filter((i) => i.proposalId === docId);
    linkedInvoices.forEach((inv) => deleteDocumentFromFirestore(COLLECTIONS.INVOICES, inv.id).catch(() => {}));
    const updatedInvoices = invoices.filter((i) => i.proposalId !== docId);
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);

    const linkedReceipts = receipts.filter((r) => r.proposalId === docId);
    linkedReceipts.forEach((rec) => deleteDocumentFromFirestore(COLLECTIONS.RECEIPTS, rec.id).catch(() => {}));
    const updatedReceipts = receipts.filter((r) => r.proposalId !== docId);
    setReceipts(updatedReceipts);
    saveReceipts(updatedReceipts);

    showToast("Document & Linked Records Deleted", "Proposal and its billing entries removed.", "info");
  };

  const handleClearAllData = () => {
    setDocuments([]);
    saveDocuments([]);
    setInvoices([]);
    saveInvoices([]);
    setReceipts([]);
    saveReceipts([]);
    setClients([]);
    saveClients([]);
    showToast("Workspace Cleared", "All documents, clients, invoices, and receipts have been reset to empty.", "info");
  };

  const handleUpdateStatus = (
    docId: string,
    status: DocumentStatus
  ) => {
    if (status === "Completed") {
      handleMarkComplete(docId);
      return;
    }

    const updated = documents.map((d) =>
      d.id === docId ? { ...d, status, isCompleted: false, updatedAt: new Date().toISOString() } : d
    );
    setDocuments(updated);
    saveDocuments(updated);
    const target = updated.find((d) => d.id === docId);
    if (target) saveDocumentToFirestore(COLLECTIONS.PROPOSALS, docId, target).catch(() => {});
    showToast("Status Updated", `Document marked as ${status}.`, "success");
  };

  const handleMarkComplete = (docId: string, notes?: string) => {
    const target = documents.find((d) => d.id === docId);
    const updated = documents.map((d) =>
      d.id === docId
        ? {
            ...d,
            status: "Completed" as DocumentStatus,
            isCompleted: true,
            completedAt: new Date().toISOString(),
            completedNotes: notes || d.completedNotes,
            updatedAt: new Date().toISOString(),
          }
        : d
    );
    setDocuments(updated);
    saveDocuments(updated);
    const updatedTarget = updated.find((d) => d.id === docId);
    if (updatedTarget) saveDocumentToFirestore(COLLECTIONS.PROPOSALS, docId, updatedTarget).catch(() => {});
    showToast(
      "Project Completed",
      `"${target?.title || "Project"}" and its invoices/receipts moved to Completed Projects.`,
      "success"
    );
  };

  const handleRestoreProject = (docId: string) => {
    const target = documents.find((d) => d.id === docId);
    const updated = documents.map((d) =>
      d.id === docId
        ? {
            ...d,
            status: "Accepted" as DocumentStatus,
            isCompleted: false,
            updatedAt: new Date().toISOString(),
          }
        : d
    );
    setDocuments(updated);
    saveDocuments(updated);
    const updatedTarget = updated.find((d) => d.id === docId);
    if (updatedTarget) saveDocumentToFirestore(COLLECTIONS.PROPOSALS, docId, updatedTarget).catch(() => {});
    showToast(
      "Project Restored",
      `"${target?.title || "Project"}" restored to active Document Directory.`,
      "info"
    );
  };

  const handleDuplicateDoc = (doc: ProposalDocument) => {
    const newType = doc.type;
    const newDocNumber = generateDocNumber(newType, documents);
    const duplicated: ProposalDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      docNumber: newDocNumber,
      title: `${doc.title} (Copy)`,
      status: "Draft",
      isCompleted: false,
      issueDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [duplicated, ...documents];
    setDocuments(updated);
    saveDocuments(updated);
    saveDocumentToFirestore(COLLECTIONS.PROPOSALS, duplicated.id, duplicated).catch(() => {});
    showToast("Document Duplicated", `Created new draft ${duplicated.docNumber}`, "success");
    setActiveEditingDoc(duplicated);
    setActiveTab("editor");
  };

  // E-Signature Handler
  const handleSaveSignature = (
    docId: string,
    acceptanceDetails: {
      accepted: boolean;
      authorizedName: string;
      authorizedCompany: string;
      authorizedDate: string;
      signatureDataUrl: string;
      signatureType: "drawn" | "typed" | "uploaded";
      signerEmail?: string;
      signerIp?: string;
      verificationHash: string;
      notes?: string;
    }
  ) => {
    const updated = documents.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          status: "Accepted" as DocumentStatus,
          acceptanceDetails,
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    setDocuments(updated);
    saveDocuments(updated);
    const updatedTarget = updated.find((d) => d.id === docId);
    if (updatedTarget) saveDocumentToFirestore(COLLECTIONS.PROPOSALS, docId, updatedTarget).catch(() => {});

    // If PDF preview is open for this doc, update it live
    if (pdfPreviewDoc && pdfPreviewDoc.id === docId) {
      setPdfPreviewDoc((prev) =>
        prev
          ? {
              ...prev,
              status: "Accepted",
              acceptanceDetails,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    setESignatureDoc(null);
    showToast(
      "Document Digitally Signed!",
      `Digital signature and certificate hash ${acceptanceDetails.verificationHash.slice(0, 10)}... logged.`,
      "success"
    );
  };

  const handleOpenReminders = (doc?: ProposalDocument, invoice?: Invoice) => {
    setReminderTargetDoc(doc || null);
    setReminderTargetInvoice(invoice || null);
    setReminderModalOpen(true);
  };

  // Invoice Handlers
  const handleSaveInvoice = (invoice: Invoice) => {
    const exists = invoices.some((i) => i.id === invoice.id);
    let updatedInvoices: Invoice[];
    if (exists) {
      updatedInvoices = invoices.map((i) => (i.id === invoice.id ? invoice : i));
    } else {
      updatedInvoices = [invoice, ...invoices];
    }
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);
    saveDocumentToFirestore(COLLECTIONS.INVOICES, invoice.id, invoice).catch(() => {});
    showToast("Invoice Saved", `Invoice ${invoice.invoiceNumber} updated successfully.`, "success");
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const updated = invoices.filter((i) => i.id !== invoiceId);
    setInvoices(updated);
    saveInvoices(updated);
    deleteDocumentFromFirestore(COLLECTIONS.INVOICES, invoiceId).catch(() => {});
    showToast("Invoice Deleted", "Invoice removed.", "info");
  };

  // Receipt Handlers
  const handleSaveReceipt = (receipt: PaymentReceipt) => {
    const exists = receipts.some((r) => r.id === receipt.id);
    let updatedReceipts: PaymentReceipt[];
    if (exists) {
      updatedReceipts = receipts.map((r) => (r.id === receipt.id ? receipt : r));
    } else {
      updatedReceipts = [receipt, ...receipts];
    }
    setReceipts(updatedReceipts);
    saveReceipts(updatedReceipts);
    saveDocumentToFirestore(COLLECTIONS.RECEIPTS, receipt.id, receipt).catch(() => {});
    showToast("Payment Receipt Saved", `Receipt ${receipt.receiptNumber} recorded.`, "success");
  };

  const handleDeleteReceipt = (receiptId: string) => {
    const updated = receipts.filter((r) => r.id !== receiptId);
    setReceipts(updated);
    saveReceipts(updated);
    deleteDocumentFromFirestore(COLLECTIONS.RECEIPTS, receiptId).catch(() => {});
    showToast("Receipt Deleted", "Payment receipt removed.", "info");
  };

  // Action Bar Triggers
  const handleOpenNewDoc = (type: "Proposal" | "Quotation", clientId?: string) => {
    setActiveEditingDoc(null);
    setEditorDocType(type);
    setEditorClientId(clientId);
    setActiveTab("editor");
  };

  const handleEditDoc = (doc: ProposalDocument) => {
    setActiveEditingDoc(doc);
    setEditorDocType(doc.type);
    setActiveTab("editor");
  };

  // AI Application Handler
  const handleApplyAIGeneratedData = (
    generatedData: any,
    docType: "Proposal" | "Quotation" = "Proposal",
    selectedClientId?: string
  ) => {
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    const newDocNumber = generateDocNumber("Proposal", documents);

    const generatedDoc: ProposalDocument = {
      id: `doc_${Date.now()}`,
      docNumber: newDocNumber,
      title: generatedData.title || `Business Proposal & Quotation for ${client?.name || "Client"}`,
      type: "Proposal",
      status: "Draft",
      isCompleted: false,
      clientId: client?.id || "",
      clientName: client?.name || "Valued Client",
      clientCompany: client?.company || "",
      clientEmail: client?.email || "",
      clientAddress: client?.address || "",
      clientTaxId: client?.taxId || "",
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      overview: generatedData.overview || "",
      requirements: generatedData.requirements || "",
      proposedSolution: generatedData.proposedSolution || "",
      scopeOfWork: generatedData.scopeOfWork || "",
      deliverables: generatedData.deliverables || [],
      responsibilities: {
        provider: `• Dedicated project execution and milestones delivery.\n• Continuous communication and progress updates.\n• 30-day post-launch technical warranty.`,
        client: `• Timely provision of assets, copy, and credentials.\n• Prompt milestone sign-off within 3 business days.`,
      },
      milestones: generatedData.milestones
        ? generatedData.milestones.map((m: any, idx: number) => ({
            id: `ai_m_${idx}`,
            name: m.name,
            timeline: m.timeline,
            description: m.description,
          }))
        : [],
      lineItems: generatedData.suggestedLineItems
        ? generatedData.suggestedLineItems.map((li: any, idx: number) => ({
            id: `ai_li_${idx}`,
            description: li.description,
            quantity: li.quantity || 1,
            unitPrice: li.unitPrice || 1000,
            discount: 0,
            taxRate: li.taxRate || company.defaultTaxRate || 10,
          }))
        : [],
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal: 0,
      paymentSchedule: [
        { id: "pm_ai_1", description: "50% Upfront Deposit upon Signing", percentage: 50, amount: 0, dueCondition: "Project Initiation" },
        { id: "pm_ai_2", description: "30% Midpoint Milestone Approval", percentage: 30, amount: 0, dueCondition: "Phase 2 Review" },
        { id: "pm_ai_3", description: "20% Final Sign-off & Delivery", percentage: 20, amount: 0, dueCondition: "Final Handover" },
      ],
      termsAndConditions: generatedData.termsAndConditions || company.paymentTerms,
      companySnapshot: company,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calculate totals for generated document
    let subtotal = 0;
    let taxTotal = 0;
    generatedDoc.lineItems.forEach((item) => {
      const lineSub = item.quantity * item.unitPrice;
      const taxVal = lineSub * (item.taxRate / 100);
      subtotal += lineSub;
      taxTotal += taxVal;
    });
    generatedDoc.subtotal = subtotal;
    generatedDoc.taxTotal = taxTotal;
    generatedDoc.grandTotal = subtotal + taxTotal;

    // Recalculate payment milestone amounts
    if (generatedDoc.paymentSchedule) {
      generatedDoc.paymentSchedule = generatedDoc.paymentSchedule.map((pm) => ({
        ...pm,
        amount: Math.round((generatedDoc.grandTotal * (pm.percentage / 100)) * 100) / 100,
      }));
    }

    setActiveEditingDoc(generatedDoc);
    setEditorDocType("Proposal");
    setActiveTab("editor");
  };

  // WP / Database Import
  const handleImportWPData = (data: {
    company?: CompanyProfile;
    clients?: Client[];
    documents?: ProposalDocument[];
    invoices?: Invoice[];
    receipts?: PaymentReceipt[];
  }) => {
    if (data.company) {
      setCompany(data.company);
      saveCompanyProfile(data.company);
    }
    if (data.clients && Array.isArray(data.clients)) {
      setClients(data.clients);
      saveClients(data.clients);
    }
    if (data.documents && Array.isArray(data.documents)) {
      setDocuments(data.documents);
      saveDocuments(data.documents);
    }
    if (data.invoices && Array.isArray(data.invoices)) {
      setInvoices(data.invoices);
      saveInvoices(data.invoices);
    }
    if (data.receipts && Array.isArray(data.receipts)) {
      setReceipts(data.receipts);
      saveReceipts(data.receipts);
    }
    showToast("Database Restored", "Proposals, clients & company data imported successfully.", "success");
  };

  const handleSaveTemplates = (updated: IndustryTemplate[]) => {
    setIndustryTemplates(updated);
    saveIndustryTemplates(updated);
  };

  const handleDeleteAllData = async () => {
    if (!currentUser || currentUser.role !== "Master Admin") {
      showToast("Permission Denied", "Only Master Administrators can execute a system data purge.", "error");
      return;
    }

    try {
      // 1. Purge all operational collections from Google Firebase Firestore
      const cloudRes = await purgeAllDataFromFirestore();

      // 2. Clear state
      setDocuments([]);
      setClients([]);
      setInvoices([]);
      setReceipts([]);

      // 3. Clear local storage
      saveDocuments([]);
      saveClients([]);
      saveInvoices([]);
      saveReceipts([]);

      // 4. Log Audit Trail
      logAuditEvent(
        currentUser,
        "purge_all_data",
        `Master Admin ${currentUser.username} permanently deleted all proposals, clients, invoices, and receipts.`
      );

      showToast(
        "All Data Deleted",
        `Wiped all proposals, clients, invoices, and receipts (${cloudRes.deletedCount} cloud records removed).`,
        "success"
      );
    } catch (err: any) {
      console.error("Failed to delete all data:", err);
      showToast("Purge Error", err?.message || "Failed to delete all data.", "error");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-[#4F46E5] selection:text-white">
      {/* High-Security Login Gate */}
      {!currentUser && (
        <LoginModal
          users={users}
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
          onSaveUsers={handleSaveUsers}
        />
      )}

      {/* Sidebar (Desktop) / Header (Mobile) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "editor") setActiveEditingDoc(null);
        }}
        company={company}
        currentUser={currentUser}
        themeSettings={themeSettings}
        onToggleThemeMode={handleToggleThemeMode}
        onOpenEditProfile={() => setUserProfileModalOpen(true)}
        onOpenNewDoc={(type) => handleOpenNewDoc(type)}
        onOpenAIGenerator={() => setAiModalOpen(true)}
        onOpenNewClient={() => {
          setCrmAddClientOpen(true);
          setActiveTab("crm");
        }}
        onOpenUserManagement={() => setUserManagementOpen(true)}
        onOpenLauncherModal={() => setLauncherModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 w-full">
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 w-full max-w-7xl mx-auto min-w-0">
          {activeTab === "dashboard" && (
            <Dashboard
              documents={documents}
              invoices={invoices}
              receipts={receipts}
              company={company}
              currentUser={currentUser}
              themeSettings={themeSettings}
              onOpenNewDoc={(type) => handleOpenNewDoc(type)}
              onOpenAIGenerator={() => setAiModalOpen(true)}
              onOpenNewClient={() => {
                setCrmAddClientOpen(true);
                setActiveTab("crm");
              }}
              onEditDoc={handleEditDoc}
              onPreviewPDF={(doc) => setPdfPreviewDoc(doc)}
              onDuplicateDoc={handleDuplicateDoc}
              onOpenAutoSend={(doc) => setAutoSendDoc(doc)}
              onOpenReminderTemplates={(doc) => handleOpenReminders(doc)}
            />
          )}

          {activeTab === "documents" && (
            <DocumentList
              documents={documents.filter((d) => !d.isCompleted)}
              company={company}
              invoices={invoices}
              receipts={receipts}
              onOpenNewDoc={(type) => handleOpenNewDoc(type)}
              onEditDoc={handleEditDoc}
              onPreviewPDF={(doc) => setPdfPreviewDoc(doc)}
              onDuplicateDoc={handleDuplicateDoc}
              onUpdateStatus={handleUpdateStatus}
              onDeleteDoc={handleDeleteDoc}
              onOpenAutoSend={(doc) => setAutoSendDoc(doc)}
              onOpenInvoiceModal={(doc, inv) => {
                setInvoiceModalDoc(doc);
                setEditingInvoice(inv);
              }}
              onOpenReceiptModal={(doc, inv, rec) => {
                setReceiptModalDoc(doc);
                setReceiptModalInvoice(inv);
                setEditingReceipt(rec);
              }}
              onOpenESignature={(doc) => setESignatureDoc(doc)}
              onOpenReminderTemplates={(doc) => handleOpenReminders(doc)}
            />
          )}

          {activeTab === "invoices" && (
            <InvoicesAndReceiptsView
              documents={documents}
              invoices={invoices}
              receipts={receipts}
              company={company}
              onOpenInvoiceModal={(doc, inv) => {
                setInvoiceModalDoc(doc);
                setEditingInvoice(inv);
              }}
              onOpenReceiptModal={(doc, inv, rec) => {
                setReceiptModalDoc(doc);
                setReceiptModalInvoice(inv);
                setEditingReceipt(rec);
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onDeleteReceipt={handleDeleteReceipt}
              showToast={showToast}
            />
          )}

          {activeTab === "completed" && (
            <CompletedProjects
              documents={documents}
              invoices={invoices}
              receipts={receipts}
              company={company}
              onReopenProject={handleRestoreProject}
              onPreviewPDF={(doc) => setPdfPreviewDoc(doc)}
              onOpenInvoiceModal={(doc, inv) => {
                setInvoiceModalDoc(doc);
                setEditingInvoice(inv);
              }}
              onOpenReceiptModal={(doc, inv, rec) => {
                setReceiptModalDoc(doc);
                setReceiptModalInvoice(inv);
                setEditingReceipt(rec);
              }}
              showToast={showToast}
            />
          )}

          {activeTab === "editor" && (
            <DocumentEditor
              initialDocument={activeEditingDoc}
              defaultType={editorDocType}
              defaultClientId={editorClientId}
              existingDocuments={documents}
              clients={clients}
              company={company}
              onSaveDoc={handleSaveDoc}
              onPreviewPDF={(doc) => setPdfPreviewDoc(doc)}
              onOpenAIGenerator={() => setAiModalOpen(true)}
              onOpenNewClientModal={() => {
                setCrmAddClientOpen(true);
                setActiveTab("crm");
              }}
              onCancel={() => {
                setActiveEditingDoc(null);
                setActiveTab("documents");
              }}
              showToast={showToast}
              onOpenAutoSend={(doc) => setAutoSendDoc(doc)}
              onOpenTemplateManager={() => setTemplateManagerOpen(true)}
            />
          )}

          {activeTab === "crm" && (
            <ClientCRM
              clients={clients}
              documents={documents}
              company={company}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              onCreateDocForClient={(client, type) => handleOpenNewDoc(type, client.id)}
              showToast={showToast}
              initialAddModalOpen={crmAddClientOpen}
            />
          )}

          {activeTab === "settings" && (
            <CompanyProfileSettings
              company={company}
              onSave={handleSaveCompanyProfile}
              themeSettings={themeSettings}
              onSaveTheme={handleSaveThemeSettings}
              currentUser={currentUser}
              onOpenEditProfile={() => setUserProfileModalOpen(true)}
              clients={clients}
              documents={documents}
              invoices={invoices}
              receipts={receipts}
              users={users}
              onImportData={handleImportWPData}
              onDeleteAllData={handleDeleteAllData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Custom Invoice Generator & Customizer Modal */}
      {invoiceModalDoc && (
        <InvoiceModal
          isOpen={!!invoiceModalDoc}
          document={invoiceModalDoc}
          initialInvoice={editingInvoice}
          existingInvoices={invoices}
          company={company}
          onClose={() => {
            setInvoiceModalDoc(null);
            setEditingInvoice(undefined);
          }}
          onSaveInvoice={handleSaveInvoice}
          onOpenReceiptModal={(inv) => {
            setReceiptModalDoc(invoiceModalDoc);
            setReceiptModalInvoice(inv);
            setEditingReceipt(undefined);
          }}
          showToast={showToast}
        />
      )}

      {/* Official Payment Receipt Generator Modal */}
      {receiptModalDoc && (
        <PaymentReceiptModal
          isOpen={!!receiptModalDoc}
          document={receiptModalDoc}
          invoice={receiptModalInvoice}
          initialReceipt={editingReceipt}
          existingReceipts={receipts}
          existingInvoices={invoices}
          company={company}
          onClose={() => {
            setReceiptModalDoc(null);
            setReceiptModalInvoice(undefined);
            setEditingReceipt(undefined);
          }}
          onSaveReceipt={handleSaveReceipt}
          showToast={showToast}
        />
      )}

      {/* AI Smart Generator Modal */}
      <AIGeneratorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        company={company}
        clients={clients}
        onApplyGeneratedData={handleApplyAIGeneratedData}
        showToast={showToast}
      />

      {/* PDF Live Preview & Export Modal */}
      <PDFPreviewModal
        document={pdfPreviewDoc}
        onClose={() => setPdfPreviewDoc(null)}
        onOpenESignature={(doc) => setESignatureDoc(doc)}
        showToast={showToast}
      />

      {/* Digital E-Signature & Audit Seal Capture Modal */}
      <ESignatureModal
        isOpen={!!eSignatureDoc}
        document={eSignatureDoc}
        company={company}
        onClose={() => setESignatureDoc(null)}
        onSaveSignature={handleSaveSignature}
        showToast={showToast}
      />

      {/* Automated Reminder Templates & Multi-Channel Dispatch Modal */}
      <ReminderTemplatesModal
        isOpen={reminderModalOpen}
        onClose={() => {
          setReminderModalOpen(false);
          setReminderTargetDoc(null);
          setReminderTargetInvoice(null);
        }}
        company={company}
        documents={documents}
        invoices={invoices}
        targetDoc={reminderTargetDoc}
        targetInvoice={reminderTargetInvoice}
        showToast={showToast}
      />

      {/* Auto-Send Email & WhatsApp Modal */}
      <AutoSendModal
        document={autoSendDoc}
        company={company}
        isOpen={!!autoSendDoc}
        onClose={() => setAutoSendDoc(null)}
        onMarkSent={(docId) => handleUpdateStatus(docId, "Sent")}
        showToast={showToast}
      />

      {/* Industry Template Manager Modal */}
      <TemplateManagerModal
        isOpen={templateManagerOpen}
        templates={industryTemplates}
        onClose={() => setTemplateManagerOpen(false)}
        onSaveTemplates={handleSaveTemplates}
        showToast={showToast}
      />

      {/* User Roles & Security Management Modal */}
      <UserManagementModal
        isOpen={userManagementOpen}
        currentUser={currentUser}
        users={users}
        onClose={() => setUserManagementOpen(false)}
        onSaveUsers={handleSaveUsers}
        showToast={showToast}
      />

      {/* First Time Login Credentials Setup Modal */}
      {currentUser && (
        <FirstLoginSetupModal
          isOpen={
            !!currentUser.isFirstLogin ||
            (currentUser.username === "admin" &&
              currentUser.passwordHash === "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9")
          }
          currentUser={currentUser}
          users={users}
          onCompleteSetup={handleUpdateCurrentUser}
          showToast={showToast}
        />
      )}

      {/* Self-Service Profile & Password Editing Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={userProfileModalOpen}
          currentUser={currentUser}
          onClose={() => setUserProfileModalOpen(false)}
          onUpdateUser={handleUpdateCurrentUser}
          showToast={showToast}
        />
      )}

      {/* One-Click App Launcher Modal */}
      <OneClickLauncherModal
        isOpen={launcherModalOpen}
        onClose={() => setLauncherModalOpen(false)}
        showToast={showToast}
      />

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
