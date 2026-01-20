export const sectors = [
  'Construction',
  'HVAC',
  'Interior Design',
  'Machinery',
  'Building Materials',
  'Steel & Metal',
  'Architecture',
  'Technology',
  'Energy Solutions',
  'Sustainability'
]

export const countries = [
  'Libya',
  'Egypt',
  'Tunisia',
  'United Arab Emirates',
  'Turkey',
  'Italy',
  'Germany',
  'China',
  'United States',
  'United Kingdom'
]

export const heroBanners = [
  {
    id: 1,
    title: "Meet the Exhibitors",
    subtitle: "Explore over 300 exhibitors at Libya Build Benghazi from over 15 countries.",
    image: "/media/App Banner 1 - EN.jpg",
    link: "/exhibitors",
    category: "Exhibitors",
    priority: 1
  },
  {
    id: 2,
    title: "Conference Agenda",
    subtitle: "Explore expert-led sessions and panel talks designed to shape the future of construction and infrastructure in Libya.",
    image: "/media/App Banner 2 - EN.jpg",
    link: "/schedule",
    category: "Conference",
    priority: 2
  },
  {
    id: 3,
    title: "Schedule your meetings",
    subtitle: "Connect with exhibitors, brands, and decision-makers before and during the event and lock in your key meetings early.",
    image: "/media/App Banner 3 - EN.jpg",
    link: "/meetings",
    category: "Networking",
    priority: 3
  }
]

export const promotionalBanners = [
  {
    id: 1,
    exhibitorId: 1,
    title: "Featured: BuildTech Solutions",
    description: "Exclusive 24-hour showcase",
    image: "https://via.placeholder.com/800x200/2264dc/ffffff?text=BuildTech+Solutions",
    tier: "premium",
    expiresAt: "2026-03-16T23:59:59",
    price: 500
  }
]

export const exhibitors = [
  {
    id: 1,
    name: "BuildTech Solutions",
    category: "Construction Equipment",
    sector: "Construction",
    country: "Libya",
    booth: "A-101",
    hall: "Hall A",
    description: "Leading provider of innovative construction equipment and solutions for modern building projects.",
    contact: {
      email: "info@buildtech.ly",
      phone: "+218 21 123 4567",
      website: "www.buildtech.ly"
    },
    logo: "https://via.placeholder.com/150/dc3b26/ffffff?text=BT",
    tags: ["Equipment", "Innovation", "Machinery"],
    coordinates: { x: 120, y: 80 },
    promotionTier: "premium"
  },
  {
    id: 2,
    name: "Libyan Cement Co.",
    category: "Building Materials",
    sector: "Building Materials",
    country: "Libya",
    booth: "B-205",
    hall: "Hall B",
    description: "Premium cement and building materials manufacturer serving Libya since 1975.",
    contact: {
      email: "sales@libyancement.ly",
      phone: "+218 21 234 5678",
      website: "www.libyancement.ly"
    },
    logo: "https://via.placeholder.com/150/22c55e/ffffff?text=LC",
    tags: ["Materials", "Cement", "Sustainability"],
    coordinates: { x: 320, y: 180 },
    promotionTier: "standard"
  },
  {
    id: 3,
    name: "Smart Home Systems",
    category: "Technology",
    sector: "Technology",
    country: "United Arab Emirates",
    booth: "C-310",
    hall: "Hall C",
    description: "Cutting-edge smart home automation and IoT solutions for modern buildings.",
    contact: {
      email: "contact@smarthome.ly",
      phone: "+218 21 345 6789",
      website: "www.smarthome.ly"
    },
    logo: "https://via.placeholder.com/150/3b82f6/ffffff?text=SH",
    tags: ["Technology", "IoT", "Automation"],
    coordinates: { x: 520, y: 120 },
    promotionTier: "standard"
  },
  {
    id: 4,
    name: "Tripoli Steel Industries",
    category: "Steel & Metal",
    sector: "Steel & Metal",
    country: "Libya",
    booth: "A-150",
    hall: "Hall A",
    description: "High-quality structural steel and metal products for construction projects.",
    contact: {
      email: "info@tripolisteel.ly",
      phone: "+218 21 456 7890",
      website: "www.tripolisteel.ly"
    },
    logo: "https://via.placeholder.com/150/64748b/ffffff?text=TS",
    tags: ["Steel", "Manufacturing", "Quality"],
    coordinates: { x: 220, y: 150 },
    promotionTier: "standard"
  },
  {
    id: 5,
    name: "EcoGreen Architecture",
    category: "Architecture & Design",
    sector: "Architecture",
    country: "Italy",
    booth: "D-401",
    hall: "Hall D",
    description: "Sustainable architecture and green building design consultancy.",
    contact: {
      email: "hello@ecogreen.ly",
      phone: "+218 21 567 8901",
      website: "www.ecogreen.ly"
    },
    logo: "https://via.placeholder.com/150/10b981/ffffff?text=EG",
    tags: ["Architecture", "Sustainability", "Design"],
    coordinates: { x: 720, y: 250 },
    promotionTier: "standard"
  },
  {
    id: 6,
    name: "PowerGen Libya",
    category: "Energy Solutions",
    sector: "Energy Solutions",
    country: "Turkey",
    booth: "B-220",
    hall: "Hall B",
    description: "Renewable energy solutions and power generation systems.",
    contact: {
      email: "info@powergen.ly",
      phone: "+218 21 678 9012",
      website: "www.powergen.ly"
    },
    logo: "https://via.placeholder.com/150/f59e0b/ffffff?text=PG",
    tags: ["Energy", "Solar", "Renewable"],
    coordinates: { x: 420, y: 210 },
    promotionTier: "standard"
  },
  {
    id: 7,
    name: "MegaBuild Egypt",
    category: "Construction Equipment",
    sector: "Construction",
    country: "Egypt",
    booth: "A-120",
    hall: "Hall A",
    description: "Leading Egyptian construction equipment supplier with 30 years of experience.",
    contact: {
      email: "info@megabuild.eg",
      phone: "+20 2 234 5678",
      website: "www.megabuild.eg"
    },
    logo: "https://via.placeholder.com/150/f59e0b/ffffff?text=MB",
    tags: ["Equipment", "Construction", "Import"],
    coordinates: { x: 180, y: 100 },
    promotionTier: "standard"
  },
  {
    id: 8,
    name: "AirFlow HVAC Systems",
    category: "HVAC",
    sector: "HVAC",
    country: "Germany",
    booth: "C-215",
    hall: "Hall C",
    description: "Premium HVAC solutions for commercial and residential projects.",
    contact: {
      email: "contact@airflow.de",
      phone: "+49 30 456 7890",
      website: "www.airflow.de"
    },
    logo: "https://via.placeholder.com/150/3b82f6/ffffff?text=AF",
    tags: ["HVAC", "Climate Control", "Energy Efficient"],
    coordinates: { x: 450, y: 140 },
    promotionTier: "standard"
  }
]

export const speakers = [
  {
    id: 1,
    name: "Dr. Ahmed Mansour",
    title: "Chief Architect",
    company: "National Construction Authority",
    bio: "Renowned architect with 25+ years of experience in sustainable urban development and infrastructure planning.",
    photo: "https://via.placeholder.com/200/dc3b26/ffffff?text=AM",
    sessions: [1, 2],
    expertise: ["Urban Planning", "Sustainability", "Infrastructure"],
    social: {
      linkedin: "linkedin.com/in/ahmedmansour",
      twitter: "@ahmedmansour"
    }
  },
  {
    id: 2,
    name: "Eng. Fatima Al-Sharif",
    title: "CEO",
    company: "BuildTech Solutions",
    bio: "Innovation leader in construction technology and smart building solutions.",
    photo: "https://via.placeholder.com/200/22c55e/ffffff?text=FA",
    sessions: [3, 5],
    expertise: ["Construction Tech", "Innovation", "Smart Buildings"],
    social: {
      linkedin: "linkedin.com/in/fatimaalsharif"
    }
  },
  {
    id: 3,
    name: "Dr. Omar Khalil",
    title: "Professor of Civil Engineering",
    company: "Tripoli University",
    bio: "Leading researcher in advanced construction materials and structural engineering.",
    photo: "https://via.placeholder.com/200/3b82f6/ffffff?text=OK",
    sessions: [4],
    expertise: ["Materials Science", "Structural Engineering", "Research"],
    social: {
      linkedin: "linkedin.com/in/omarkhalil"
    }
  },
  {
    id: 4,
    name: "Laila Hassan",
    title: "Sustainability Director",
    company: "EcoGreen Architecture",
    bio: "Expert in green building certification and sustainable design practices.",
    photo: "https://via.placeholder.com/200/10b981/ffffff?text=LH",
    sessions: [6, 7],
    expertise: ["Green Building", "LEED Certification", "Sustainability"],
    social: {
      linkedin: "linkedin.com/in/lailahassan",
      twitter: "@lailahassan"
    }
  }
]

export const sessions = [
  {
    id: 1,
    title: "Future of Urban Development in Libya",
    speaker: 1,
    date: "2026-03-15",
    time: "10:00 AM",
    duration: "60 min",
    location: "Main Hall - Auditorium A",
    description: "Exploring innovative approaches to sustainable urban planning and smart city development.",
    category: "Keynote",
    capacity: 500,
    registered: 342
  },
  {
    id: 2,
    title: "Infrastructure Resilience Workshop",
    speaker: 1,
    date: "2026-03-15",
    time: "2:00 PM",
    duration: "90 min",
    location: "Workshop Room 1",
    description: "Hands-on workshop on building resilient infrastructure for climate challenges.",
    category: "Workshop",
    capacity: 50,
    registered: 48,
    price: 150
  },
  {
    id: 3,
    title: "Smart Construction Technology Trends",
    speaker: 2,
    date: "2026-03-15",
    time: "11:30 AM",
    duration: "45 min",
    location: "Tech Hall - Room B",
    description: "Latest innovations in construction automation and digital transformation.",
    category: "Panel",
    capacity: 200,
    registered: 156
  },
  {
    id: 4,
    title: "Advanced Materials in Modern Construction",
    speaker: 3,
    date: "2026-03-16",
    time: "9:00 AM",
    duration: "60 min",
    location: "Main Hall - Auditorium A",
    description: "Deep dive into next-generation building materials and their applications.",
    category: "Technical",
    capacity: 300,
    registered: 203
  },
  {
    id: 5,
    title: "IoT Integration in Buildings",
    speaker: 2,
    date: "2026-03-16",
    time: "3:00 PM",
    duration: "75 min",
    location: "Tech Hall - Room B",
    description: "Practical guide to implementing IoT systems in commercial and residential buildings.",
    category: "Workshop",
    capacity: 60,
    registered: 55,
    price: 150
  },
  {
    id: 6,
    title: "Green Building Certification Masterclass",
    speaker: 4,
    date: "2026-03-16",
    time: "10:00 AM",
    duration: "120 min",
    location: "Workshop Room 2",
    description: "Comprehensive guide to achieving LEED and other green building certifications.",
    category: "Workshop",
    capacity: 40,
    registered: 38,
    price: 150
  },
  {
    id: 7,
    title: "Sustainable Design Panel Discussion",
    speaker: 4,
    date: "2026-03-17",
    time: "11:00 AM",
    duration: "90 min",
    location: "Main Hall - Auditorium B",
    description: "Industry leaders discuss the future of sustainable architecture in MENA region.",
    category: "Panel",
    capacity: 250,
    registered: 189
  }
]

export const newsItems = [
  {
    id: 1,
    title: "Al Najm Alssaed Joins Libya Build Benghazi as Heavy Equipment Sponsor",
    summary: "Al Najm Alssaed is an established company providing heavy equipment solutions for large-scale construction and infrastructure projects across Libya.",
    content: "We are proud to welcome Al Najm Alssaed as our Heavy Equipment Sponsor for Libya Build Benghazi 2026.",
    date: "2026-01-20T18:00:00",
    category: "Sponsorship",
    priority: "high",
    image: "/media/AlNajmAlssaed.jpeg"
  },
  {
    id: 2,
    title: "Eithar Company Announced as HVAC Sponsor of Libya Build Benghazi 2026",
    summary: "Eithar Company is a recognized provider of HVAC and home appliance solutions in Libya and the exclusive agent for Hisense in the local market.",
    content: "We are delighted to announce Eithar Company's partnership as HVAC Sponsor for Libya Build Benghazi 2026.",
    date: "2026-01-20T18:00:00",
    category: "Sponsorship",
    priority: "high",
    image: "/media/Eitharcompany.jpeg"
  },
  {
    id: 3,
    title: "Libya Build Benghazi 2026 Welcomes Silini Company as Paints Sponsor",
    summary: "Silini Company is the exclusive agent for Scib Paints in Libya, providing high-quality coating solutions for residential and commercial projects.",
    content: "We are excited to welcome Silini Company as our Paints Sponsor for Libya Build Benghazi 2026.",
    date: "2026-01-20T18:00:00",
    category: "Sponsorship",
    priority: "high",
    image: "/media/SiliniCompany.jpeg"
  }
]

export const pointsOfInterest = [
  { id: 1, name: "Main Entrance", type: "entrance", coordinates: { x: 50, y: 50 } },
  { id: 2, name: "Information Desk", type: "info", coordinates: { x: 100, y: 80 } },
  { id: 3, name: "Prayer Room - Male", type: "prayer", coordinates: { x: 200, y: 100 } },
  { id: 4, name: "Prayer Room - Female", type: "prayer", coordinates: { x: 200, y: 140 } },
  { id: 5, name: "First Aid Station", type: "medical", coordinates: { x: 400, y: 120 } },
  { id: 6, name: "Food Court A", type: "food", coordinates: { x: 300, y: 200 } },
  { id: 7, name: "Food Court B", type: "food", coordinates: { x: 600, y: 200 } },
  { id: 8, name: "Restrooms - Block 1", type: "restroom", coordinates: { x: 250, y: 150 } },
  { id: 9, name: "Restrooms - Block 2", type: "restroom", coordinates: { x: 550, y: 150 } },
  { id: 10, name: "Emergency Exit - North", type: "exit", coordinates: { x: 400, y: 20 } },
  { id: 11, name: "Emergency Exit - South", type: "exit", coordinates: { x: 400, y: 280 } },
  { id: 12, name: "VIP Lounge", type: "lounge", coordinates: { x: 700, y: 100 } }
]

export const transportSchedule = [
  {
    id: 1,
    route: "City Center - Expo",
    type: "shuttle",
    frequency: "Every 15 minutes",
    firstDeparture: "08:00 AM",
    lastDeparture: "07:00 PM",
    duration: "25 minutes",
    status: "On time"
  },
  {
    id: 2,
    route: "Airport - Expo",
    type: "shuttle",
    frequency: "Every 30 minutes",
    firstDeparture: "07:00 AM",
    lastDeparture: "08:00 PM",
    duration: "40 minutes",
    status: "On time"
  },
  {
    id: 3,
    route: "Hotel District - Expo",
    type: "shuttle",
    frequency: "Every 20 minutes",
    firstDeparture: "08:30 AM",
    lastDeparture: "06:30 PM",
    duration: "15 minutes",
    status: "On time"
  },
  {
    id: 4,
    route: "Parking Lot C - Main Gate",
    type: "internal",
    frequency: "Every 10 minutes",
    firstDeparture: "08:00 AM",
    lastDeparture: "07:00 PM",
    duration: "5 minutes",
    status: "On time"
  }
]

export const ticketUpgrades = [
  {
    id: 1,
    name: "VIP Lounge Access",
    description: "Full-day access to premium VIP lounge with refreshments, WiFi, and private meeting areas",
    price: 250,
    currency: "AED",
    duration: "1 Day",
    features: ["Premium Refreshments", "High-Speed WiFi", "Private Meeting Rooms", "Concierge Service"]
  },
  {
    id: 2,
    name: "Fast-Track Entry",
    description: "Skip the queues with priority entry access",
    price: 100,
    currency: "AED",
    duration: "Full Event",
    features: ["Dedicated Entry Lane", "No Waiting", "All Days Valid"]
  },
  {
    id: 3,
    name: "VIP Weekend Pass",
    description: "Complete VIP experience for all three days",
    price: 600,
    currency: "AED",
    duration: "3 Days",
    features: ["3-Day VIP Lounge Access", "Fast-Track Entry", "Exclusive Networking Events", "Premium Parking"]
  }
]
