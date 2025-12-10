import mongoose from "mongoose";
import User from "../src/models/User";

const MONGO_URI = process.env.NEXT_MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/socialGolf";

async function seedSuperAdmin(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      console.log("SuperAdmin already exists");
      process.exit(0);
    }

    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@socialgolf.com",
      password: "SuperAdmin@123",
      role: "superadmin",
      isActive: true,
    });

    console.log("SuperAdmin created successfully:", superAdmin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding SuperAdmin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();