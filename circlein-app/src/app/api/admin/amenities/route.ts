import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ApiResponse, Amenity } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession();
    if (!session?.user?.id || session.user?.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, maxCapacity, isActive } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name is required',
      });
    }

    if (!maxCapacity || typeof maxCapacity !== 'number' || maxCapacity < 1) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Max capacity must be a positive number',
      });
    }

    // Create new amenity
    const amenityRef = doc(collection(db, 'amenities'));
    const newAmenity: Amenity = {
      id: amenityRef.id,
      name: name.trim(),
      description: description?.trim() || '',
      maxCapacity: typeof maxCapacity === 'number' ? maxCapacity : parseInt(maxCapacity),
      isActive: isActive !== false, // Default to true if not specified
    };

    await setDoc(amenityRef, newAmenity);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        amenity: newAmenity,
        message: 'Amenity created successfully',
      },
    });
  } catch (error) {
    console.error('Amenity creation error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create amenity',
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession();
    if (!session?.user?.id || session.user?.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, maxCapacity, isActive } = body;

    // Validate input
    if (!id || typeof id !== 'string') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Amenity ID is required',
      });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name is required',
      });
    }

    if (!maxCapacity || typeof maxCapacity !== 'number' || maxCapacity < 1) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Max capacity must be a positive number',
      });
    }

    // Update amenity
    const amenityRef = doc(db, 'amenities', id);
    const updatedAmenity: Partial<Amenity> = {
      name: name.trim(),
      description: description?.trim() || '',
      maxCapacity: typeof maxCapacity === 'number' ? maxCapacity : parseInt(maxCapacity),
      isActive: isActive !== false,
    };

    await updateDoc(amenityRef, updatedAmenity);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Amenity updated successfully',
      },
    });
  } catch (error) {
    console.error('Amenity update error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update amenity',
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession();
    if (!session?.user?.id || session.user?.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Amenity ID is required',
      });
    }

    // Delete amenity
    const amenityRef = doc(db, 'amenities', id);
    await deleteDoc(amenityRef);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Amenity deleted successfully',
      },
    });
  } catch (error) {
    console.error('Amenity deletion error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete amenity',
    });
  }
}