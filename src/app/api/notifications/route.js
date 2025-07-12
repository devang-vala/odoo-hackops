import { NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import { dbConnect } from '@/lib/db';
import { pusher, CHANNELS, EVENTS } from '@/lib/pusher';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 20;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get notifications for the user, sorted by newest first
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const { user, type, message, link } = await request.json();

    if (!user || !type || !message) {
      return NextResponse.json({ error: 'User, type, and message are required' }, { status: 400 });
    }

    const notification = new Notification({
      user,
      type,
      message,
      link,
      isRead: false
    });

    await notification.save();

    // Trigger real-time notification via Pusher
    try {
      await pusher.trigger(
        CHANNELS.USER_NOTIFICATIONS(notification.user),
        EVENTS.NEW_NOTIFICATION,
        {
          notification: {
            _id: notification._id,
            type: notification.type,
            message: notification.message,
            link: notification.link,
            isRead: notification.isRead,
            createdAt: notification.createdAt
          }
        }
      );
    } catch (error) {
      console.error('Error triggering Pusher event:', error);
    }

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
} 