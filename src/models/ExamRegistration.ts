import mongoose from 'mongoose';

const examRegistrationSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['대기중', '승인됨', '거부됨'],
    default: '대기중',
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
  },
});

export default mongoose.models.ExamRegistration || mongoose.model('ExamRegistration', examRegistrationSchema); 