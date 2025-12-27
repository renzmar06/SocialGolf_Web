import { connectDB } from "../src/lib/db";
import Course from "../src/models/Course";

const staticCourses = [
  { name: "Augusta National Golf Club", location: "Augusta, Georgia", description: "Home of the Masters Tournament" },
  { name: "Pebble Beach Golf Links", location: "Pebble Beach, California", description: "Iconic oceanside course" },
  { name: "St. Andrews Old Course", location: "St. Andrews, Scotland", description: "The home of golf" },
  { name: "Pinehurst No. 2", location: "Pinehurst, North Carolina", description: "Classic American golf course" },
  { name: "Bethpage Black", location: "Farmingdale, New York", description: "Challenging public course" },
  { name: "TPC Sawgrass", location: "Ponte Vedra Beach, Florida", description: "Famous for the island green 17th hole" },
  { name: "Whistling Straits", location: "Kohler, Wisconsin", description: "Links-style course on Lake Michigan" },
  { name: "Torrey Pines Golf Course", location: "La Jolla, California", description: "Municipal course with ocean views" },
  { name: "Kiawah Island Ocean Course", location: "Kiawah Island, South Carolina", description: "Oceanfront championship course" },
  { name: "Bandon Dunes Golf Resort", location: "Bandon, Oregon", description: "Links golf on the Pacific Coast" }
];

async function seedCourses() {
  try {
    await connectDB();
    
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      console.log("Courses already exist, skipping seed");
      return;
    }

    await Course.insertMany(staticCourses);
    console.log("Successfully seeded courses");
  } catch (error) {
    console.error("Error seeding courses:", error);
  }
}

seedCourses();