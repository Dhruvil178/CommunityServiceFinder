export const users = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    joinDate: "2024-01-15",
    eventsCompleted: 12,
    hoursServed: 48,
    certificates: 3,
    interests: ["Environmental", "Education"]
  }
];

export const events = [
  {
    id: "1",
    title: "Beach Cleanup Drive",
    description: "Join us for a community beach cleanup to protect marine life and keep our shores beautiful.",
    category: "Environmental",
    date: "2025-08-15",
    time: "09:00 AM",
    duration: "4 hours",
    location: "Sunset Beach Park",
    address: "123 Ocean Drive, Coastal City",
    organizer: "Green Earth Initiative",
    spotsAvailable: 25,
    spotsTotal: 50,
    requirements: ["Bring water bottle", "Wear comfortable clothes", "Closed-toe shoes required"],
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
    coordinates: { "latitude": 37.7749, "longitude": -122.4194 }
  },

  // (Paste your other events here)
];

export const certificates = [
  {
    id: "1",
    title: "Environmental Steward",
    description: "Completed 20+ hours of environmental community service",
    dateEarned: "2024-07-15",
    issuer: "Green Earth Initiative",
    hoursCompleted: 24,
    verificationCode: "ENV-2024-001234",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
  }
];

export const categories = [
  { id: "1", name: "Environmental", icon: "eco", color: "#4CAF50" },
  { id: "2", name: "Education", icon: "school", color: "#2196F3" },
  { id: "3", name: "Health", icon: "favorite", color: "#F44336" },
  { id: "4", name: "Community Support", icon: "people", color: "#FF9800" },
  { id: "5", name: "Animal Welfare", icon: "pets", color: "#9C27B0" },
  { id: "6", name: "Technology", icon: "computer", color: "#607D8B" }
];
export const interests = [
  "Environmental",
  "Education",
    "Health",
    "Community Support",
    "Animal Welfare",
    "Technology"
];