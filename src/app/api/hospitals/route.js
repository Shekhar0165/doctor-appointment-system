import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Hospital from '@/models/Hospital';

export async function GET() {
  try {
    await dbConnect();
    
    const hospitals = await Hospital.find({}).select('-password');
    
    return NextResponse.json({ success: true, data: hospitals }, { status: 200 });
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
    
    const hospital = await Hospital.create(body);
    
    // Return without password
    const hospitalResponse = hospital.toObject();
    delete hospitalResponse.password;
    
    return NextResponse.json(
      { success: true, data: hospitalResponse },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 