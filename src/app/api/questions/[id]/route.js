import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Question from "@/models/Question"

export async function GET(req, context) {
  try {
    // Await params before accessing properties
    const { params } = await context
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the question and populate author details and answers
    const question = await Question.findById(id)
      .populate("author", "name email") // Populate basic author info
      .lean()

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Convert MongoDB _id to string for JSON serialization
    question._id = question._id.toString()

    if (question.author && question.author._id) {
      question.author._id = question.author._id.toString()
    }

    // Convert answer IDs to strings and format answers
    if (question.answers && question.answers.length > 0) {
      question.answers = question.answers.map((answer) => {
        const formattedAnswer = {
          ...answer,
          _id: answer._id.toString(),
        }

        if (answer.author && answer.author._id) {
          formattedAnswer.author = {
            ...answer.author,
            _id: answer.author._id.toString(),
          }
        }

        return formattedAnswer
      })
    }

    // Add current time for debugging/tracking
    question.requestedAt = new Date().toISOString()

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
