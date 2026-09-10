import {
  db,
  validateFirestoreConnection,
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  fetchCollectionFromFirestore,
  subscribeToCollection,
  firebaseInfo,
  purgeAllDataFromFirestore,
} from "../lib/firebase";
import {
  ProposalDocument,
  Client,
  Invoice,
  PaymentReceipt,
  CompanyProfile,
  IndustryTemplate,
  User,
} from "../types";
import {
  loadDocuments,
  saveDocuments,
  loadClients,
  saveClients,
  loadInvoices,
  saveInvoices,
  loadReceipts,
  saveReceipts,
  loadCompanyProfile,
  saveCompanyProfile,
  loadUsers,
  saveUsers,
  hashPassword,
} from "./storage";

export {
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  fetchCollectionFromFirestore,
  validateFirestoreConnection,
  purgeAllDataFromFirestore,
};

export const COLLECTIONS = {
  PROPOSALS: "proposals",
  CLIENTS: "clients",
  INVOICES: "invoices",
  RECEIPTS: "receipts",
  COMPANY: "companies",
  TEMPLATES: "templates",
  USERS: "users",
};

export interface CloudSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  projectId: string;
}

// Push all local data into Firebase Firestore
export async function pushAllLocalDataToFirebase(
  data: {
    documents: ProposalDocument[];
    clients: Client[];
    invoices: Invoice[];
    receipts: PaymentReceipt[];
    company: CompanyProfile;
    users?: User[];
  }
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;

    // 1. Company Profile
    if (data.company) {
      await saveDocumentToFirestore(COLLECTIONS.COMPANY, "main_profile", data.company);
      count++;
    }

    // 2. Clients
    for (const client of data.clients) {
      await saveDocumentToFirestore(COLLECTIONS.CLIENTS, client.id, client);
      count++;
    }

    // 3. Proposals
    for (const doc of data.documents) {
      await saveDocumentToFirestore(COLLECTIONS.PROPOSALS, doc.id, doc);
      count++;
    }

    // 4. Invoices
    for (const inv of data.invoices) {
      await saveDocumentToFirestore(COLLECTIONS.INVOICES, inv.id, inv);
      count++;
    }

    // 5. Receipts
    for (const rec of data.receipts) {
      await saveDocumentToFirestore(COLLECTIONS.RECEIPTS, rec.id, rec);
      count++;
    }

    // 6. Users
    const usersToPush = data.users || loadUsers();
    if (usersToPush && usersToPush.length > 0) {
      for (const u of usersToPush) {
        await saveDocumentToFirestore(COLLECTIONS.USERS, u.id, u);
        count++;
      }
    }

    return { success: true, count };
  } catch (err: any) {
    console.error("Error pushing local data to Firebase:", err);
    return { success: false, count: 0, error: err?.message || "Failed to push data" };
  }
}

// Initial Sync & Seeding: If cloud is empty, seed from local. If cloud has data, load from cloud!
export async function initializeCloudSync(
  callbacks: {
    onDocumentsLoaded?: (docs: ProposalDocument[]) => void;
    onClientsLoaded?: (clients: Client[]) => void;
    onInvoicesLoaded?: (invs: Invoice[]) => void;
    onReceiptsLoaded?: (recs: PaymentReceipt[]) => void;
    onCompanyLoaded?: (comp: CompanyProfile) => void;
    onUsersLoaded?: (users: User[]) => void;
  }
) {
  const isConnected = await validateFirestoreConnection();
  if (!isConnected) return;

  try {
    // 1. Check & Sync Proposals
    const cloudDocs = await fetchCollectionFromFirestore<ProposalDocument>(COLLECTIONS.PROPOSALS);
    if (cloudDocs && cloudDocs.length > 0) {
      const localDocs = loadDocuments();
      const docMap = new Map<string, ProposalDocument>();
      for (const d of cloudDocs) docMap.set(d.id, d);
      for (const d of localDocs) {
        if (!docMap.has(d.id)) {
          await saveDocumentToFirestore(COLLECTIONS.PROPOSALS, d.id, d);
          docMap.set(d.id, d);
        }
      }
      const finalDocs = Array.from(docMap.values());
      saveDocuments(finalDocs);
      if (callbacks.onDocumentsLoaded) callbacks.onDocumentsLoaded(finalDocs);
    } else {
      const localDocs = loadDocuments();
      for (const d of localDocs) {
        await saveDocumentToFirestore(COLLECTIONS.PROPOSALS, d.id, d);
      }
    }

    // 2. Check & Sync Clients
    const cloudClients = await fetchCollectionFromFirestore<Client>(COLLECTIONS.CLIENTS);
    if (cloudClients && cloudClients.length > 0) {
      const localClients = loadClients();
      const clientMap = new Map<string, Client>();
      for (const c of cloudClients) clientMap.set(c.id, c);
      for (const c of localClients) {
        if (!clientMap.has(c.id)) {
          await saveDocumentToFirestore(COLLECTIONS.CLIENTS, c.id, c);
          clientMap.set(c.id, c);
        }
      }
      const finalClients = Array.from(clientMap.values());
      saveClients(finalClients);
      if (callbacks.onClientsLoaded) callbacks.onClientsLoaded(finalClients);
    } else {
      const localClients = loadClients();
      for (const c of localClients) {
        await saveDocumentToFirestore(COLLECTIONS.CLIENTS, c.id, c);
      }
    }

    // 3. Check & Sync Invoices
    const cloudInvoices = await fetchCollectionFromFirestore<Invoice>(COLLECTIONS.INVOICES);
    if (cloudInvoices && cloudInvoices.length > 0) {
      const localInvoices = loadInvoices();
      const invMap = new Map<string, Invoice>();
      for (const inv of cloudInvoices) invMap.set(inv.id, inv);
      for (const inv of localInvoices) {
        if (!invMap.has(inv.id)) {
          await saveDocumentToFirestore(COLLECTIONS.INVOICES, inv.id, inv);
          invMap.set(inv.id, inv);
        }
      }
      const finalInvoices = Array.from(invMap.values());
      saveInvoices(finalInvoices);
      if (callbacks.onInvoicesLoaded) callbacks.onInvoicesLoaded(finalInvoices);
    } else {
      const localInvoices = loadInvoices();
      for (const inv of localInvoices) {
        await saveDocumentToFirestore(COLLECTIONS.INVOICES, inv.id, inv);
      }
    }

    // 4. Check & Sync Receipts
    const cloudReceipts = await fetchCollectionFromFirestore<PaymentReceipt>(COLLECTIONS.RECEIPTS);
    if (cloudReceipts && cloudReceipts.length > 0) {
      const localReceipts = loadReceipts();
      const recMap = new Map<string, PaymentReceipt>();
      for (const rec of cloudReceipts) recMap.set(rec.id, rec);
      for (const rec of localReceipts) {
        if (!recMap.has(rec.id)) {
          await saveDocumentToFirestore(COLLECTIONS.RECEIPTS, rec.id, rec);
          recMap.set(rec.id, rec);
        }
      }
      const finalReceipts = Array.from(recMap.values());
      saveReceipts(finalReceipts);
      if (callbacks.onReceiptsLoaded) callbacks.onReceiptsLoaded(finalReceipts);
    } else {
      const localReceipts = loadReceipts();
      for (const rec of localReceipts) {
        await saveDocumentToFirestore(COLLECTIONS.RECEIPTS, rec.id, rec);
      }
    }

    // 5. Check & Sync Company Profile
    const cloudCompanies = await fetchCollectionFromFirestore<CompanyProfile>(COLLECTIONS.COMPANY);
    if (cloudCompanies && cloudCompanies.length > 0) {
      const activeCompany = cloudCompanies[0];
      saveCompanyProfile(activeCompany);
      if (callbacks.onCompanyLoaded) callbacks.onCompanyLoaded(activeCompany);
    } else {
      const localCompany = loadCompanyProfile();
      await saveDocumentToFirestore(COLLECTIONS.COMPANY, "main_profile", localCompany);
    }

    // 6. Check & Sync Users (Bidirectional Merge, Repair & Cloud Push)
    const localUsers = loadUsers();
    const cloudUsers = await fetchCollectionFromFirestore<User>(COLLECTIONS.USERS);
    const userMap = new Map<string, User>();

    // Index cloud users by username to eliminate duplicates and repair damaged documents
    for (const u of cloudUsers) {
      const usernameKey = u.username.toLowerCase().trim();
      if (!u.passwordHash) {
        if (usernameKey === "admin") u.passwordHash = hashPassword("admin123");
        else if (usernameKey === "fahmed") u.passwordHash = hashPassword("Xyron@2026!");
        else if (usernameKey === "manager") u.passwordHash = hashPassword("manager123");
        else u.passwordHash = hashPassword("admin123");
        await saveDocumentToFirestore(COLLECTIONS.USERS, u.id, u);
      }
      userMap.set(usernameKey, u);
    }

    // Merge any locally created user and guarantee they exist in Firebase Firestore
    for (const u of localUsers) {
      const usernameKey = u.username.toLowerCase().trim();
      const existing = userMap.get(usernameKey);
      if (!existing) {
        await saveDocumentToFirestore(COLLECTIONS.USERS, u.id, u);
        userMap.set(usernameKey, u);
      } else if (!existing.passwordHash && u.passwordHash) {
        existing.passwordHash = u.passwordHash;
        await saveDocumentToFirestore(COLLECTIONS.USERS, existing.id, existing);
      }
    }

    const finalUsers = Array.from(userMap.values());
    saveUsers(finalUsers);
    if (callbacks.onUsersLoaded) callbacks.onUsersLoaded(finalUsers);
  } catch (err) {
    console.warn("Error during cloud sync initialization:", err);
  }
}

// Helper to push all users to Firestore
export async function pushAllUsersToFirestore(users: User[]): Promise<{ success: boolean; count: number }> {
  try {
    let count = 0;
    for (const u of users) {
      await saveDocumentToFirestore(COLLECTIONS.USERS, u.id, u);
      count++;
    }
    return { success: true, count };
  } catch (e) {
    console.error("Failed to push users to Firestore", e);
    return { success: false, count: 0 };
  }
}
