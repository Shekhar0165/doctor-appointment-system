import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Doctor from '@/models/Doctor';

export async function GET() {
  try {
    await dbConnect();
    
    const doctors = await Doctor.find({}).populate('hospital', 'name address');
    
    return NextResponse.json({ success: true, data: doctors }, { status: 200 });
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
    
    const doctor = await Doctor.create(body);
    
    return NextResponse.json(
      { success: true, data: doctor },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 