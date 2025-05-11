import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // 예: '순경 -> 경장', '경장 -> 경사' 등
  },
  password: {
    type: String,
    required: true,
  },
  questions: [{
    questionNumber: Number,
    questionType: {
      type: String,
      enum: ['OX', '객관식', '서술형'],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: [{
      text: String,
      isCorrect: Boolean,
    }],
    correctAnswer: String, // OX 문제나 서술형의 경우 정답 또는 채점 기준
    points: {
      type: Number,
      required: true,
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// 업데이트 시 updatedAt 자동 갱신
examSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

export default mongoose.models.Exam || mongoose.model('Exam', examSchema); 