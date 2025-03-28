import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Hospital from '@/models/Hospital';

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
    
    const hospital = await Hospital.findOne({ username });
    
    if (!hospital) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // In a real application, you would use bcrypt.compare to check the password
    // Here we're just doing a direct comparison for simplicity
    if (hospital.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // In a real application, we would generate a JWT token here
    // and send it back to the client for authentication
    
    const hospitalResponse = hospital.toObject();
    delete hospitalResponse.password;
    
    return NextResponse.json({
      success: true,
      data: {
        hospital: hospitalResponse,
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