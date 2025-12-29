const sampleEvents = [
  {
    id: "1",
    title: "Beach Cleanup Drive",
    description: "Join us for a community beach cleanup to protect marine life...",
    category: "Environmental",
    date: "2025-08-15",
    time: "09:00 AM",
    duration: "4 hours",
    location: "Sunset Beach Park",
    organizer: "Green Earth Initiative",
    spotsAvailable: 25,
    spotsTotal: 50,
    requirements: ["Bring water bottle", "Wear comfortable clothes", "Closed-toe shoes required"],
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
  },
  // Add other events similarly...
];

export const fetchEvents = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleEvents);
    }, 1500);
  });
};

export const registerForEvent = (eventId, userId) => {
  // Simulate registration process
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (eventId && userId) {
        resolve({ success: true, message: "Registered successfully" });
      } else {
        reject(new Error("Invalid event or user"));
      }
    }, 1000);
  });
};
