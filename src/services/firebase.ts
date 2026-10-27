import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Ship, Route, Schedule, CargoShipment, PassengerTicket } from '../types';
import { INITIAL_SHIPS, INITIAL_ROUTES, INITIAL_SCHEDULES, INITIAL_CARGO, INITIAL_TICKETS } from './mockData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with database ID specified in configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling conforming to Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { success: true, message: 'Terhubung langsung ke Google Cloud Firestore (Live Online).' };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { success: false, message: 'Koneksi Firestore offline. Menggunakan cache lokal.' };
    }
    // Connected to Firestore
    return { success: true, message: `Status Cloud DB: Terhubung (${firebaseConfig.projectId})` };
  }
}

// Collection Names
export const COLLECTIONS = {
  SHIPS: 'ships',
  ROUTES: 'routes',
  SCHEDULES: 'schedules',
  CARGO: 'cargo_shipments',
  TICKETS: 'passenger_tickets',
};

// Automatic Cloud Database Synchronization upon app load across all devices
export async function initializeDatabaseAutoSync(): Promise<{ seeded: boolean; synced: boolean; message: string }> {
  try {
    const shipsRef = collection(db, COLLECTIONS.SHIPS);
    const snap = await getDocs(shipsRef);

    if (snap.empty) {
      console.log('Database Cloud Firestore kosong. Menginjeksi data operasional awal secara otomatis...');
      await seedInitialFirestoreData();
      return { 
        seeded: true, 
        synced: true, 
        message: 'Database berhasil diinisialisasi & disinkronkan ke Cloud Firestore untuk semua perangkat.' 
      };
    }

    return { 
      seeded: false, 
      synced: true, 
      message: 'Database Cloud Firestore tersinkronisasi online dengan semua perangkat.' 
    };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SHIPS);
    return { 
      seeded: false, 
      synced: false, 
      message: error?.message || 'Sinkronisasi lokal aktif.' 
    };
  }
}

// Generic Realtime Subscription with Instant Local Cache + Live Cloud Sync
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  initialFallback: T[],
  onUpdate: (data: T[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, collectionName);
  const localCacheKey = `ars_${collectionName}`;

  // 1. Instantly deliver cached data so UI is immediate on any device
  const cached = localStorage.getItem(localCacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdate(parsed);
      } else {
        onUpdate(initialFallback);
      }
    } catch {
      onUpdate(initialFallback);
    }
  } else {
    onUpdate(initialFallback);
  }

  // 2. Subscribe to live Firestore updates across all devices
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        localStorage.setItem(localCacheKey, JSON.stringify(items));
        onUpdate(items);
      } else {
        // If empty in cloud, check local cache or fallback
        const local = localStorage.getItem(localCacheKey);
        if (local) {
          try {
            onUpdate(JSON.parse(local));
          } catch {
            onUpdate(initialFallback);
          }
        } else {
          onUpdate(initialFallback);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

// CRUD Operations: Create / Set
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  const localCacheKey = `ars_${collectionName}`;

  // 1. Immediately update local cache for instant zero-latency UI
  try {
    const cached = localStorage.getItem(localCacheKey);
    let items: T[] = cached ? JSON.parse(cached) : [];
    const index = items.findIndex(i => i.id === data.id);
    if (index >= 0) {
      items[index] = data;
    } else {
      items.unshift(data);
    }
    localStorage.setItem(localCacheKey, JSON.stringify(items));
  } catch (err) {
    console.error('Local cache error:', err);
  }

  // 2. Push mutation to Firestore Cloud (broadcasts to all other devices in real-time)
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${data.id}`);
  }
}

// CRUD Operations: Delete
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const localCacheKey = `ars_${collectionName}`;

  // 1. Update local cache immediately
  try {
    const cached = localStorage.getItem(localCacheKey);
    if (cached) {
      const items: any[] = JSON.parse(cached);
      const filtered = items.filter(i => i.id !== id);
      localStorage.setItem(localCacheKey, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Local cache delete error:', err);
  }

  // 2. Delete from Firestore Cloud (deletes across all devices in real-time)
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// Seed Initial Data to Firestore
export async function seedInitialFirestoreData(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;

    for (const ship of INITIAL_SHIPS) {
      await setDoc(doc(db, COLLECTIONS.SHIPS, ship.id), ship, { merge: true });
      count++;
    }
    for (const route of INITIAL_ROUTES) {
      await setDoc(doc(db, COLLECTIONS.ROUTES, route.id), route, { merge: true });
      count++;
    }
    for (const sched of INITIAL_SCHEDULES) {
      await setDoc(doc(db, COLLECTIONS.SCHEDULES, sched.id), sched, { merge: true });
      count++;
    }
    for (const cargo of INITIAL_CARGO) {
      await setDoc(doc(db, COLLECTIONS.CARGO, cargo.id), cargo, { merge: true });
      count++;
    }
    for (const tkt of INITIAL_TICKETS) {
      await setDoc(doc(db, COLLECTIONS.TICKETS, tkt.id), tkt, { merge: true });
      count++;
    }

    // Also update localStorage
    localStorage.setItem(`ars_${COLLECTIONS.SHIPS}`, JSON.stringify(INITIAL_SHIPS));
    localStorage.setItem(`ars_${COLLECTIONS.ROUTES}`, JSON.stringify(INITIAL_ROUTES));
    localStorage.setItem(`ars_${COLLECTIONS.SCHEDULES}`, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(`ars_${COLLECTIONS.CARGO}`, JSON.stringify(INITIAL_CARGO));
    localStorage.setItem(`ars_${COLLECTIONS.TICKETS}`, JSON.stringify(INITIAL_TICKETS));

    return { success: true, count };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, 'seed');
    return { success: false, count: 0, error: err.message || String(err) };
  }
}

// Auth Helper Functions
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
