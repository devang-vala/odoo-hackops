import { dbConnect } from '@/lib/db';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';

// Get users with pagination and filtering
export async function GET(request) {
  try {
    // const session = await getServerSession();
    
    // // Check if user is authenticated and is admin
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    await dbConnect();
    
    // Build query based on search and role filter
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;
    
    // Get users with pagination
    const users = await User.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-password'); // Exclude password
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasMore: page < Math.ceil(totalUsers / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create or update a user
export async function POST(request) {
  try {
    // const session = await getServerSession();
    
    // // Check if user is authenticated and is admin
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    
    await dbConnect();
    
    const userData = await request.json();
    
    if (!userData.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if updating or creating
    if (userData._id) {
      // Update existing user
      const updatedUser = await User.findByIdAndUpdate(
        userData._id,
        { $set: userData },
        { new: true }
      ).select('-password');
      
      return NextResponse.json(updatedUser);
    } else {
      // Create new user
      if (!userData.password) {
        return NextResponse.json(
          { error: 'Password is required for new users' },
          { status: 400 }
        );
      }
      
      const newUser = new User(userData);
      await newUser.save();
      
      // Return user without password
      const createdUser = newUser.toObject();
      delete createdUser.password;
      
      return NextResponse.json(createdUser);
    }
    
  } catch (error) {
    console.error('Error creating/updating user:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}