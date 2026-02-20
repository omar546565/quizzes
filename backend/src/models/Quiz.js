const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    name: { type: String, required: true },
    day: { type: Number, required: true },
    questions: [{
        text: String,
        correctAnswer: String,
        options: [String]
    }],
    participations: {
        teamA: {
            teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
            score: { type: Number, default: 0 },
            activeContestants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contestant' }]
        },
        teamB: {
            teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
            score: { type: Number, default: 0 },
            activeContestants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contestant' }]
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
