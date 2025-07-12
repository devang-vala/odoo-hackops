import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/db';
import Question from '@/models/Question';

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // TODO: Add actual admin role check here. Example: if (!session.user.isAdmin) { ... }

    await dbConnect();
    const { id } = params;

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // TODO: Add actual admin role check here. Example: if (!session.user.isAdmin) { ... }

    await dbConnect();
    const { id } = params;
    const { action } = await req.json(); // Expecting { action: 'approve' }

    if (action === 'approve') {
      const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        { isApproved: true },
        { new: true }
      );

      if (!updatedQuestion) {
        return NextResponse.json({ message: 'Question not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Question approved successfully' });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
