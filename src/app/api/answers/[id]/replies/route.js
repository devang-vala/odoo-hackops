import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Reply from '@/models/Reply';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';
import { notifyAnswerReplied, notifyMention, extractMentions } from '@/lib/notifications';

export async function GET(request, context) {
  try {
    await dbConnect();
    const { params } = await context;
    
    const answerId = params.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'newest';
    const userId = searchParams.get('userId'); // For "mine" filter

    let query = { answer: answerId };
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

    // Get replies with author information
    const replies = await Reply.find(query)
      .populate('author', 'username name')
      .sort(sortOptions)
      .lean();

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    await dbConnect();
    const { params } = await context;
    
    const answerId = params.id;
    const { content, authorId } = await request.json();

    if (!content || !authorId) {
      return NextResponse.json({ error: 'Content and author ID are required' }, { status: 400 });
    }

    const reply = new Reply({
      content,
      author: authorId,
      answer: answerId
    });

    await reply.save();

    // Add reply to answer's replies array
    await Answer.findByIdAndUpdate(answerId, {
      $push: { replies: reply._id }
    });

    // Populate author information for response
    await reply.populate('author', 'username');

    // Create notifications
    try {
      const answer = await Answer.findById(answerId).populate('author', 'username');
      const question = await Question.findById(answer.question).populate('author', 'username');
      
      // Notify answer author (if different from reply author)
      if (answer && answer.author._id.toString() !== authorId) {
        await notifyAnswerReplied(
          answer.author._id,
          reply.author.username,
          question.title,
          question._id
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
              reply.author.username,
              content,
              question._id
            );
          }
        } catch (error) {
          console.error('Error processing mention:', error);
        }
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
    }

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
