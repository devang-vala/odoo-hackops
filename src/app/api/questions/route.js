import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/db';
import Question from '@/models/Question';
import User from '@/models/User';
import Tag from '@/models/Tag';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function checkProfanity(text) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined.");
    return { hasProfanity: true }; // Fail-safe default
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a profanity detector.

Respond with ONLY 'true' if the following text contains any profanity, offensive, or inappropriate language.
Respond with ONLY 'false' if the text is clean.

Text: """${text}"""
`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().toLowerCase().trim();

    const hasProfanity = rawText.includes('true');
    return { hasProfanity };
  } catch (error) {
    console.error("Error checking profanity with Gemini API:", error);
    return { hasProfanity: true }; // Safe fallback on error
  }
}


export async function POST(req) {
  try {
    // Get the session to ensure the user is authenticated
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await dbConnect();
    
    // Parse the request body
    const { title, description, tags, author } = await req.json();
    
    // Validate required fields
    if (!title || !description || !tags || !author) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Perform profanity check
    const { hasProfanity } = await checkProfanity(`${title} ${description}`);
    
    // Set isApproved based on profanity check
    const isApproved = !hasProfanity;
    
    // Create the question
    const question = await Question.create({
      title,
      description,
      tags,
      author,
      hasProfanity,
      isApproved,
    });
    
    // Update user's questionsAsked count
    await User.findByIdAndUpdate(
      author,
      { $inc: { questionsAsked: 1 } }
    );
    
    // Update or create tags
    for (const tagName of tags) {
      await Tag.findOneAndUpdate(
        { name: tagName },
        { name: tagName },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.json({
      message: 'Question created successfully',
      id: question._id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ message: error.message || 'An error occurred' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    
    // Parse query parameters for pagination, sorting, and filtering
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');
    
    // Connect to the database
    await dbConnect();
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Build query object
    const query = {};
    
    // Add tag filter if provided
    if (tag) {
      query.tags = tag;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Build sort object
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const questions = await Question.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();
    
    // Get total count for pagination
    const totalQuestions = await Question.countDocuments(query);
    
    // Format the response
    const formattedQuestions = questions.map(question => ({
      ...question,
      _id: question._id.toString(),
      author: question.author ? {
        ...question.author,
        _id: question.author._id.toString()
      } : null,
      answers: question.answers ? question.answers.map(answer => 
        typeof answer === 'object' ? { ...answer, _id: answer._id.toString() } : answer.toString()
      ) : [],
      createdAt: question.createdAt ? question.createdAt.toISOString() : null,
      updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
    }));
    
    return NextResponse.json({
      questions: formattedQuestions,
      pagination: {
        page,
        limit,
        totalQuestions,
        totalPages: Math.ceil(totalQuestions / limit),
        hasMore: page < Math.ceil(totalQuestions / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}