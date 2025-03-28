import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Appointment from '@/models/Appointment';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Patient email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const appointments = await Appointment.find({
      patientEmail: email
    })
    .sort({ date: -1 }) // Most recent first
    .populate('doctor', 'name specialization')
    .populate('hospital', 'name address');

    return NextResponse.json(
      { success: true, data: appointments },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 