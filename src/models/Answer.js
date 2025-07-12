import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  content:  { type: String, required: true }, // Rich text HTML
  author:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  votes:    { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
  hasProfanity: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  replies:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
}, { timestamps: true });

// Middleware to update user's answersGiven count when a new answer is created
answerSchema.pre('save', async function(next) {
  // Only increment counter when document is new (not on updates)
  if (this.isNew) {
    try {
      // Import User model dynamically to avoid circular dependency
      const User = mongoose.model('User');
      
      // Increment the answersGiven counter for the author
      await User.findByIdAndUpdate(
        this.author,
        { $inc: { answersGiven: 1 } }
      );
      
      console.log(`Updated answersGiven counter for user ${this.author}`);
    } catch (error) {
      console.error('Error updating user answersGiven count:', error);
      // Continue with save operation even if counter update fails
    }
  }
  next();
});

// Middleware to decrement user's answersGiven count when an answer is deleted
answerSchema.pre('deleteOne', { document: true }, async function(next) {
  try {
    // Import User model dynamically
    const User = mongoose.model('User');
    
    // Decrement the answersGiven counter for the author
    await User.findByIdAndUpdate(
      this.author,
      { $inc: { answersGiven: -1 } }
    );
    
    console.log(`Decremented answersGiven counter for user ${this.author}`);
  } catch (error) {
    console.error('Error updating user answersGiven count on delete:', error);
  }
  next();
});

// Static method to safely delete an answer and update counters
answerSchema.statics.safeDelete = async function(answerId) {
  try {
    const answer = await this.findById(answerId);
    if (!answer) return null;
    
    // Import User model dynamically
    const User = mongoose.model('User');
    
    // Decrement the user's answersGiven counter
    await User.findByIdAndUpdate(
      answer.author,
      { $inc: { answersGiven: -1 } }
    );
    
    // Now delete the answer
    return await this.findByIdAndDelete(answerId);
  } catch (error) {
    console.error('Error in safeDelete:', error);
    throw error;
  }
};

// Static method to bulk update user answer counts (for admin/maintenance)
answerSchema.statics.recalculateUserAnswerCounts = async function() {
  try {
    const User = mongoose.model('User');
    
    // Get counts of answers per user
    const answerCounts = await this.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);
    
    // Update each user with their correct count
    for (const { _id, count } of answerCounts) {
      await User.findByIdAndUpdate(_id, { answersGiven: count });
    }
    
    // Reset count to 0 for users who have no answers
    await User.updateMany(
      { _id: { $nin: answerCounts.map(item => item._id) } },
      { answersGiven: 0 }
    );
    
    return { success: true, usersUpdated: answerCounts.length };
  } catch (error) {
    console.error('Error recalculating user answer counts:', error);
    throw error;
  }
};

// Log answer activity for debugging
answerSchema.post('save', function(doc) {
  console.log(`Answer ${doc._id} saved at ${new Date().toISOString()}`);
  console.log(`User: devang-vala`);
});

const Answer = mongoose.models.Answer || mongoose.model("Answer", answerSchema);

export default Answer;