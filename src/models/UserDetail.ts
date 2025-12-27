import mongoose from "mongoose";

const UserDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  type: { 
    type: String, 
    required: false 
  }, // e.g., "coach-trainer", "retail", "event-host"
  
  businessName: { 
    type: String, 
    required: false 
  },
  aboutBusiness: String,
  bio: String,
  skillLevel: String,
  favoriteCourses: [String],
  
  // Address
  streetAddress: String,
  city: String,
  state: String,
  zip: String,
  
  // Contact
  phoneNumber: String,
  website: String,
  
  // Files (stored as URLs after upload)
  logo: { 
    type: String, 
    required: false 
  }, // URL to uploaded logo
  verificationDoc: { 
    type: String, 
    required: false 
  }, // URL to verification document
  
  // NEW: Gallery Photos - Array of image URLs
  gallery: [
    {
      type: String, // URL of the image
    },
  ],

  // Business Hours
  businessHours: { 
    type: Object, 
    default: {} 
  },

  // Verification status (admin approval)
  isVerified: { 
    type: Boolean, 
    default: false 
  },

  // Team Members
  teamMembers: [
    {
      name: { 
        type: String, 
        required: false 
      },
      email: { 
        type: String, 
        required: false, 
        lowercase: true 
      },
      role: { 
        type: String, 
        default: "Staff" 
      },
    },
  ],

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Prevent model overwrite in development (Next.js hot reload)
if (mongoose.models.UserDetail) {
  delete mongoose.models.UserDetail;
}

const UserDetail = mongoose.models.UserDetail || mongoose.model("UserDetail", UserDetailSchema);

export default UserDetail;