import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/db';
import Question from '@/models/Question';

export async function GET() {
  try {
    // const session = await getServerSession();
    
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    await dbConnect();

    const allQuestions = await Question.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 }); // Sort by newest first

    return NextResponse.json(allQuestions);
  } catch (error) {
    console.error('Error fetching all questions for admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { questionId, action } = await req.json();

    if (!questionId || !action) {
      return NextResponse.json({ message: 'Missing questionId or action' }, { status: 400 });
    }

    let updatedQuestion;
    if (action === 'approve') {
      updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        { isApproved: true, hasProfanity: false },
        { new: true }
      );
    } else if (action === 'delete') {
      await Question.findByIdAndDelete(questionId);
      return NextResponse.json({ message: 'Question deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (!updatedQuestion) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error performing action on question:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { questionId } = await req.json(); // Assuming questionId is sent in body for DELETE

    if (!questionId) {
      return NextResponse.json({ message: 'Missing questionId' }, { status: 400 });
    }

    await Question.findByIdAndDelete(questionId);

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
