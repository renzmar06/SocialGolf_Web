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
    return NextResponse.json(booking);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}