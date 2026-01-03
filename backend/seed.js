// backend/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";
import User from "./models/User.js";
import NGO from "./models/NGO.js";
import bcrypt from "bcryptjs";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    await Event.deleteMany({});
    await User.deleteMany({});
    await NGO.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create sample NGO
    const hashedPassword = await bcrypt.hash("ngo123", 10);
    const sampleNGO = await NGO.create({
      name: "Green Earth Admin",
      email: "admin@greenearth.org",
      password: hashedPassword,
      organizationName: "Green Earth Initiative",
      registrationNumber: "NGO2024001",
      description: "Working towards environmental conservation",
      contactNumber: "+1234567890",
      categories: ["Environmental"],
      verified: true
    });
    console.log("✅ Created sample NGO");

    // Create sample events
    const events = [
      {
        title: "Beach Cleanup Drive",
        description: "Join us for a community beach cleanup to protect marine life and keep our shores beautiful. We'll provide all necessary equipment including gloves, bags, and water.",
        skillsRequired: ["Teamwork", "Physical Fitness"],
        tags: ["Environment", "Outdoor", "Community"],
        city: "Mumbai",
        category: "Environmental",
        date: "2025-08-15",
        time: "09:00 AM",
        duration: "4 hours",
        location: "Juhu Beach",
        organizer: "Green Earth Initiative",
        spotsAvailable: 45,
        spotsTotal: 50,
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800"
      },
      {
        title: "Tree Plantation Drive",
        description: "Help us plant 500 saplings across the city. Every tree counts in our fight against climate change!",
        skillsRequired: ["Physical Fitness", "Gardening"],
        tags: ["Environment", "Tree", "Green"],
        city: "Mumbai",
        category: "Environmental",
        date: "2025-09-10",
        time: "07:30 AM",
        duration: "5 hours",
        location: "Sanjay Gandhi National Park",
        organizer: "Green Earth Initiative",
        spotsAvailable: 80,
        spotsTotal: 100,
        image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800"
      },
      {
        title: "Food Bank Volunteering",
        description: "Sort, pack, and distribute food to those in need. Make a direct impact in fighting hunger in our community.",
        skillsRequired: ["Teamwork", "Communication"],
        tags: ["Community", "Food", "Support"],
        city: "Mumbai",
        category: "Community Support",
        date: "2025-08-12",
        time: "02:00 PM",
        duration: "3 hours",
        location: "Mumbai Food Bank",
        organizer: "Community Care Foundation",
        spotsAvailable: 25,
        spotsTotal: 30,
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800"
      },
      {
        title: "Teach Kids Coding",
        description: "Share your programming knowledge with underprivileged children. Basic coding skills required.",
        skillsRequired: ["Programming", "Teaching", "Patience"],
        tags: ["Education", "Technology", "Kids"],
        city: "Mumbai",
        category: "Education",
        date: "2025-08-20",
        time: "10:00 AM",
        duration: "3 hours",
        location: "Community Learning Center",
        organizer: "CodeForAll NGO",
        spotsAvailable: 12,
        spotsTotal: 15,
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800"
      },
      {
        title: "Health Awareness Camp",
        description: "Help organize a health checkup camp in rural areas. Medical students and healthcare volunteers needed.",
        skillsRequired: ["Healthcare", "Communication"],
        tags: ["Health", "Medical", "Rural"],
        city: "Mumbai",
        category: "Health",
        date: "2025-09-05",
        time: "08:00 AM",
        duration: "6 hours",
        location: "Vasai Rural Area",
        organizer: "HealthFirst Foundation",
        spotsAvailable: 20,
        spotsTotal: 25,
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
      },
      {
        title: "Animal Shelter Care",
        description: "Spend time with rescued animals. Help with feeding, cleaning, and socialization.",
        skillsRequired: ["Animal Care", "Compassion"],
        tags: ["Animals", "Care", "Shelter"],
        city: "Mumbai",
        category: "Animal Welfare",
        date: "2025-08-25",
        time: "11:00 AM",
        duration: "4 hours",
        location: "Mumbai Animal Shelter",
        organizer: "PawsCare NGO",
        spotsAvailable: 18,
        spotsTotal: 20,
        image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800"
      },
      {
        title: "Old Age Home Visit",
        description: "Bring joy to elderly residents through conversations, activities, and companionship.",
        skillsRequired: ["Communication", "Empathy"],
        tags: ["Elderly", "Social", "Care"],
        city: "Mumbai",
        category: "Community Support",
        date: "2025-08-18",
        time: "03:00 PM",
        duration: "2 hours",
        location: "Serenity Senior Home",
        organizer: "ElderCare Society",
        spotsAvailable: 10,
        spotsTotal: 15,
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"
      }
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} sample events`);

    // Create sample user
    const userPassword = await bcrypt.hash("test123", 10);
    const sampleUser = await User.create({
      name: "Test Student",
      email: "test@student.com",
      password: userPassword,
      preferences: {
        interests: ["Environmental", "Education"],
        skills: ["Teamwork", "Communication"],
        availableDays: ["Saturday", "Sunday"],
        city: "Mumbai"
      }
    });
    console.log("✅ Created sample user");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("─────────────────────────");
    console.log("Student Login:");
    console.log("  Email: test@student.com");
    console.log("  Password: test123");
    console.log("\nNGO Login:");
    console.log("  Email: admin@greenearth.org");
    console.log("  Password: ngo123");
    console.log("─────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

// Run seed
connectDB().then(seedData);