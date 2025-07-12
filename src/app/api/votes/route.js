import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Vote from '@/models/Vote';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await dbConnect();
    const { type, itemId, userId, value } = await request.json();

    // Convert to ObjectId
    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!type || !itemId || !userId || typeof value !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['question', 'answer'].includes(type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }
    if (![1, -1].includes(value)) {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      user: userObjectId,
      [type]: itemObjectId
    });
    let userVote = 0;
    if (existingVote) {
      if (existingVote.value === value) {
        await Vote.deleteOne({ _id: existingVote._id });
        userVote = 0;
      } else {
        existingVote.value = value;
        await existingVote.save();
        userVote = value;
      }
    } else {
      const voteData = { user: userObjectId, value };
      if (type === 'question') voteData.question = itemObjectId;
      else if (type === 'answer') voteData.answer = itemObjectId;
      await new Vote(voteData).save();
      userVote = value;
    }
    // Update vote count on the item
    const voteCount = await Vote.aggregate([
      { $match: { [type]: itemObjectId } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const totalVotes = voteCount.length > 0 ? voteCount[0].total : 0;
    // Update the item's vote count
    if (type === 'question') {
      await Question.findByIdAndUpdate(itemObjectId, { votes: totalVotes });
    } else if (type === 'answer') {
      await Answer.findByIdAndUpdate(itemObjectId, { votes: totalVotes });
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
    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    // Get user's vote on this item
    const vote = await Vote.findOne({ user: userObjectId, [type]: itemObjectId });
    // Get total vote count
    const voteCount = await Vote.aggregate([
      { $match: { [type]: itemObjectId } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    const totalVotes = voteCount.length > 0 ? voteCount[0].total : 0;
    return NextResponse.json({ userVote: vote ? vote.value : 0, totalVotes });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
} 