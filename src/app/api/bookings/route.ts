// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  serviceType: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  maxParticipants: { type: Number, default: 1 },
  description: { type: String },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  bookingDate: { type: String },
  bookingTime: { type: String },
  status: { type: String, default: 'Pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    const booking = new Booking(data);
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    console.error("POST ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
        error: error.message || "Unknown error",
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
      },
      { status: 200 }
    );
  }
}