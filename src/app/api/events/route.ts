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
    return NextResponse.json(event);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find({}).sort({ createdAt: -1 });
    return NextResponse.json(events);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}