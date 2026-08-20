import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNytnPODeEMXgeY0P1SHmH3QL06GSchrg",
  authDomain: "top-news-478c4.firebaseapp.com",
  projectId: "top-news-478c4",
  storageBucket: "top-news-478c4.firebasestorage.app",
  messagingSenderId: "502092206960",
  appId: "1:502092206960:web:aa9376e7fef3dbfe5075b5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function bootstrap() {
  const email = process.argv[2] || "admin@topnews.com";
  const password = process.argv[3] || "admin123456";

  console.log(`Authenticating initial admin (${email})...`);
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Authentication failed:", err.message);
    process.exit(1);
  }

  const uid = cred.user.uid;
  console.log("Authenticated UID:", uid);

  try {
    const adminDocRef = doc(db, "admins", uid);
    await setDoc(adminDocRef, {
      uid: uid,
      email: email,
      name: "Admin",
      role: "admin",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`SUCCESS: Initial admin document created/updated in Firestore at admins/${uid}`);
    process.exit(0);
  } catch (err) {
    console.error("Firestore write failed:", err.message);
    process.exit(1);
  }
}

bootstrap();
