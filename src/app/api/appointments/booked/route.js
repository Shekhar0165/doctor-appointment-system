import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Appointment from '@/models/Appointment';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const doctor = searchParams.get('doctor');

    if (!date || !doctor) {
      return NextResponse.json(
        { success: false, message: 'Date and doctor ID are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get all appointments for this date and doctor that are not cancelled
    const appointments = await Appointment.find({
      doctor: doctor,
      date: date,
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    // Extract just the booked time slots
    const bookedTimeSlots = appointments.map(appointment => appointment.timeSlot);

    return NextResponse.json(
      { success: true, data: bookedTimeSlots },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 