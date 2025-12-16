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
        message: "Invalid event ID",
        data: null
      }, { status: 400 });
    }

    const data = await request.json();

    const event = await Event.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });

    if (!event) {
      return NextResponse.json({
        success: false,
        message: "Event not found",
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      data: event
    });
  } catch (error) {
    console.error("PUT ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update event",
      data: null
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid event ID',
        data: null
      }, { status: 400 });
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json({
        success: false,
        message: 'Event not found',
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      data: { id }
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete event',
      data: null
    }, { status: 500 });
  }
}