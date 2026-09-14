import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function testWrite() {
  const testId = 'article_2026_99';
  console.log('Writing test document to Firestore:', testId);
  await setDoc(doc(db, 'news', testId), {
    id: testId,
    _id: testId,
    title: "'Should not have played to BJP's strength': Congress unease over 'Vande Mataram' stand",
    slug: "should-not-have-played-to-bjp-strength-congress-unease-vande-mataram",
    description: "A day after the Congress Working Committee (CWC) reaffirmed that only the first two stanzas of 'Vande Mataram' would be sung...",
    content: "Full details of the politics news article...",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800",
    category: "politics",
    topic: "general",
    language: "en",
    section: "main",
    status: "published",
    authorName: "Admin Desk",
    authorRole: "admin",
    views: 120,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('✅ Article article_2026_99 WRITTEN TO FIRESTORE DATABASE SUCCESSFULLY!');
  process.exit(0);
}

testWrite().catch(err => {
  console.error('Firestore write error:', err);
  process.exit(1);
});
