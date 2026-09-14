import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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

async function createNewsArticle() {
  const newId = `news_${Date.now()}`;
  const docRef = doc(db, 'news', newId);

  const articlePayload = {
    id: newId,
    _id: newId,
    title: "ગોલ્ડ મેડલ વિજેતા ભારતીય ટીમે રચ્યો ઇતિહાસ: વર્લ્ડ ચેમ્પિયનશિપમાં શાનદાર પ્રદર્શન",
    slug: "gold-medal-winner-indian-team-wins-world-championship-2026",
    description: "વર્લ્ડ ચેમ્પિયનશિપની ફાઇનલમાં શાનદાર પ્રદર્શન કરીને ભારતીય ટીમે ગોલ્ડ મેડલ જીતીને દેશનું નામ રોશન કર્યું છે.",
    content: "ભારતીય રમતના ઇતિહાસમાં આજે વધુ એક સુવર્ણ પ્રકરણ ઉમેરાયું છે. વર્લ્ડ ચેમ્પિયનશિપની ફાઇનલ મેચમાં ભારતીય ટીમે વિરોધી ટીમને હરાવીને ગોલ્ડ મેડલ પર કબજો જમાવ્યો છે.",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800",
    category: "sports",
    topic: "general",
    language: "gu",
    section: "main",
    status: "published",
    authorName: "Admin Desk",
    authorRole: "admin",
    isBreaking: true,
    views: 150,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('Creating news article in Firestore:', articlePayload.title);
  await setDoc(docRef, articlePayload);
  console.log('✅ Article successfully created in Firestore with ID:', newId);

  const checkDoc = await getDoc(docRef);
  if (checkDoc.exists()) {
    console.log('✅ Verification: Created article exists in Firestore database with status:', checkDoc.data().status);
  } else {
    console.error('❌ Verification failed');
  }

  process.exit(0);
}

createNewsArticle().catch(err => {
  console.error('Create error:', err);
  process.exit(1);
});
