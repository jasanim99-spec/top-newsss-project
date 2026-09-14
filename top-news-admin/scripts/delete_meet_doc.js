import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, deleteDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNytnPODeEMXgeY0P1SHmH3QL06GSchrg",
  authDomain: "top-news-478c4.firebaseapp.com",
  projectId: "top-news-478c4",
  storageBucket: "top-news-478c4.firebasestorage.app",
  messagingSenderId: "502092206960",
  appId: "1:502092206960:web:aa9376e7fef3dbfe5075b5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log('Signing in admin...');
  try {
    await signInWithEmailAndPassword(auth, 'jasanim99@gmail.com', 'TOPNEWS2026');
    console.log('Signed in successfully!');
  } catch (e) {
    console.warn('Sign in warning:', e.message);
  }

  const newsCol = collection(db, 'news');
  const snap = await getDocs(newsCol);
  console.log('Found docs in Firestore:');
  for (const d of snap.docs) {
    console.log(d.id, '==>', d.data().title, 'status:', d.data().status);
    if (d.data().title === 'meet' || d.id === '5QUNSOE1NHTF6AhFC1r1' || d.data().status === 'deleted') {
      console.log('Marking deleted & deleting doc:', d.id);
      try {
        await updateDoc(doc(db, 'news', d.id), { status: 'deleted' });
      } catch (e) { console.warn('update error:', e.message); }
      try {
        await deleteDoc(doc(db, 'news', d.id));
        console.log('Deleted successfully!');
      } catch (e) { console.warn('delete error:', e.message); }
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
