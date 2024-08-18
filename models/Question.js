const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true }
}, {
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

// Add an index to the `question` field to improve query performance
QuestionSchema.index({ question: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
