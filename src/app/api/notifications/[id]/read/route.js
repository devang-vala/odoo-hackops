import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Notification from '@/models/Notification';
import { pusher, CHANNELS, EVENTS } from '@/lib/pusher';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const notificationId = params.id;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Trigger real-time update via Pusher
    try {
      await pusher.trigger(
        CHANNELS.USER_NOTIFICATIONS(notification.user),
        EVENTS.NOTIFICATION_READ,
        {
          notificationId: notification._id,
          userId: notification.user
        }
      );
    } catch (error) {
      console.error('Error triggering Pusher event:', error);
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
} 