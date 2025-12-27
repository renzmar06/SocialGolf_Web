import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  eventType: { type: String, required: true },
  format: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String },
  location: { type: String },
  price: { type: Number, default: 0 },
  maxParticipants: { type: String },
  description: { type: String },
  rules: { type: String },
  prizes: { type: String },
  coverImage: { type: String },
  createdBy: { type: String, required: true },
  status: { type: String, default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    const event = new Event(data);
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: event
    }, { status: 200 });
  } catch (error: any) {
    console.error("API Error (POST):", error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create event'
    }, { status: 200 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Event fetch succcess",
      data: events
    }, { status: 200 });
  } catch (error: any) {
    console.error("API Error (GET):", error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch events'
    }, { status: 200 });
  }
}