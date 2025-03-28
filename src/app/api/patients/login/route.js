import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Patient from '@/models/Patient';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide username and password' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const patient = await Patient.findOne({ username });
    
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // In a real application, you would use bcrypt.compare to check the password
    // Here we're just doing a direct comparison for simplicity
    if (patient.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // In a real application, we would generate a JWT token here
    // and send it back to the client for authentication
    
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    
    return NextResponse.json({
      success: true,
      data: {
        patient: patientResponse,
        // token: 'jwt_token_would_go_here'
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 