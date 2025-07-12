import { dbConnect } from '@/lib/db';
import Question from '@/models/Question';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }
    
    // Create a case-insensitive regex pattern for search
    const searchRegex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
    
    // Find questions matching the query in title, description, or tags
    // Prioritize by creating a score field
    const questions = await Question.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    })
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
    
    // Add score to each question for prioritization
    const scoredQuestions = questions.map(question => {
      let score = 0;
      
      // Title match has highest priority (score = 3)
      if (searchRegex.test(question.title)) {
        score += 3;
      }
      
      // Description match has medium priority (score = 2)
      if (searchRegex.test(question.description)) {
        score += 2;
      }
      
      // Tag match has lowest priority (score = 1)
      if (question.tags.some(tag => searchRegex.test(tag))) {
        score += 1;
      }
      
      // Format the response
      return {
        _id: question._id,
        title: question.title,
        description: question.description.substring(0, 100) + (question.description.length > 100 ? '...' : ''),
        author: question.author ? question.author.name : 'Anonymous',
        tags: question.tags,
        createdAt: question.createdAt,
        votes: question.votes,
        answers: question.answers?.length || 0,
        score: score,
        // Highlight matched parts with <mark> tags for title
        highlightedTitle: question.title.replace(
          new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'),
          '<mark>$1</mark>'
        )
      };
    });
    
    // Sort by score (descending) to prioritize title > description > tags
    scoredQuestions.sort((a, b) => b.score - a.score);
    
    return NextResponse.json({
      results: scoredQuestions,
      timestamp: new Date().toISOString(),
      query
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}