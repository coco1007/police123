import mongoose from 'mongoose';

const examSubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  answers: {
    type: Map,
    of: String,
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const ExamSubmission = mongoose.models.ExamSubmission || mongoose.model('ExamSubmission', examSubmissionSchema);

export default ExamSubmission; 