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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid promotion ID"
      }, { status: 200 });
    }

    const data = await request.json();

    const promotion = await Promotion.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });

    if (!promotion) {
      return NextResponse.json({
        success: false,
        message: "Promotion not found"
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: "Promotion updated successfully",
      data: promotion
    });
  } catch (error) {
    console.error("PUT ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update promotion"
    }, { status: 200 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid promotion ID'
      }, { status: 200 });
    }

    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return NextResponse.json({
        success: false,
        message: 'Promotion not found'
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully'
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete promotion'
    }, { status: 200 });
  }
}