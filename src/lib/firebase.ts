import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  getDocFromServer,
  Firestore,
} from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfigData);

// Initialize Firestore with custom databaseId if configured
export const db: Firestore = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export const firebaseInfo = {
  projectId: firebaseConfigData.projectId,
  databaseId: firebaseConfigData.firestoreDatabaseId || "(default)",
  authDomain: firebaseConfigData.authDomain,
};

let cloudStatus: "connected" | "connecting" | "offline" = "connecting";
const statusListeners = new Set<(status: "connected" | "connecting" | "offline") => void>();

export const getCloudStatus = () => cloudStatus;

export const onCloudStatusChange = (cb: (status: "connected" | "connecting" | "offline") => void) => {
  statusListeners.add(cb);
  cb(cloudStatus);
  return () => statusListeners.delete(cb);
};

const notifyStatus = (status: "connected" | "connecting" | "offline") => {
  cloudStatus = status;
  statusListeners.forEach((cb) => {
    try {
      cb(status);
    } catch (e) {
      console.warn("Status listener error", e);
    }
  });
};

// Validate connection to Firestore on boot
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    // Attempt a light server query
    await getDocFromServer(doc(db, "test", "connection"));
    notifyStatus("connected");
    console.log("Firebase Firestore successfully connected:", firebaseInfo.projectId);
    return true;
  } catch (error: any) {
    if (error?.message && error.message.includes("client is offline")) {
      console.warn("Firebase client offline or unreachable, using cached/local mode.");
      notifyStatus("offline");
      return false;
    }
    // Any permission or exists response still means the server is reachable
    notifyStatus("connected");
    return true;
  }
}

// Save or Update a Document in Firestore
export async function saveDocumentToFirestore(collectionName: string, id: string, data: any): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    // Remove undefined values to avoid Firestore serialization errors
    const sanitizedData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, sanitizedData, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Failed to save document ${id} to ${collectionName}:`, err);
    return false;
  }
}

// Delete a Document from Firestore
export async function deleteDocumentFromFirestore(collectionName: string, id: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`Failed to delete document ${id} from ${collectionName}:`, err);
    return false;
  }
}

// Fetch all documents in a collection from Firestore
export async function fetchCollectionFromFirestore<T = any>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const results: T[] = [];
    snap.forEach((d) => {
      results.push(d.data() as T);
    });
    return results;
  } catch (err) {
    console.warn(`Failed to fetch collection ${collectionName}:`, err);
    return [];
  }
}

// Subscribe to real-time changes in a collection
export function subscribeToCollection<T = any>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: T[] = [];
      snap.forEach((d) => {
        items.push(d.data() as T);
      });
      onData(items);
    },
    (err) => {
      console.warn(`Firestore snapshot error for ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
}

// Purge all operational data (proposals, clients, invoices, receipts) from Firestore
export async function purgeAllDataFromFirestore(): Promise<{ success: boolean; deletedCount: number }> {
  try {
    let deletedCount = 0;
    const collectionsToPurge = ["proposals", "clients", "invoices", "receipts"];
    for (const colName of collectionsToPurge) {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        deletedCount++;
      }
    }
    return { success: true, deletedCount };
  } catch (err) {
    console.error("Failed to purge data from Firestore:", err);
    return { success: false, deletedCount: 0 };
  }
}

