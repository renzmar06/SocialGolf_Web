import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  promoType: { type: String, required: true },
  promoCode: { type: String },
  discountValue: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  visibility: { type: String, default: 'Public' },
  maxRedemptions: { type: Number, default: 0 },
  currentRedemptions: { type: Number, default: 0 },
  coverImage: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    const promotion = new Promotion(data);
    await promotion.save();
    return NextResponse.json({
      success: true,
      message: "Promotion created successfully",
      data: promotion
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create promotion",
      data: null
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      message: "Promotions fetched successfully",
      data: promotions
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch promotions",
      data: []
    }, { status: 500 });
  }
}