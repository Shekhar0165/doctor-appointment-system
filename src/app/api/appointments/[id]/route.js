import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Appointment from '@/models/Appointment';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await dbConnect();
    
    const appointment = await Appointment.findById(id)
      .populate('doctor', 'name specialization')
      .populate('hospital', 'name address');
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: appointment }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    await dbConnect();
    
    const appointment = await Appointment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: appointment }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Endpoint to cancel an appointment
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    await dbConnect();
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: appointment }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 