import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Notification from '@/models/Notification';
import { pusher, CHANNELS, EVENTS } from '@/lib/pusher';

export async function PUT(request) {
  try {
    await dbConnect();
    
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    // Trigger real-time update via Pusher
    try {
      await pusher.trigger(
        CHANNELS.USER_NOTIFICATIONS(userId),
        EVENTS.ALL_NOTIFICATIONS_READ,
        {
          userId: userId
        }
      );
    } catch (error) {
      console.error('Error triggering Pusher event:', error);
    }

    return NextResponse.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
} 