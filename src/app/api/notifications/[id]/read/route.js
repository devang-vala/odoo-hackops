import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Notification from "@/models/Notification"
import { pusher, CHANNELS, EVENTS } from "@/lib/pusher"

export async function PUT(request, context) {
  try {
    await dbConnect()

    const { params } = await context
    const { id } = await params

    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Trigger real-time update via Pusher
    try {
      await pusher.trigger(
        CHANNELS.USER_NOTIFICATIONS(notification.user),
        EVENTS.NOTIFICATION_READ,
        {
          notificationId: id,
          userId: notification.user
        }
      );
    } catch (error) {
      console.error('Error triggering Pusher notification read event:', error);
    }

    return NextResponse.json({
      success: true,
      notification,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
