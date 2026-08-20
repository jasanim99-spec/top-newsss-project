import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

const newsArticles = [
  {
    title: "AI Breakthrough: Next-Gen Language Models Redefine Reasoning",
    slug: "ai-breakthrough-next-gen-language-models-redefine-reasoning",
    description: "Researchers announce a major breakthrough in artificial intelligence systems that can solve complex logic puzzles and math equations.",
    content: "Artificial intelligence research labs have announced a significant milestone in machine learning capabilities. The new class of language models incorporates advanced reinforcement learning techniques, allowing them to reason step-by-step before answering. Early benchmarks show an unprecedented 95% accuracy in complex logical reasoning tests.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    category: "technology",
    topic: "ai",
    language: "en",
    section: "main",
    keywords: ["ai", "technology", "machine learning"],
    tags: ["tech", "ai", "innovation"],
    views: 1200,
    status: "published"
  },
  {
    title: "Global Stock Markets Rally Amidst Interest Rate Cuts",
    slug: "global-stock-markets-rally-amidst-interest-rate-cuts",
    description: "Financial markets worldwide reacted positively as central banks announced a series of interest rate adjustments to spur economic growth.",
    content: "Investors around the world breathed a sigh of relief today as major central banks coordinated a 0.25% interest rate reduction. The index saw a 2% gain in early trading, led by technology and industrial sectors. Analysts project a steady recovery phase over the next two quarters.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    category: "business",
    topic: "markets",
    language: "en",
    section: "main",
    keywords: ["finance", "stocks", "economy"],
    tags: ["business", "markets", "stocks"],
    views: 950,
    status: "published"
  },
  {
    title: "Championship Finals: Underdog Team Pulls Off Historic Victory",
    slug: "championship-finals-underdog-team-pulls-off-historic-victory",
    description: "In a stunning display of skill and teamwork, the underdogs defeated the reigning champions in a nail-biting final match.",
    content: "The sports world witnessed one of the greatest upsets in modern history last night. Down by three points in the final minutes, the underdogs staged an unbelievable comeback to secure the trophy. Fans celebrated in the streets as the final whistle blew.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    category: "sports",
    topic: "championship",
    language: "en",
    section: "main",
    keywords: ["sports", "victory", "championship"],
    tags: ["sports", "game", "champions"],
    views: 2400,
    status: "published"
  },
  {
    title: "Global Climate Summit Reaches Landmark Accord on Green Energy",
    slug: "global-climate-summit-reaches-landmark-accord-on-green-energy",
    description: "Representatives from over 190 nations have agreed on a binding resolution to accelerate the transition to sustainable energy sources.",
    content: "The global climate summit concluded today with a historic agreement. Participating nations committed to tripling their renewable energy capacity by 2030. The agreement also details a new fund to support developing nations in building green infrastructure.",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    category: "world",
    topic: "climate",
    language: "en",
    section: "main",
    keywords: ["climate", "environment", "world"],
    tags: ["world", "climate", "green-energy"],
    views: 1800,
    status: "published"
  },
  {
    title: "Breakthrough Cancer Treatment Shows Promising Clinical Trial Results",
    slug: "breakthrough-cancer-treatment-shows-promising-clinical-trial-results",
    description: "A new targeted gene therapy has successfully eradicated tumor cells in initial patient test groups, offering fresh hope.",
    content: "Researchers at the Oncology Institute have published outstanding results from their phase-1 clinical trials. The new therapy works by training the patient's own immune cells to target a specific protein found only on tumor surfaces, leaving healthy cells untouched.",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80",
    category: "health",
    topic: "research",
    language: "en",
    section: "main",
    keywords: ["health", "medicine", "science"],
    tags: ["health", "science", "medical-breakthrough"],
    views: 1500,
    status: "published"
  },
  {
    title: "Annual Film Festival Showcases Diverse Cinematic Achievements",
    slug: "annual-film-festival-showcases-diverse-cinematic-achievements",
    description: "The highly anticipated international film festival kicked off yesterday, featuring outstanding independent movies.",
    content: "Cinema lovers have gathered for the annual international film festival. Over 100 films from 45 countries will be screened this week. The opening night film, a poignant drama about family ties, received a five-minute standing ovation.",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    category: "entertainment",
    topic: "movies",
    language: "en",
    section: "main",
    keywords: ["movies", "festival", "cinema"],
    tags: ["entertainment", "movies", "culture"],
    views: 800,
    status: "published"
  },
  {
    title: "Why Democratic Institutions Must Adapt to the Digital Era",
    slug: "why-democratic-institutions-must-adapt-to-the-digital-era",
    description: "An in-depth analysis of how online algorithms are reshaping public debates and why electoral policies must evolve.",
    content: "As digital communications continue to dominate civic life, the foundations of democratic discourse are undergoing rapid transformations. To protect the integrity of public debate, policymakers must enact regulations addressing algorithmic transparency and data privacy.",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    category: "politics",
    topic: "democracy",
    language: "en",
    section: "main",
    keywords: ["politics", "democracy", "opinion"],
    tags: ["politics", "opinion", "democracy"],
    views: 700,
    status: "published"
  },
  {
    title: "The Importance of Mindfulness in a High-Speed Workplace",
    slug: "the-importance-of-mindfulness-in-a-high-speed-workplace",
    description: "Understanding how regular mental breaks and focused breathing exercises can prevent professional burnout.",
    content: "In modern fast-paced corporate environments, mental health challenges are on the rise. Wellness experts suggest that practicing mindfulness for just ten minutes a day can reduce stress hormones, improve focus, and boost long-term career satisfaction.",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    category: "opinion",
    topic: "mindfulness",
    language: "en",
    section: "main",
    keywords: ["opinion", "mindfulness", "burnout"],
    tags: ["opinion", "wellness", "mindfulness"],
    views: 600,
    status: "published"
  },
  {
    title: "Tech Giants Announce Unified Smart Home Communication Protocol",
    slug: "tech-giants-announce-unified-smart-home-communication-protocol",
    description: "Leading tech firms collaborate to establish a shared standard for smart devices.",
    content: "In a rare show of unity, the world's top technology corporations have announced a joint standard for smart home devices, allowing different ecosystems to interact seamlessly.",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    category: "technology",
    topic: "smarthome",
    language: "en",
    section: "sidebar",
    keywords: ["smarthome", "tech", "iot"],
    tags: ["tech", "iot"],
    views: 3100,
    status: "published"
  },
  {
    title: "Electric Vehicle Battery Range Increases by 40% in New Test",
    slug: "electric-vehicle-battery-range-increases-by-40-in-new-test",
    description: "New solid-state battery technology sets range records.",
    content: "A startup developing solid-state batteries has demonstrated a prototype vehicle achieving a 40% increase in driving range compared to current lithium-ion models.",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    category: "technology",
    topic: "ev",
    language: "en",
    section: "widget",
    keywords: ["ev", "technology", "battery"],
    tags: ["tech", "automobiles", "ev"],
    views: 2900,
    status: "published"
  }
];

const shortVideos = [
  {
    title: "Exploring the Space Station",
    slug: "exploring-the-space-station",
    description: "Take a 60-second tour inside the International Space Station with astronauts.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    duration: 60,
    category: "technology",
    topic: "space",
    language: "en",
    section: "main",
    keywords: ["space", "nasa", "iss"],
    tags: ["space", "science"],
    views: 5000,
    status: "published"
  },
  {
    title: "How to Make the Perfect Espresso",
    slug: "how-to-make-the-perfect-espresso",
    description: "Learn the art of pulling a perfect espresso shot in under a minute.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    duration: 45,
    category: "lifestyle",
    topic: "coffee",
    language: "en",
    section: "main",
    keywords: ["coffee", "lifestyle", "espresso"],
    tags: ["coffee", "lifestyle"],
    views: 3200,
    status: "published"
  }
];

async function seedFirestore() {
  console.log("Authenticating as admin...");
  const cred = await signInWithEmailAndPassword(auth, "admin@topnews.com", "admin123456");
  console.log("Authenticated UID:", cred.user.uid);

  console.log("Seeding News articles to Firestore...");
  const newsCol = collection(db, "news");
  for (const article of newsArticles) {
    await addDoc(newsCol, {
      ...article,
      publishedAt: new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  console.log(`Successfully seeded ${newsArticles.length} News articles to Firestore!`);

  console.log("Seeding Short Videos to Firestore...");
  const videoCol = collection(db, "videos");
  for (const video of shortVideos) {
    await addDoc(videoCol, {
      ...video,
      publishedAt: new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  console.log(`Successfully seeded ${shortVideos.length} Short Videos to Firestore!`);

  process.exit(0);
}

seedFirestore().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
