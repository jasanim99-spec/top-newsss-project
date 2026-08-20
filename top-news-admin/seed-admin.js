import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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

async function seed() {
  const email = "admin@topnews.com";
  const password = "admin123456";

  let user;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    user = cred.user;
    console.log("SUCCESS: User created in Firebase Auth with UID:", user.uid);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("User already exists in Firebase Auth, logging in...");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      user = cred.user;
    } else {
      console.error("Auth creation error:", err.message);
      process.exit(1);
    }
  }

  // Create active admin document in Firestore
  const adminRef = doc(db, "admins", user.uid);
  await setDoc(adminRef, {
    uid: user.uid,
    email: email,
    name: "Super Admin",
    role: "admin",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log("SUCCESS: Admin document created in Firestore under admins/" + user.uid);
  process.exit(0);
}

seed();
