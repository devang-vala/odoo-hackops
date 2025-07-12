import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Notification from "@/models/Notification"
import User from "@/models/User"

export async function POST(request) {
  try {
    await dbConnect()

    const { user, type, message, link } = await request.json()

    if (!user || !type || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const userExists = await User.findById(user)
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const notification = new Notification({
      user,
      type,
      message,
      link,
      isRead: false,
    })

    await notification.save()

    // Add notification to user's notifications array
    await User.findByIdAndUpdate(user, {
      $push: { notifications: notification._id },
    })

    return NextResponse.json(
      {
        success: true,
        notification: {
          _id: notification._id,
          type: notification.type,
          message: notification.message,
          isRead: notification.isRead,
          link: notification.link,
          createdAt: notification.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const skip = (page - 1) * limit

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalNotifications = await Notification.countDocuments({ user: userId })
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),
        hasMore: page < Math.ceil(totalNotifications / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
