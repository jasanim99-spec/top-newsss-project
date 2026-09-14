import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNytnPODeEMXgeY0P1SHmH3QL06GSchrg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "top-news-478c4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "top-news-478c4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "top-news-478c4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "502092206960",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:502092206960:web:aa9376e7fef3dbfe5075b5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

