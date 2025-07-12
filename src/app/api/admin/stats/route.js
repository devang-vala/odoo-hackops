import { dbConnect } from '@/lib/db';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import Question from '@/models/Question';
import Report from '@/models/Report';
import { getServerSession } from 'next-auth/next';

// Get admin dashboard statistics
export async function GET(request) {
  try {
    // const session = await getServerSession();
    
    // // Check if user is authenticated and is admin
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }
    
    await dbConnect();
    
    // Get total users count
    const totalUsers = await User.countDocuments({});
    
    // Get total questions count
    const totalQuestions = await Question.countDocuments({});
    
    // Get pending reports count
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    // Get daily active users (users who logged in within the last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const dailyActiveUsers = await User.countDocuments({
      lastLogin: { $gte: oneDayAgo }
    });

    return NextResponse.json({
      totalUsers,
      totalQuestions,
      pendingReports,
      dailyActiveUsers,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}