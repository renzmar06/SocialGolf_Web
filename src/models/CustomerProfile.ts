import mongoose, { Document, Schema } from "mongoose";

export interface ICustomerProfile extends Document {
  user: mongoose.Types.ObjectId;
  profileImage?: string;
  city: string;
  bio?: string;
  skillLevel: string;
  favoriteCourses: mongoose.Types.ObjectId[];
}

const CustomerProfileSchema = new Schema<ICustomerProfile>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  profileImage: { type: String },
  city: { type: String, required: true },
  bio: { type: String },
  skillLevel: { type: String, required: true },
  favoriteCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }],
}, { timestamps: true });

export default mongoose.models.CustomerProfile || mongoose.model<ICustomerProfile>("CustomerProfile", CustomerProfileSchema);