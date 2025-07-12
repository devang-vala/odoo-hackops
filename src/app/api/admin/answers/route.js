import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/db';
import Answer from '@/models/Answer';

export async function GET() {
  try {
    // const session = await getServerSession();
    
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    await dbConnect();

    const allAnswers = await Answer.find({})
      .populate('author', 'name email')
      .populate('question', 'title') // Populate question title for context
      .sort({ createdAt: -1 }); // Sort by newest first

    return NextResponse.json(allAnswers);
  } catch (error) {
    console.error('Error fetching all answers for admin:', error);
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
    const { answerId, action } = await req.json();

    if (!answerId || !action) {
      return NextResponse.json({ message: 'Missing answerId or action' }, { status: 400 });
    }

    let updatedAnswer;
    if (action === 'approve') {
      updatedAnswer = await Answer.findByIdAndUpdate(
        answerId,
        { isApproved: true, hasProfanity: false },
        { new: true }
      );
    } else if (action === 'delete') {
      await Answer.findByIdAndDelete(answerId);
      return NextResponse.json({ message: 'Answer deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (!updatedAnswer) {
      return NextResponse.json({ message: 'Answer not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAnswer);
  } catch (error) {
    console.error('Error performing action on answer:', error);
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
    const { answerId } = await req.json(); // Assuming answerId is sent in body for DELETE

    if (!answerId) {
      return NextResponse.json({ message: 'Missing answerId' }, { status: 400 });
    }

    await Answer.findByIdAndDelete(answerId);

    return NextResponse.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
