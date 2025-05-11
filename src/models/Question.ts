import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  explanation: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['형법', '형사소송법', '행정법', '경찰행정법', '경찰실무']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['상', '중', '하']
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
questionSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema); 