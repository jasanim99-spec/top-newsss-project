import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNytnPODeEMXgeY0P1SHmH3QL06GSchrg",
  authDomain: "top-news-478c4.firebaseapp.com",
  projectId: "top-news-478c4",
  storageBucket: "top-news-478c4.firebasestorage.app",
  messagingSenderId: "502092206960",
  appId: "1:502092206960:web:aa9376e7fef3dbfe5075b5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const newsCol = collection(db, 'news');
  const snap = await getDocs(newsCol);
  console.log('=== ALL FIRESTORE NEWS DOCUMENTS ===');
  for (const d of snap.docs) {
    console.log(`Doc ID: ${d.id} | Title: "${d.data().title}" | Status: "${d.data().status}"`);
  }
  console.log('====================================');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
