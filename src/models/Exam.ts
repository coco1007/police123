import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['ox', 'multiple', 'essay'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  points: {
    type: Number,
    required: true
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questions: {
    type: [questionSchema],
    select: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  codeExpiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);

export default Exam; 