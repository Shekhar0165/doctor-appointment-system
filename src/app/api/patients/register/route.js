import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Patient from '@/models/Patient';

export async function POST(request) {
  try {
    const body = await request.json();
    
    await dbConnect();
    
    // Check if username already exists
    const existingUserByUsername = await Patient.findOne({ username: body.username });
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUserByEmail = await Patient.findOne({ email: body.email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // In a real application, you would hash the password using bcrypt
    // For simplicity, we're storing it as plain text
    const patient = await Patient.create(body);
    
    // Return patient data without password
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    
    return NextResponse.json(
      { success: true, data: patientResponse },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 