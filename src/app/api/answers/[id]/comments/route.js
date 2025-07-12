import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const answerId = params.id;
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

    // Get comments with author information and populate replies
    const comments = await Comment.find(query)
      .populate('author', 'username')
      .populate('parentComment')
      .sort(sortOptions)
      .lean();

    // Organize comments into a threaded structure
    const threadedComments = organizeThreadedComments(comments);

    return NextResponse.json({ comments: threadedComments });
  } catch (error) {
    console.error('Error fetching answer comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const answerId = params.id;
    const { content, authorId, parentCommentId } = await request.json();

    if (!content || !authorId) {
      return NextResponse.json({ error: 'Content and author ID are required' }, { status: 400 });
    }

    const comment = new Comment({
      content,
      author: authorId,
      answer: answerId,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Populate author information for response
    await comment.populate('author', 'username');
    if (parentCommentId) {
      await comment.populate('parentComment');
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// Helper function to organize comments into a threaded structure
function organizeThreadedComments(comments) {
  const commentMap = new Map();
  const rootComments = [];

  // First pass: create a map of all comments
  comments.forEach(comment => {
    commentMap.set(comment._id.toString(), { ...comment, replies: [] });
  });

  // Second pass: organize into threaded structure
  comments.forEach(comment => {
    const commentObj = commentMap.get(comment._id.toString());
    
    if (comment.parentComment) {
      // This is a reply to another comment
      const parentComment = commentMap.get(comment.parentComment.toString());
      if (parentComment) {
        parentComment.replies.push(commentObj);
      }
    } else {
      // This is a root comment
      rootComments.push(commentObj);
    }
  });

  return rootComments;
} 