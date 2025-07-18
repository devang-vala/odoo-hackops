import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Comment from '@/models/Comment';
import User from '@/models/User';
import Question from '@/models/Question';
import { notifyQuestionCommented, notifyMention, extractMentions } from '@/lib/notifications';

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

    // Get comments with author information
    const comments = await Comment.find(query)
      .populate('author', 'username name')
      .sort(sortOptions)
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
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

    const comment = new Comment({
      content,
      author: authorId,
      question: questionId
    });

    await comment.save();

    // Populate author information for response
    await comment.populate('author', 'username name');

    // Create notifications
    try {
      const question = await Question.findById(questionId).populate('author', 'username');
      
      // Notify question author (if different from comment author)
      if (question && question.author._id.toString() !== authorId) {
        await notifyQuestionCommented(
          question.author._id,
          comment.author.username || comment.author.name || 'User',
          question.title,
          questionId
        );
      }

      // Check for mentions and notify mentioned users
      const mentions = extractMentions(content);
      for (const username of mentions) {
        try {
          const mentionedUser = await User.findOne({ username });
          if (mentionedUser && mentionedUser._id.toString() !== authorId) {
            await notifyMention(
              mentionedUser._id,
              comment.author.username || comment.author.name || 'User',
              content,
              questionId
            );
          }
        } catch (error) {
          console.error('Error processing mention:', error);
        }
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
