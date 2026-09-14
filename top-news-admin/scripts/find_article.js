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

async function findArticle() {
  const newsCol = collection(db, 'news');
  const snap = await getDocs(newsCol);
  console.log('=== SEARCHING FOR CONGRESS / VANDE MATARAM ARTICLE IN FIRESTORE ===');
  let found = false;
  for (const d of snap.docs) {
    const data = d.data();
    if ((data.title || '').toLowerCase().includes('bjp') || (data.title || '').toLowerCase().includes('vande') || (data.title || '').toLowerCase().includes('congress')) {
      console.log('FOUND IN FIRESTORE:');
      console.log('Doc ID:', d.id);
      console.log('Title:', data.title);
      console.log('Category:', data.category);
      console.log('Language:', data.language);
      console.log('Status:', data.status);
      found = true;
    }
  }
  if (!found) {
    console.log('❌ NOT FOUND IN FIRESTORE AT ALL!');
  }
  console.log('================================================================');
  process.exit(0);
}

findArticle().catch(err => {
  console.error(err);
  process.exit(1);
});
