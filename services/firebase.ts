import * as firebaseApp from 'firebase/app';
import { getFirestore, setLogLevel } from 'firebase/firestore';
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

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
};
export type { FirebaseUser };

setLogLevel('silent');
