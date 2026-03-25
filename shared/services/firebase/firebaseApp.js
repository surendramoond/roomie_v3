import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base-64';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

if (typeof global.atob === 'undefined') {
  global.atob = decode;
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredFirebaseKeys = Object.keys(firebaseConfig);

export const missingFirebaseKeys = requiredFirebaseKeys.filter((key) => !firebaseConfig[key]?.trim());

if (missingFirebaseKeys.length > 0) {
  throw new Error(`Firebase config is missing: ${missingFirebaseKeys.join(', ')}`);
}

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let firebaseAuth = null;

try {
  firebaseAuth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  firebaseAuth = getAuth(firebaseApp);
}

const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, firebaseAuth, firestore, storage };
