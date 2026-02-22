const mongoose = require('mongoose');

const infoQuestionSchema = new mongoose.Schema({
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'InfoModel', required: true },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('InfoQuestion', infoQuestionSchema);
