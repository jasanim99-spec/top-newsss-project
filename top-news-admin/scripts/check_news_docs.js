import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  console.log('Total Firestore News Docs:', snap.docs.length);
  snap.docs.forEach(doc => {
    console.log('Doc ID:', doc.id, '==>', JSON.stringify(doc.data().title));
  });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
