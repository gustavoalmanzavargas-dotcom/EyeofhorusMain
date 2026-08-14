import * as firebaseApp from 'firebase/app';
import { 
  getFirestore, 
  setLogLevel, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';

// Declare globals injected by the environment
declare global {
  interface Window {
    __app_id: string;
    __firebase_config: string;
    __initial_auth_token: string;
  }
}

// Access globals with fallbacks
const appIdRaw = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';

// Default config to prevent crash if environment variable is missing or empty
const fallbackConfig = {
  apiKey: "AIzaSyDiHsvN-wyffaAGuFUCm7_qDnnkyzSa6Pc",
  authDomain: "notional-emblem-vf6jr.firebaseapp.com",
  projectId: "notional-emblem-vf6jr",
  storageBucket: "notional-emblem-vf6jr.firebasestorage.app",
  messagingSenderId: "959027045623",
  appId: "1:959027045623:web:57041ff6387a8a67dc1ff2",
  firestoreDatabaseId: "ai-studio-eyeofhorus-28c3128a-df3a-48be-9e9d-9e2053cf1a4f"
};

let firebaseConfigRaw: any = fallbackConfig;
let isConfigValid = false;

try {
  if (typeof window !== 'undefined' && window.__firebase_config) {
    const parsedConfig = JSON.parse(window.__firebase_config);
    if (parsedConfig && parsedConfig.projectId) {
      firebaseConfigRaw = parsedConfig;
      isConfigValid = true;
    }
  } else {
    isConfigValid = true;
  }
} catch (error) {
  console.warn('Failed to parse window.__firebase_config, using fallback:', error);
}

export const appId = appIdRaw;
export const isValidConfig = isConfigValid;

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfigRaw);

// Handle named database ID if present
export const db = firebaseConfigRaw.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigRaw.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
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
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Validate connection to Firestore on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration.");
    }
  }
}
if (typeof window !== 'undefined') {
  testConnection();
}

// Firestore Agent Persistence Helpers
export async function getAgentsFromFirestore(): Promise<any[]> {
  const path = 'agents';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveAgentToFirestore(agent: any): Promise<void> {
  if (!agent || !agent.id) return;
  const path = `agents/${agent.id}`;
  try {
    await setDoc(doc(db, 'agents', String(agent.id)), {
      id: String(agent.id),
      name: agent.name || 'Unnamed Agent',
      ip: agent.ip || '127.0.0.1',
      os: agent.os || 'Linux',
      version: agent.version || '4.4.1',
      status: agent.status || 'Active',
      dateAdded: agent.dateAdded || new Date().toISOString().split('T')[0],
      key: agent.key || '',
      lastSeen: agent.lastSeen || new Date().toISOString(),
      hostname: agent.hostname || agent.name || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAgentFromFirestore(agentId: string): Promise<void> {
  const path = `agents/${agentId}`;
  try {
    await deleteDoc(doc(db, 'agents', String(agentId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToAgents(callback: (agents: any[]) => void) {
  const path = 'agents';
  try {
    return onSnapshot(collection(db, path), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (e) {
    return () => {};
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
};
export type { FirebaseUser };

setLogLevel('silent');
