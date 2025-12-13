import mongoose, { Document, Schema } from "mongoose";

export interface ISocialPost extends Document {
  content: string;
  postType: string;
  images: string[];
  status: "draft" | "published";
  author: string;
  views: number;
  likes: number;
  saves: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocialPostSchema = new Schema<ISocialPost>({
  content: { type: String, required: true },
  postType: { type: String, required: true },
  images: [{ type: String }],
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  author: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.SocialPost || mongoose.model<ISocialPost>("SocialPost", SocialPostSchema);