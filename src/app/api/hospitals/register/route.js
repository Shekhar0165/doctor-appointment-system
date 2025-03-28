import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Hospital from '@/models/Hospital';

export async function POST(request) {
  try {
    const body = await request.json();
    
    await dbConnect();
    
    // Check if username already exists
    const existingHospitalByUsername = await Hospital.findOne({ username: body.username });
    if (existingHospitalByUsername) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingHospitalByEmail = await Hospital.findOne({ email: body.email });
    if (existingHospitalByEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // In a real application, you would hash the password using bcrypt
    // For simplicity, we're storing it as plain text
    const hospital = await Hospital.create(body);
    
    // Return hospital data without password
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