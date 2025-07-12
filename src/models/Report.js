import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending'
  },
  resolution: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent mongoose from pluralizing the collection name
const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

export default Report;