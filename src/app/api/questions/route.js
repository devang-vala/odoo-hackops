import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Question from '@/models/Question';
import User from '@/models/User'; // Assuming you have a User model

export async function GET() {
  await dbConnect();

  try {
    const questions = await Question.find()
      .populate({
        path: 'author',
        model: User,
        select: 'username' // Only fetch the username
      })
      .limit(5)
      .sort({ createdAt: -1 }); // Sort by newest first

    const formattedQuestions = questions.map(question => ({
      id: question._id,
      title: question.title,
      description: question.description,
      tags: question.tags,
      user: question.author ? question.author.username : 'Anonymous',
      answers: question.answers.length, // Count the number of answers
      votes: question.votes,
      time: question.createdAt.toLocaleString(), // Format time as needed
    }));

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ message: "Error fetching questions" }, { status: 500 });
  }
}
