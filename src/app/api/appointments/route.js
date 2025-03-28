import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Appointment from '@/models/Appointment';

export async function GET() {
  try {
    await dbConnect();
    
    const appointments = await Appointment.find({})
      .populate('doctor', 'name specialization')
      .populate('hospital', 'name address');
    
    return NextResponse.json({ success: true, data: appointments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    await dbConnect();
    
    // Check if the time slot is already booked - improved check
    const existingAppointment = await Appointment.findOne({
      doctor: body.doctor,
      date: body.date,
      'timeSlot.startTime': body.timeSlot.startTime,
      status: { $ne: 'cancelled' } // Exclude cancelled appointments
    });
    
    if (existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'This time slot is already booked. Please select a different time.' },
        { status: 400 }
      );
    }
    
    // Additional safety check for MongoDB unique index
    try {
      const appointment = await Appointment.create(body);
      
      return NextResponse.json(
        { success: true, data: appointment },
        { status: 201 }
      );
    } catch (err) {
      // Handle duplicate key error specifically
      if (err.code === 11000) {
        return NextResponse.json(
          { success: false, message: 'This time slot was just booked by someone else. Please select a different time.' },
          { status: 409 } // Conflict status code
        );
      }
      throw err; // Re-throw other errors
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 