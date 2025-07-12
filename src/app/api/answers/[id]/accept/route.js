import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Answer from "@/models/Answer"
import Question from "@/models/Question"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { notifyAnswerAccepted } from "@/lib/notifications"

export async function PUT(request, context) {
  try {
    await dbConnect()

    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params before accessing properties
    const { params } = await context
    const { id } = await params
    const answerId = id

    // Get the answer and its question
    const answer = await Answer.findById(answerId)
      .populate("question")
      .populate("author", "username")
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })
    }

    // Check if the user is the question author
    if (answer.question.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only the question author can accept answers" }, { status: 403 })
    }

    // Unaccept all other answers for this question
    await Answer.updateMany({ question: answer.question._id }, { isAccepted: false })

    // Accept this answer
    answer.isAccepted = true
    await answer.save()

    // Update the question to mark it as answered
    await Question.findByIdAndUpdate(answer.question._id, {
      hasAcceptedAnswer: true,
      acceptedAnswer: answerId,
    })

    // Create notification for answer author
    try {
      const questionAuthor = await User.findById(session.user.id)
      if (questionAuthor && answer.author._id.toString() !== session.user.id) {
        await notifyAnswerAccepted(
          answer.author._id,
          questionAuthor.username || questionAuthor.name,
          answer.question.title,
          answer.question._id
        )
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    }

    return NextResponse.json({
      success: true,
      message: "Answer accepted successfully",
      answer: {
        _id: answer._id,
        isAccepted: answer.isAccepted,
      },
    })
  } catch (error) {
    console.error("Error accepting answer:", error)
    return NextResponse.json({ error: "Failed to accept answer" }, { status: 500 })
  }
}
