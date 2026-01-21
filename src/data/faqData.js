export const faqCategories = [
  {
    id: 'general',
    name: 'General Information',
    icon: 'info'
  },
  {
    id: 'navigation',
    name: 'Navigation & Venue',
    icon: 'map'
  },
  {
    id: 'tickets',
    name: 'Tickets & Registration',
    icon: 'ticket'
  },
  {
    id: 'exhibitors',
    name: 'Exhibitors & Networking',
    icon: 'building'
  },
  {
    id: 'technical',
    name: 'Technical Support',
    icon: 'settings'
  }
]

export const faqs = [
  {
    id: 1,
    category: 'general',
    question: "When is Libya Build 2026?",
    answer: "Libya Build 2026 takes place from April 20-23, 2026. The event runs from 9:00 AM to 7:00 PM each day.",
    keywords: ["dates", "when", "time", "schedule", "hours"]
  },
  {
    id: 2,
    category: 'general',
    question: "Where is the event located?",
    answer: "The event is held at the Tripoli International Fair Ground. Free shuttle buses run from the city center every 15 minutes.",
    keywords: ["location", "where", "venue", "address", "place"]
  },
  {
    id: 3,
    category: 'navigation',
    question: "Where is Hall 4?",
    answer: "Hall 4 is located in the northern section of the venue. You can use our interactive floor plan feature in the app for detailed navigation with GPS guidance.",
    keywords: ["hall 4", "hall", "location", "find", "where"]
  },
  {
    id: 4,
    category: 'navigation',
    question: "How do I find a specific exhibitor?",
    answer: "Use the Exhibitors page and search by company name, sector, or country. You can also use the floor plan to navigate directly to their booth.",
    keywords: ["find exhibitor", "search", "company", "booth", "locate"]
  },
  {
    id: 5,
    category: 'navigation',
    question: "Where are the restrooms?",
    answer: "Restrooms are marked on the floor plan with blue icons. There are facilities in all four halls, near the main entrance, and by the food courts.",
    keywords: ["restroom", "bathroom", "toilet", "facilities", "wc"]
  },
  {
    id: 6,
    category: 'tickets',
    question: "How do I get my entry badge?",
    answer: "Your digital entry pass with QR code is available in the Tickets section of the app. Simply show it at any entrance gate for contactless entry.",
    keywords: ["badge", "entry", "pass", "ticket", "qr code", "admission"]
  },
  {
    id: 7,
    category: 'tickets',
    question: "Can I upgrade to VIP access?",
    answer: "Yes! Visit the Tickets page to purchase VIP lounge access (250 AED/day) or Fast-Track Entry (100 AED). VIP passes include premium amenities and priority entry.",
    keywords: ["vip", "upgrade", "premium", "lounge", "fast track"]
  },
  {
    id: 8,
    category: 'tickets',
    question: "How do I book a workshop?",
    answer: "Browse available workshops in the Schedule or Workshops section. Click 'Book Now' on any workshop to secure your spot. Technical workshops cost 150 AED each.",
    keywords: ["workshop", "book", "training", "session", "register"]
  },
  {
    id: 9,
    category: 'exhibitors',
    question: "How do I schedule a meeting with an exhibitor?",
    answer: "Visit the exhibitor's profile page and click 'Book Meeting'. Select your preferred date and time, and the exhibitor will receive your request.",
    keywords: ["meeting", "appointment", "schedule", "book", "exhibitor"]
  },
  {
    id: 10,
    category: 'exhibitors',
    question: "How does the business matchmaking work?",
    answer: "Our AI algorithm matches you with relevant exhibitors based on your selected sector and interests. Check the 'Suggested for You' section on the home page.",
    keywords: ["matchmaking", "suggestions", "recommended", "networking", "ai"]
  },
  {
    id: 11,
    category: 'exhibitors',
    question: "Can I chat with exhibitors in the app?",
    answer: "Yes! Once you exchange business cards with an exhibitor, you can start a direct chat conversation. Access your chats from the navigation menu.",
    keywords: ["chat", "message", "contact", "talk", "communication"]
  },
  {
    id: 12,
    category: 'technical',
    question: "The app is not loading properly",
    answer: "Try refreshing the page or clearing your browser cache. Make sure you have a stable internet connection. If issues persist, contact support at support@libyabuild.ly",
    keywords: ["not working", "loading", "error", "bug", "issue", "problem"]
  },
  {
    id: 13,
    category: 'technical',
    question: "How do I scan QR codes?",
    answer: "Use the QR scanner in Business Cards or Lead Retrieval sections. Allow camera access when prompted. Point your camera at the QR code to scan automatically.",
    keywords: ["qr", "scan", "camera", "code", "reader"]
  },
  {
    id: 14,
    category: 'general',
    question: "Is WiFi available at the venue?",
    answer: "Yes, free high-speed WiFi is available throughout the venue. Connect to 'LibyaBuild2026' network. VIP lounge members get access to premium WiFi.",
    keywords: ["wifi", "internet", "connection", "network", "wireless"]
  },
  {
    id: 15,
    category: 'navigation',
    question: "Where can I get food?",
    answer: "Two food courts are available - Food Court A in the central area and Food Court B near Hall D. Both offer local and international cuisine.",
    keywords: ["food", "restaurant", "cafe", "eat", "dining", "lunch"]
  }
]

export const quickActions = [
  {
    id: 1,
    text: "Where is Hall 4?",
    category: 'navigation',
    faqId: 3
  },
  {
    id: 2,
    text: "How do I get my entry badge?",
    category: 'tickets',
    faqId: 6
  },
  {
    id: 3,
    text: "Schedule a meeting",
    category: 'exhibitors',
    faqId: 9
  },
  {
    id: 4,
    text: "Book a workshop",
    category: 'tickets',
    faqId: 8
  }
]
