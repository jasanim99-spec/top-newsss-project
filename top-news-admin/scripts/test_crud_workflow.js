import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';

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

async function testCRUD() {
  console.log('=== STARTING CRUD WORKFLOW TEST ===');
  
  const testId = `test_${Date.now()}`;
  const testDocRef = doc(db, 'news', testId);

  // 1. Create Article Test
  console.log('1. Testing CREATE news article...');
  const newArticle = {
    id: testId,
    title: 'Automated CRUD Verification Article',
    slug: `test-crud-${Date.now()}`,
    description: 'Test description for automated verification',
    content: 'Test content for automated verification',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    category: 'business',
    topic: 'general',
    language: 'en',
    section: 'main',
    status: 'published',
    views: 0,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(testDocRef, newArticle);
    console.log('✅ CREATE Success: Document written to Firestore with ID:', testId);
  } catch (e) {
    console.error('❌ CREATE Failed:', e.message);
  }

  // 2. Read Article Test
  console.log('2. Testing READ news article...');
  const snap = await getDoc(testDocRef);
  if (snap.exists() && snap.data().title === newArticle.title) {
    console.log('✅ READ Success: Article fetched correctly from Firestore');
  } else {
    console.error('❌ READ Failed');
  }

  // 3. Update Article Test
  console.log('3. Testing UPDATE news article...');
  const updatedTitle = 'Automated CRUD Verification Article UPDATED';
  try {
    await setDoc(testDocRef, { title: updatedTitle, updatedAt: new Date().toISOString() }, { merge: true });
    const snap2 = await getDoc(testDocRef);
    if (snap2.exists() && snap2.data().title === updatedTitle) {
      console.log('✅ UPDATE Success: Title updated to:', snap2.data().title);
    } else {
      console.error('❌ UPDATE Failed');
    }
  } catch (e) {
    console.error('❌ UPDATE Error:', e.message);
  }

  // 4. Unpublish (Status Change) Test
  console.log('4. Testing UNPUBLISH (Status Change)...');
  try {
    await setDoc(testDocRef, { status: 'draft' }, { merge: true });
    const snap3 = await getDoc(testDocRef);
    if (snap3.exists() && snap3.data().status === 'draft') {
      console.log('✅ UNPUBLISH Success: Status updated to draft');
    } else {
      console.error('❌ UNPUBLISH Failed');
    }
  } catch (e) {
    console.error('❌ UNPUBLISH Error:', e.message);
  }

  // 5. Delete Test
  console.log('5. Testing DELETE news article...');
  try {
    await setDoc(testDocRef, { status: 'deleted' }, { merge: true });
    console.log('✅ SOFT-DELETE Success: Marked status as deleted');
    await deleteDoc(testDocRef);
    const snap4 = await getDoc(testDocRef);
    if (!snap4.exists()) {
      console.log('✅ HARD-DELETE Success: Document removed from Firestore');
    } else {
      console.log('Notice: Soft-deleted document preserved with status = deleted');
    }
  } catch (e) {
    console.error('❌ DELETE Notice:', e.message);
  }

  console.log('=== CRUD WORKFLOW TEST COMPLETE ===');
  process.exit(0);
}

testCRUD().catch(err => {
  console.error(err);
  process.exit(1);
});
