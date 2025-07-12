import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Answer from '@/models/Answer';
import User from '@/models/User';
import Vote from '@/models/Vote';
import Question from '@/models/Question';
import { notifyQuestionAnswered } from '@/lib/notifications';
import { checkProfanity } from '../../../questions/route';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const questionId = params.id;
    const filter = searchParams.get('filter') || 'newest';
    const userId = searchParams.get('userId'); // For "mine" filter

    let query = { question: questionId };
    let sortOptions = {};

    // Apply filters
    switch (filter) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'top-voted':
        sortOptions = { votes: -1, createdAt: -1 };
        break;
      case 'mine':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required for "mine" filter' }, { status: 400 });
        }
        query.author = userId;
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Get answers with author information
    const answers = await Answer.find(query)
      .populate('author', 'username')
      .sort(sortOptions)
      .lean();

    // For top-voted filter, we need to calculate actual vote counts
    if (filter === 'top-voted') {
      const answersWithVotes = await Promise.all(
        answers.map(async (answer) => {
          const voteCount = await Vote.aggregate([
            { $match: { answer: answer._id } },
            { $group: { _id: null, total: { $sum: '$value' } } }
          ]);
          
          return {
            ...answer,
            votes: voteCount.length > 0 ? voteCount[0].total : 0
          };
        })
      );

      // Re-sort by actual vote count
      answersWithVotes.sort((a, b) => {
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return NextResponse.json({ answers: answersWithVotes });
    }

    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const questionId = params.id;
    const { content, authorId } = await request.json();

    if (!content || !authorId) {
      return NextResponse.json({ error: 'Content and author ID are required' }, { status: 400 });
    }

    // Perform profanity check
    const { hasProfanity } = await checkProfanity(content);
    const isApproved = !hasProfanity;

    const answer = new Answer({
      content,
      author: authorId,
      question: questionId,
      votes: 0,
      hasProfanity,
      isApproved,
    });

    await answer.save();

    // Populate author information for response
    await answer.populate('author', 'username');

    // Create notification for question author
    try {
      const question = await Question.findById(questionId).populate('author', 'username');
      if (question && question.author._id.toString() !== authorId) {
        await notifyQuestionAnswered(
          question.author._id,
          answer.author.username,
          question.title,
          questionId
        );
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }
} 