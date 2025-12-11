import mongoose from "mongoose";

const UserDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  type: { type: String, required: true },
  businessName: { type: String, required: true },
  aboutBusiness: String,
  streetAddress: String,
  city: String,
  state: String,
  zip: String,
  phoneNumber: String,
  website: String,
  logo: String,
  verificationDoc: String,
  businessHours: { type: Object, default: {} },
  isVerified: { type: Boolean, default: false },

  teamMembers: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      role: { type: String, default: "Staff" },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

// This is the key fix:
delete mongoose.models.UserDetail; // Remove cached version

const UserDetail = mongoose.models.UserDetail || mongoose.model("UserDetail", UserDetailSchema);

export default UserDetail;  