// src/constants.js

export const serverUrl = "http://localhost:8000";
// src/constants.js

// export const serverUrl = "https://gensite-ai.onrender.com";
// constants.js mein sirf ye hona chahiye
export const TEMPLATES_DATA = [
  {
    id: 1,
    name: "Luxury Jewelry Store",
    description: "Premium ecommerce design for high-end jewelry brands.",
    prompt: "Create a modern luxury jewelry ecommerce store with gold and charcoal accents.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070"
  },
  {
    id: 2,
    name: "Global Event Platform",
    description: "Connect and manage events with a sleek dark interface.",
    prompt: "Generate an event management platform with a dark UI and neon purple highlights.",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070"
  },
  {
    id: 3,
    name: "Minimalist Architect Portfolio",
    description: "Clean lines and spacious layouts for design studios.",
    prompt: "A minimalist architect portfolio with focus on large photography and white space.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070"
  },
  {
    id: 4,
    name: "Gourmet Restaurant Menu",
    description: "Elegant dining experience with interactive digital menus.",
    prompt: "A high-end restaurant website with food galleries and table booking system.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070"
  },
  {
    id: 5,
    name: "AI SaaS Landing Page",
    description: "Futuristic design for tech startups and software products.",
    prompt: "A modern SaaS landing page with glassmorphism effects and tech-blue gradients.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070"
  },
  {
    id: 6,
    name: "Fitness & Wellness Club",
    description: "Energetic and motivating layout for gyms and health coaches.",
    prompt: "A fitness club website with class schedules and high-contrast bold typography.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070"
  },
  {
    id: 7,
    name: "Vintage Furniture Shop",
    description: "Warm and cozy ecommerce vibes for interior decor.",
    prompt: "An online store for vintage furniture with warm beige tones and serif fonts.",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070"
  },
  {
    id: 8,
    name: "Travel & Adventure Blog",
    description: "Breathtaking full-screen visuals for travel storytellers.",
    prompt: "A travel blog with immersive map integration and dynamic image grids.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2070"
  },
  {
    id: 9,
    name: "Creative Agency Showcase",
    description: "Bold and colorful portfolio for digital marketing teams.",
    prompt: "A creative agency website with brutalist design elements and animated transitions.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070"
  },
  {
    id: 10,
    name: "Organic Skincare Brand",
    description: "Soft, clean, and eco-friendly aesthetics for beauty brands.",
    prompt: "An organic skincare shop with pastel colors and botanical illustrations.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2070"
  },
  {
    id: 11,
    name: "Cybersecurity Solutions",
    description: "Safe, secure, and data-driven design for IT companies.",
    prompt: "A professional cybersecurity website with dark themes and matrix-style overlays.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070"
  },
  {
    id: 12,
    name: "Modern Real Estate",
    description: "Dynamic property listings with high-res galleries.",
    prompt: "A real estate website with search filters and interactive map views.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2070"
  },
  {
    id: 13,
    name: "Art Gallery & Exhibition",
    description: "Sophisticated and silent design for artists and curators.",
    prompt: "An art gallery website with a minimal grid and high-quality image previews.",
    image: "https://images.unsplash.com/photo-1554188248-986adbb73be4?q=80&w=2070"
  },
  {
    id: 14,
    name: "Fashion Streetwear Hub",
    description: "Edgy and trendy layout for modern clothing brands.",
    prompt: "A streetwear ecommerce brand with urban photography and glitch effects.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"
  },
  {
    id: 15,
    name: "Smart Home Tech",
    description: "Futuristic interface for IoT and smart devices.",
    prompt: "A smart home product page with interactive 3D model placeholders.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070"
  },
  {
    id: 16,
    name: "NGO & Charity Portal",
    description: "Heartwarming and trust-building design for non-profits.",
    prompt: "A charity website with a large donation call-to-action and impact stories.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070"
  },
  {
    id: 17,
    name: "Coffee Shop & Roastery",
    description: "Earthy tones and cozy layouts for local cafes.",
    prompt: "A coffee shop website with rustic textures and an online bean ordering system.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070"
  },
  {
    id: 18,
    name: "Gaming Community Hub",
    description: "Action-packed design for esports and streamers.",
    prompt: "A gaming website with live stream integrations and neon dark UI.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"
  },
  {
    id: 19,
    name: "Digital Marketing Agency",
    description: "Result-oriented layout with case studies and charts.",
    prompt: "A professional marketing agency with data visualization and client logos.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070"
  },
  {
    id: 20,
    name: "Auto Car Dealership",
    description: "High-performance design for luxury car sales.",
    prompt: "A car dealership website with 360 viewer support and dark luxury theme.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070"
  },
  {
    id: 21,
    name: "Law & Legal Services",
    description: "Serious and trustworthy design for law firms.",
    prompt: "A legal services website with navy blue tones and professional profile layouts.",
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070"
  },
  {
    id: 22,
    name: "Music Artist Landing",
    description: "Visual-first design for musicians and band tours.",
    prompt: "A music artist website with Spotify embeds and tour date announcements.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070"
  },
  {
    id: 23,
    name: "Ed-Tech Learning Platform",
    description: "Clean and structured design for online courses.",
    prompt: "A learning management system with course cards and progress tracking UI.",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2070"
  },
  {
    id: 24,
    name: "Pet Grooming & Care",
    description: "Friendly and playful layout for pet service providers.",
    prompt: "A pet grooming website with cute illustrations and booking calendar.",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2070"
  },
  {
    id: 25,
    name: "Finance & Crypto Tracker",
    description: "Modern dashboard style for fintech applications.",
    prompt: "A finance app landing page with live price widgets and dark mode dashboard.",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=2070"
  }
];