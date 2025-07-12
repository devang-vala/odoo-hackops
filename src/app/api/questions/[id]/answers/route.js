import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Answer from '@/models/Answer';
import User from '@/models/User';
import Vote from '@/models/Vote';
import Question from '@/models/Question';
import Comment from '@/models/Comment';
import Reply from '@/models/Reply';
import { notifyQuestionAnswered } from '@/lib/notifications';

export async function GET(request, context) {
  try {
    await dbConnect();
    const { params } = await context;
    
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
      .populate('author', 'username name')
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

      // Populate comments and replies for each answer
      const answersWithCommentsAndReplies = await Promise.all(
        answersWithVotes.map(async (answer) => {
          const comments = await Comment.find({ answer: answer._id })
            .populate('author', 'username name')
            .sort({ createdAt: -1 })
            .lean();

          const replies = await Reply.find({ answer: answer._id })
            .populate('author', 'username name')
            .sort({ createdAt: -1 })
            .lean();

          return {
            ...answer,
            comments: comments,
            replies: replies
          };
        })
      );

      return NextResponse.json({ answers: answersWithCommentsAndReplies });
    }

    // Populate comments and replies for each answer
    const answersWithCommentsAndReplies = await Promise.all(
      answers.map(async (answer) => {
        const comments = await Comment.find({ answer: answer._id })
          .populate('author', 'username name')
          .sort({ createdAt: -1 })
          .lean();

        const replies = await Reply.find({ answer: answer._id })
          .populate('author', 'username name')
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...answer,
          comments: comments,
          replies: replies
        };
      })
    );

    return NextResponse.json({ answers: answersWithCommentsAndReplies });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    await dbConnect();
    const { params } = await context;
    
    const questionId = params.id;
    const { content, authorId } = await request.json();

    if (!content || !authorId) {
      return NextResponse.json({ error: 'Content and author ID are required' }, { status: 400 });
    }

    const answer = new Answer({
      content,
      author: authorId,
      question: questionId,
      votes: 0
    });

    await answer.save();

    // Add answer to question's answers array
    await Question.findByIdAndUpdate(questionId, {
      $push: { answers: answer._id }
    });

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
