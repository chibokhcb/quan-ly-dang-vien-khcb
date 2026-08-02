import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyMockKeyForPreviewModeOnly123456',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'app-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'app-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'app-dev.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:1234567890',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testFirebaseConnection(): Promise<boolean> {
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    return true; // Mock mode is active
  }
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Firebase is offline or unconfigured.');
    }
    return false;
  }
}
