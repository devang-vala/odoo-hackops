import { dbConnect } from '@/lib/db';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';

// Get a specific user
export async function GET(request, { params }) {
  try {
    // const session = await getServerSession();
    
    // // Check if user is authenticated and is admin
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    
    const { id } = params;
    
    await dbConnect();
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update a user
export async function PATCH(request, { params }) {
  try {
    // const session = await getServerSession();
    
    // // Check if user is authenticated and is admin
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    
    const { id } = await params;
    const userData = await request.json();
    
    await dbConnect();
    
    // Remove password from update if it's empty
    if (userData.password === '') {
      delete userData.password;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser);
    
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete a user
export async function DELETE(request, { params }) {
  try {
    // const session = await getServerSession();
    
    // // Check if user is authenticated and is admin
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    
    const { id } = await params;
    
    await dbConnect();
    
    // Prevent deleting self
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}