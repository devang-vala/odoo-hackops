import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Comment from "@/models/Comment"
import User from "@/models/User"
import Answer from "@/models/Answer"
import Question from "@/models/Question"

export async function GET(request, context) {
  try {
    await dbConnect()
    // Await params before accessing properties
    const { params } = await context
    const { id } = await params

    const { searchParams } = new URL(request.url)
    const answerId = id
    const filter = searchParams.get("filter") || "newest"
    const userId = searchParams.get("userId") // For "mine" filter

    const query = { answer: answerId }
    let sortOptions = {}

    // Apply filters
    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 }
        break
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "mine":
        if (!userId) {
          return NextResponse.json({ error: 'User ID required for "mine" filter' }, { status: 400 })
        }
        query.author = userId
        sortOptions = { createdAt: -1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }

    // Get comments with author information
    const comments = await Comment.find(query)
      .populate("author", "username name")
      .sort(sortOptions)
      .lean()

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error fetching answer comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request, context) {
  try {
    await dbConnect()
    // Await params before accessing properties
    const { params } = await context
    const { id } = await params

    const answerId = id
    const { content, authorId } = await request.json()

    if (!content || !authorId) {
      return NextResponse.json({ error: "Content and author ID are required" }, { status: 400 })
    }

    const comment = new Comment({
      content,
      author: authorId,
      answer: answerId
    })

    await comment.save()

    // Populate author information for response
    await comment.populate("author", "username name")

    // Create notifications
    try {
      const answer = await Answer.findById(answerId).populate("author", "username name")
      const question = await Question.findById(answer.question).populate("author", "username name")

      // Import your notification functions
      const { notifyAnswerCommented, notifyMention, extractMentions } = await import("@/lib/notifications")

      // Notify answer author (if different from comment author)
      if (answer && answer.author._id.toString() !== authorId) {
        await notifyAnswerCommented(
          answer.author._id,
          comment.author.username || comment.author.name || 'User',
          question.title,
          answer.question,
        )
      }

      // Check for mentions and notify mentioned users
      const mentions = extractMentions(content)
      for (const username of mentions) {
        try {
          const mentionedUser = await User.findOne({ username })
          if (mentionedUser && mentionedUser._id.toString() !== authorId) {
            await notifyMention(
              mentionedUser._id,
              comment.author.username || comment.author.name || 'User',
              content,
              answer.question,
            )
          }
        } catch (error) {
          console.error("Error processing mention:", error)
        }
      }
    } catch (error) {
      console.error("Error creating notifications:", error)
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Error creating answer comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
