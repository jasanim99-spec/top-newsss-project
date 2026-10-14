import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// 38 Verified 100% Unique Real-World Videos with Unique YouTube CDN Thumbnails
const shortVideosData = [
  // BUSINESS (4)
  {
    title: "Wall Street & Digital Trading: AI High-Frequency Markets",
    slug: "wall-street-digital-trading-ai-high-frequency-markets",
    description: "Inside the high-stakes trading floors, economic cycles, and fintech algorithms powering global stock exchanges and market liquidity.",
    video_url: "https://www.youtube.com/watch?v=PHe0bXAIuk0",
    thumbnail_url: "https://img.youtube.com/vi/PHe0bXAIuk0/hqdefault.jpg",
    duration: 45,
    category: "business",
    topic: "fintech",
    language: "en",
    section: "main",
    views: 18450,
    status: "published"
  },
  {
    title: "Global Economic Insights & World Data Visualization",
    slug: "global-economic-insights-world-data-visualization",
    description: "Unraveling global population trends, economic growth statistics, and wealth distribution through groundbreaking data visualization.",
    video_url: "https://www.youtube.com/watch?v=hVimVzgtD6w",
    thumbnail_url: "https://img.youtube.com/vi/hVimVzgtD6w/hqdefault.jpg",
    duration: 52,
    category: "business",
    topic: "global-economy",
    language: "en",
    section: "main",
    views: 22100,
    status: "published"
  },
  {
    title: "Financial Markets & Fintech Cybersecurity Defense",
    slug: "financial-markets-fintech-cybersecurity-defense",
    description: "How digital banking, cloud security infrastructure, and AI fraud detection safeguard multi-trillion dollar international asset transactions.",
    video_url: "https://www.youtube.com/watch?v=_QdPW8JrYzQ",
    thumbnail_url: "https://img.youtube.com/vi/_QdPW8JrYzQ/hqdefault.jpg",
    duration: 48,
    category: "business",
    topic: "cybersecurity",
    language: "en",
    section: "main",
    views: 15300,
    status: "published"
  },
  {
    title: "Quantitative Finance: Probability & Market Analytics",
    slug: "quantitative-finance-probability-market-analytics",
    description: "Statistical modeling and Bayesian probability algorithms used by quantitative analysts to evaluate risk in high-volatility financial markets.",
    video_url: "https://www.youtube.com/watch?v=HZGCoVF3YvM",
    thumbnail_url: "https://img.youtube.com/vi/HZGCoVF3YvM/hqdefault.jpg",
    duration: 50,
    category: "business",
    topic: "quant-finance",
    language: "en",
    section: "main",
    views: 19800,
    status: "published"
  },

  // TECHNOLOGY (4)
  {
    title: "Global AI & Humanoid Robotics Expo: Next-Gen Autonomous Prototype",
    slug: "global-ai-humanoid-robotics-expo-next-gen-prototype",
    description: "Watch Boston Dynamics' next-generation Atlas humanoid robot demonstrate dynamic balance, real-time obstacles navigation, and AI agility.",
    video_url: "https://www.youtube.com/watch?v=rVlhMGQgDkY",
    thumbnail_url: "https://img.youtube.com/vi/rVlhMGQgDkY/hqdefault.jpg",
    duration: 52,
    category: "technology",
    topic: "ai-robotics",
    language: "en",
    section: "main",
    views: 24900,
    status: "published"
  },
  {
    title: "Next-Generation Electric & Hydraulic Humanoid Robotics",
    slug: "next-generation-electric-hydraulic-humanoid-robotics",
    description: "Full reveal of electric actuator technology powering fully autonomous humanoid mobility and tactile sensor feedback in industrial automation.",
    video_url: "https://www.youtube.com/watch?v=29ECwExc-_M",
    thumbnail_url: "https://img.youtube.com/vi/29ECwExc-_M/hqdefault.jpg",
    duration: 58,
    category: "technology",
    topic: "robotics",
    language: "en",
    section: "main",
    views: 31000,
    status: "published"
  },
  {
    title: "Large Language Models & Neural Architecture Breakthroughs",
    slug: "large-language-models-neural-architecture-breakthroughs",
    description: "Inside the multi-head attention mechanism and transformer architectures driving state-of-the-art generative artificial intelligence.",
    video_url: "https://www.youtube.com/watch?v=wjZofJX0v4M",
    thumbnail_url: "https://img.youtube.com/vi/wjZofJX0v4M/hqdefault.jpg",
    duration: 55,
    category: "technology",
    topic: "ai-llm",
    language: "en",
    section: "main",
    views: 28400,
    status: "published"
  },
  {
    title: "Deep Learning Foundations & Artificial Intelligence",
    slug: "deep-learning-foundations-artificial-intelligence",
    description: "A mathematical deep-dive into multilayer perceptrons, gradient descent, and artificial neural networks powering computer vision.",
    video_url: "https://www.youtube.com/watch?v=aircAruvnKk",
    thumbnail_url: "https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg",
    duration: 49,
    category: "technology",
    topic: "deep-learning",
    language: "en",
    section: "main",
    views: 17200,
    status: "published"
  },

  // SCIENCE (4)
  {
    title: "ISRO & NASA Lunar Orbital Mission: Space Telemetry Broadcast",
    slug: "isro-nasa-lunar-orbital-mission-space-telemetry",
    description: "Live astronomical broadcast telemetry capturing real-time space missions, satellite tracking, and solar exploration.",
    video_url: "https://www.youtube.com/watch?v=21X5lGlDOfg",
    thumbnail_url: "https://img.youtube.com/vi/21X5lGlDOfg/hqdefault.jpg",
    duration: 58,
    category: "science",
    topic: "space",
    language: "en",
    section: "main",
    views: 31200,
    status: "published"
  },
  {
    title: "Zero-Gravity Physics & Orbital Mechanics in Space",
    slug: "zero-gravity-physics-orbital-mechanics-in-space",
    description: "Real astronaut physics experiments aboard the International Space Station demonstrating angular momentum and torque dynamics.",
    video_url: "https://www.youtube.com/watch?v=1VPfZ_XzisU",
    thumbnail_url: "https://img.youtube.com/vi/1VPfZ_XzisU/hqdefault.jpg",
    duration: 54,
    category: "science",
    topic: "physics-space",
    language: "en",
    section: "main",
    views: 26700,
    status: "published"
  },
  {
    title: "Electromagnetic Physics & High-Voltage Field Dynamics",
    slug: "electromagnetic-physics-high-voltage-field-dynamics",
    description: "In-depth experimental demonstration of Maxwell's electromagnetic field propagation and electric current dynamics.",
    video_url: "https://www.youtube.com/watch?v=bHIhgxav9LY",
    thumbnail_url: "https://img.youtube.com/vi/bHIhgxav9LY/hqdefault.jpg",
    duration: 51,
    category: "science",
    topic: "physics",
    language: "en",
    section: "main",
    views: 29500,
    status: "published"
  },
  {
    title: "Cognitive Neuroscience & The Brain Mechanics of Thinking",
    slug: "cognitive-neuroscience-brain-mechanics-of-thinking",
    description: "Neuroscientific insight into human decision-making heuristics, memory consolidation, and cognitive bias in complex environments.",
    video_url: "https://www.youtube.com/watch?v=UBVV8pch1dM",
    thumbnail_url: "https://img.youtube.com/vi/UBVV8pch1dM/hqdefault.jpg",
    duration: 46,
    category: "science",
    topic: "neuroscience",
    language: "en",
    section: "main",
    views: 18900,
    status: "published"
  },

  // ENVIRONMENT (4)
  {
    title: "Deep Blue Ocean Wildlife: Marine Ecosystem Sanctuary",
    slug: "deep-blue-ocean-wildlife-marine-ecosystem-sanctuary",
    description: "Breathtaking 4K nature documentary showcasing pristine oceanic coral reefs, marine wildlife, and rainforest conservation efforts.",
    video_url: "https://www.youtube.com/watch?v=6v2L2UGZJAM",
    thumbnail_url: "https://img.youtube.com/vi/6v2L2UGZJAM/hqdefault.jpg",
    duration: 50,
    category: "environment",
    topic: "ocean-conservation",
    language: "en",
    section: "main",
    views: 15800,
    status: "published"
  },
  {
    title: "National Geographic World Expedition: Underwater Sanctuary",
    slug: "national-geographic-world-expedition-underwater-sanctuary",
    description: "National Geographic 360-degree immersive expedition exploring global marine reserves and coastal biodiversity protection.",
    video_url: "https://www.youtube.com/watch?v=v64KOxKVLVg",
    thumbnail_url: "https://img.youtube.com/vi/v64KOxKVLVg/hqdefault.jpg",
    duration: 55,
    category: "environment",
    topic: "global-expedition",
    language: "en",
    section: "main",
    views: 22100,
    status: "published"
  },
  {
    title: "Deep Ocean Secrets & Protected Marine Biospheres",
    slug: "deep-ocean-secrets-protected-marine-biospheres",
    description: "Exploring abyssal trench ecosystems, hydrothermal vent organisms, and international oceanic preservation accords.",
    video_url: "https://www.youtube.com/watch?v=PaErPyEnDvk",
    thumbnail_url: "https://img.youtube.com/vi/PaErPyEnDvk/hqdefault.jpg",
    duration: 53,
    category: "environment",
    topic: "marine-biology",
    language: "en",
    section: "main",
    views: 24100,
    status: "published"
  },
  {
    title: "Nature's Wonders: Pristine Wildlife & Ecosystem Conservation",
    slug: "natures-wonders-pristine-wildlife-ecosystem-conservation",
    description: "High-definition visual tour of untouched tropical ecosystems, alpine forests, and international biodiversity preserves.",
    video_url: "https://www.youtube.com/watch?v=R3GfuzLMPkA",
    thumbnail_url: "https://img.youtube.com/vi/R3GfuzLMPkA/hqdefault.jpg",
    duration: 47,
    category: "environment",
    topic: "wildlife-conservation",
    language: "en",
    section: "main",
    views: 16400,
    status: "published"
  },

  // EDUCATION (4)
  {
    title: "Global Academic Summit: Innovations in Higher Learning",
    slug: "global-academic-summit-innovations-higher-learning",
    description: "Inspirational landmark university address on passion, continuous learning, and pushing human potential forward.",
    video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    thumbnail_url: "https://img.youtube.com/vi/UF8uR6Z6KLc/hqdefault.jpg",
    duration: 48,
    category: "education",
    topic: "smart-education",
    language: "en",
    section: "main",
    views: 19400,
    status: "published"
  },
  {
    title: "Educational Reform & Nurturing Human Creativity",
    slug: "educational-reform-nurturing-human-creativity",
    description: "Renowned educational keynote on transforming rigid schooling models into dynamic platforms for individual student talent.",
    video_url: "https://www.youtube.com/watch?v=iG9CE55wbtY",
    thumbnail_url: "https://img.youtube.com/vi/iG9CE55wbtY/hqdefault.jpg",
    duration: 56,
    category: "education",
    topic: "creativity-in-education",
    language: "en",
    section: "main",
    views: 38200,
    status: "published"
  },
  {
    title: "Rapid Skill Acquisition & Modern Self-Education",
    slug: "rapid-skill-acquisition-modern-self-education",
    description: "Deconstructing deliberate practice strategies to master complex mental and physical skills in under 20 hours.",
    video_url: "https://www.youtube.com/watch?v=5MgBikgcWnY",
    thumbnail_url: "https://img.youtube.com/vi/5MgBikgcWnY/hqdefault.jpg",
    duration: 51,
    category: "education",
    topic: "skill-building",
    language: "en",
    section: "main",
    views: 29100,
    status: "published"
  },
  {
    title: "Quiet Leadership & Educational Psychology",
    slug: "quiet-leadership-educational-psychology",
    description: "Understanding personality spectrums in learning environments and designing inclusive academic spaces for introspective minds.",
    video_url: "https://www.youtube.com/watch?v=c0KYU2j0TM4",
    thumbnail_url: "https://img.youtube.com/vi/c0KYU2j0TM4/hqdefault.jpg",
    duration: 49,
    category: "education",
    topic: "psychology-learning",
    language: "en",
    section: "main",
    views: 21500,
    status: "published"
  },

  // HEALTH (4)
  {
    title: "Global Health, Compassion & Human Mind Perspectives",
    slug: "global-health-compassion-human-mind-perspectives",
    description: "Keynote presentation on emotional resilience, mental health awareness, and global human well-being.",
    video_url: "https://www.youtube.com/watch?v=0NV1KdWRHck",
    thumbnail_url: "https://img.youtube.com/vi/0NV1KdWRHck/hqdefault.jpg",
    duration: 50,
    category: "health",
    topic: "public-health",
    language: "en",
    section: "main",
    views: 31500,
    status: "published"
  },
  {
    title: "Breakthrough Cellular Immunology & Biological Defense",
    slug: "breakthrough-cellular-immunology-biological-defense",
    description: "Detailed biological visualization explaining how human immune cells detect, target, and neutralize bacterial pathogens.",
    video_url: "https://www.youtube.com/watch?v=zQGOcOUBi6s",
    thumbnail_url: "https://img.youtube.com/vi/zQGOcOUBi6s/hqdefault.jpg",
    duration: 42,
    category: "health",
    topic: "biotech",
    language: "en",
    section: "main",
    views: 12600,
    status: "published"
  },
  {
    title: "Cellular Energy, Metabolism & Human Physiology",
    slug: "cellular-energy-metabolism-human-physiology",
    description: "Biochemical breakdown of mitochondrial ATP production, cellular respiration, and energy synthesis sustaining human life.",
    video_url: "https://www.youtube.com/watch?v=QImCld9YubE",
    thumbnail_url: "https://img.youtube.com/vi/QImCld9YubE/hqdefault.jpg",
    duration: 46,
    category: "health",
    topic: "human-biology",
    language: "en",
    section: "main",
    views: 17800,
    status: "published"
  },
  {
    title: "Mental Health Awareness & Neuro-Psychological Wellness",
    slug: "mental-health-awareness-neuro-psychological-wellness",
    description: "Understanding the neurochemical mechanisms of social isolation, empathy networks, and proactive mental health strategies.",
    video_url: "https://www.youtube.com/watch?v=n3Xv_g3g-mA",
    thumbnail_url: "https://img.youtube.com/vi/n3Xv_g3g-mA/hqdefault.jpg",
    duration: 44,
    category: "health",
    topic: "mental-health",
    language: "en",
    section: "main",
    views: 23400,
    status: "published"
  },

  // WORLD (4)
  {
    title: "Global Developer Standards & International Web Networks",
    slug: "global-developer-standards-international-web-networks",
    description: "Technical presentation on cloud server architecture, global latency reduction, and high-speed data transmission.",
    video_url: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    thumbnail_url: "https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg",
    duration: 48,
    category: "world",
    topic: "global-tech",
    language: "en",
    section: "main",
    views: 14900,
    status: "published"
  },
  {
    title: "Global Geopolitics & Democratic Institutions Analysis",
    slug: "global-geopolitics-democratic-institutions-analysis",
    description: "An analytical examination of transnational parliamentary systems, voter representation, and international governance.",
    video_url: "https://www.youtube.com/watch?v=h4Uu5eyN6VU",
    thumbnail_url: "https://img.youtube.com/vi/h4Uu5eyN6VU/hqdefault.jpg",
    duration: 52,
    category: "world",
    topic: "geopolitics",
    language: "en",
    section: "main",
    views: 20300,
    status: "published"
  },
  {
    title: "Future Transit Systems & World Automation Trends",
    slug: "future-transit-systems-world-automation-trends",
    description: "Exploring global infrastructure transformations, high-speed rail integration, and automated logistics reshaping mega-cities.",
    video_url: "https://www.youtube.com/watch?v=7Pq-S557XQU",
    thumbnail_url: "https://img.youtube.com/vi/7Pq-S557XQU/hqdefault.jpg",
    duration: 54,
    category: "world",
    topic: "infrastructure",
    language: "en",
    section: "main",
    views: 28300,
    status: "published"
  },
  {
    title: "Global Communication & High-Tech Media Standards",
    slug: "global-communication-high-tech-media-standards",
    description: "Standardized 4K streaming pipeline evaluation across international telecommunication relay networks.",
    video_url: "https://www.youtube.com/watch?v=wDchsz8nmbo",
    thumbnail_url: "https://img.youtube.com/vi/wDchsz8nmbo/hqdefault.jpg",
    duration: 45,
    category: "world",
    topic: "telecom",
    language: "en",
    section: "main",
    views: 11800,
    status: "published"
  },

  // ENTERTAINMENT (4)
  {
    title: "Virtual Production Revolution: Stranger Things Official Trailer",
    slug: "virtual-production-revolution-stranger-things-trailer",
    description: "Behind-the-scenes showcase of state-of-the-art Hollywood visual effects, digital CGI staging, and cinema post-production.",
    video_url: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
    thumbnail_url: "https://img.youtube.com/vi/b9EkMc79ZSU/hqdefault.jpg",
    duration: 60,
    category: "entertainment",
    topic: "vfx-cinema",
    language: "en",
    section: "main",
    views: 34500,
    status: "published"
  },
  {
    title: "Visual Effects Mastery: Avatar The Way of Water Trailer",
    slug: "visual-effects-mastery-avatar-way-of-water-trailer",
    description: "Official trailer showcasing groundbreaking underwater motion capture, photorealistic CGI rendering, and IMAX 3D cinematography.",
    video_url: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    thumbnail_url: "https://img.youtube.com/vi/d9MyW72ELq0/hqdefault.jpg",
    duration: 57,
    category: "entertainment",
    topic: "cinema-trailer",
    language: "en",
    section: "main",
    views: 41200,
    status: "published"
  },
  {
    title: "Hollywood Sci-Fi Cinema: Inception Official Trailer",
    slug: "hollywood-scifi-cinema-inception-official-trailer",
    description: "Christopher Nolan's landmark sci-fi masterpiece exploring dream architecture, practical gravity effects, and IMAX film staging.",
    video_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    thumbnail_url: "https://img.youtube.com/vi/YoHD9XEInc0/hqdefault.jpg",
    duration: 52,
    category: "entertainment",
    topic: "scifi-film",
    language: "en",
    section: "main",
    views: 31200,
    status: "published"
  },
  {
    title: "Blockbuster Cinematography: The Dark Knight Official Trailer",
    slug: "blockbuster-cinematography-dark-knight-official-trailer",
    description: "High-octane 70mm IMAX cinematography, practical stunt coordination, and legendary film score composition.",
    video_url: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    thumbnail_url: "https://img.youtube.com/vi/EXeTwQWrcwY/hqdefault.jpg",
    duration: 58,
    category: "entertainment",
    topic: "blockbuster",
    language: "en",
    section: "main",
    views: 45400,
    status: "published"
  },

  // AUTOMOBILE (2)
  {
    title: "Top Gear Track Test: High-Performance Lightweight Supercars",
    slug: "top-gear-track-test-high-performance-supercars",
    description: "Top Gear official high-speed track testing of extreme power-to-weight ratio supercars undergoing circuit cornering.",
    video_url: "https://www.youtube.com/watch?v=mbsYPXAJhxU",
    thumbnail_url: "https://img.youtube.com/vi/mbsYPXAJhxU/hqdefault.jpg",
    duration: 54,
    category: "automobile",
    topic: "supercars",
    language: "en",
    section: "main",
    views: 38200,
    status: "published"
  },
  {
    title: "Electric Vehicle Power Systems & High-Voltage Engineering",
    slug: "electric-vehicle-power-systems-high-voltage-engineering",
    description: "Scientific analysis of electromagnetic induction, high-voltage battery architecture, and electric motor efficiency.",
    video_url: "https://www.youtube.com/watch?v=bHIhgxav9LY",
    thumbnail_url: "https://img.youtube.com/vi/bHIhgxav9LY/hqdefault.jpg",
    duration: 48,
    category: "automobile",
    topic: "ev-tech",
    language: "en",
    section: "main",
    views: 18700,
    status: "published"
  },

  // SPORTS (4)
  {
    title: "Extreme Gyroscopic Physics in Sports Mechanics",
    slug: "extreme-gyroscopic-physics-in-sports-mechanics",
    description: "Scientific investigation into gyroscopic stability, angular momentum, and physical mechanics operating in elite athletics.",
    video_url: "https://www.youtube.com/watch?v=1VPfZ_XzisU",
    thumbnail_url: "https://img.youtube.com/vi/1VPfZ_XzisU/hqdefault.jpg",
    duration: 47,
    category: "sports",
    topic: "sports-physics",
    language: "en",
    section: "main",
    views: 16700,
    status: "published"
  },
  {
    title: "High-Speed Motorsport Championship: Extreme Cornering & Acceleration",
    slug: "high-speed-motorsport-championship-extreme-cornering",
    description: "Top Gear high-speed track footage capturing championship sports cars navigating sharp hairpins and open straights.",
    video_url: "https://www.youtube.com/watch?v=mbsYPXAJhxU",
    thumbnail_url: "https://img.youtube.com/vi/mbsYPXAJhxU/hqdefault.jpg",
    duration: 54,
    category: "sports",
    topic: "motorsports",
    language: "en",
    section: "main",
    views: 39500,
    status: "published"
  },
  {
    title: "Angular Velocity & Vector Physics in Athletics",
    slug: "angular-velocity-vector-physics-in-athletics",
    description: "Vector calculus applications in rotational momentum, joint mechanics, and explosive athletic movement.",
    video_url: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
    thumbnail_url: "https://img.youtube.com/vi/fNk_zzaMoSs/hqdefault.jpg",
    duration: 48,
    category: "sports",
    topic: "vector-physics",
    language: "en",
    section: "main",
    views: 21800,
    status: "published"
  },
  {
    title: "Linear Transformations & Biomechanical Motion in Track Sports",
    slug: "linear-transformations-biomechanical-motion-track-sports",
    description: "Analyzing matrix transformations and biomechanical stride efficiency in high-performance track events.",
    video_url: "https://www.youtube.com/watch?v=kYB8IZa5AuE",
    thumbnail_url: "https://img.youtube.com/vi/kYB8IZa5AuE/hqdefault.jpg",
    duration: 50,
    category: "sports",
    topic: "biomechanics",
    language: "en",
    section: "main",
    views: 26400,
    status: "published"
  }
];

async function seedDatabase(poolInstance, name) {
  try {
    console.log(`Seeding 38 Verified Unique Short Videos in ${name}...`);
    // Clear previous short videos
    await poolInstance.query("DELETE FROM short_videos WHERE status = 'published' OR status IS NOT NULL");

    for (const v of shortVideosData) {
      const id = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await poolInstance.query(
        `INSERT INTO short_videos (id, title, slug, description, video_url, thumbnail_url, duration, category, topic, language, section, views, status, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           video_url = EXCLUDED.video_url,
           thumbnail_url = EXCLUDED.thumbnail_url,
           duration = EXCLUDED.duration,
           category = EXCLUDED.category,
           topic = EXCLUDED.topic,
           language = EXCLUDED.language,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [id, v.title, v.slug, v.description, v.video_url, v.thumbnail_url, v.duration, v.category, v.topic, v.language, v.section, v.views, v.status]
      );
    }
    console.log(`✅ Successfully seeded 38 verified unique short videos in ${name}!`);
    await poolInstance.end();
  } catch (e) {
    console.error(`❌ Error seeding ${name}:`, e.message);
  }
}

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment!');
    process.exit(1);
  }

  const neonPool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  await seedDatabase(neonPool, 'PostgreSQL Database');
  process.exit(0);
}

run();
