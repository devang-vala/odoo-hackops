import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Vote from '@/models/Vote';
import Question from '@/models/Question';
import Answer from '@/models/Answer';

export async function POST(request) {
  try {
    await dbConnect();
    const { type, itemId, userId, value } = await request.json();
    if (!type || !itemId || !userId || typeof value !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check if user has already voted
    const existingVote = await Vote.findOne({
      user: userId,
      [type]: itemId
    });
    let userVote = 0;
    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        await Vote.deleteOne({ _id: existingVote._id });
        userVote = 0;
      } else {
        // Change vote
        existingVote.value = value;
        await existingVote.save();
        userVote = value;
      }
    } else {
      // New vote
      const voteData = { user: userId, value };
      if (type === 'question') voteData.question = itemId;
      else if (type === 'answer') voteData.answer = itemId;
      await new Vote(voteData).save();
      userVote = value;
    }
    // Update vote count on the item
    const voteCount = await Vote.aggregate([
      { $match: { [type]: itemId } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const totalVotes = voteCount.length > 0 ? voteCount[0].total : 0;
    // Update the item's vote count
    if (type === 'question') {
      await Question.findByIdAndUpdate(itemId, { votes: totalVotes });
    } else if (type === 'answer') {
      await Answer.findByIdAndUpdate(itemId, { votes: totalVotes });
    }
    return NextResponse.json({ success: true, totalVotes, userVote });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');
    if (!type || !itemId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    // Get user's vote on this item
    const vote = await Vote.findOne({ user: userId, [type]: itemId });
    // Get total vote count
    const voteCount = await Vote.aggregate([
      { $match: { [type]: itemId } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const totalVotes = voteCount.length > 0 ? voteCount[0].total : 0;
    return NextResponse.json({ userVote: vote ? vote.value : 0, totalVotes });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
} 