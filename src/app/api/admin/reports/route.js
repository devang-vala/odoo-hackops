import { dbConnect } from '@/lib/db';
import { NextResponse } from 'next/server';
import Report from '@/models/Report';
import { getServerSession } from 'next-auth/next';

// Get reports with pagination and filtering
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
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    await dbConnect();
    
    // Build query based on status filter
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;
    
    // Get reports with pagination and populate references
    const reports = await Report.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'name email')
      .populate('questionId', 'title')
      .populate('answerId', 'content');
    
    // Get total count for pagination
    const totalReports = await Report.countDocuments(query);
    
    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        totalReports,
        totalPages: Math.ceil(totalReports / limit),
        hasMore: page < Math.ceil(totalReports / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}