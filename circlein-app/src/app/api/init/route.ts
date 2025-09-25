import { NextRequest, NextResponse } from 'next/server';
import { initializeAmenities, initializeBookingRules, generateAccessCodes, createTestUsers } from '@/lib/database';
import { ApiResponse } from '@/lib/types';

export async function POST() {
  try {
    // Initialize amenities
    await initializeAmenities();
    
    // Initialize booking rules
    await initializeBookingRules();
    
    // Create test users
    const testUsers = await createTestUsers();
    
    // Generate access codes
    const codes = await generateAccessCodes(20);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Database initialized successfully',
        testUsers: testUsers.map(user => ({ 
          email: user.email, 
          password: user.password, 
          role: user.role 
        })),
        accessCodes: codes.map(code => code.code),
      },
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to initialize database',
    });
  }
}