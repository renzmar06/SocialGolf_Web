import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  name: string;
  location: string;
  description?: string;
  isActive: boolean;
}

const CourseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);